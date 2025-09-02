'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const profileCache = useRef<Map<string, any>>(new Map());
  const fetchingProfile = useRef<string | null>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimized profile fetcher with caching dan debouncing
  const fetchProfile = useCallback(async (userId: string) => {
    if (!mounted) return;

    // Cek cache dulu
    if (profileCache.current.has(userId)) {
      setProfile(profileCache.current.get(userId));
      return;
    }

    // Cegah multiple fetch untuk user yang sama
    if (fetchingProfile.current === userId) {
      return;
    }

    fetchingProfile.current = userId;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        profileCache.current.set(userId, data);
        if (mounted) setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
        // Jika profile tidak ada, buat profile baru otomatis
        if (error.code === 'PGRST116') {
          await createMissingProfile(userId);
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      fetchingProfile.current = null;
    }
  }, [mounted]);

  // Auto create profile jika tidak ada
  const createMissingProfile = async (userId: string) => {
    if (!mounted) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: userData.user.email?.split('@')[0] || 'user',
          full_name: userData.user.user_metadata?.full_name || '',
          role: 'user',
          total_points: 0,
          games_played: 0,
          current_level: 1,
        })
        .select()
        .single();

      if (data && !error && mounted) {
        profileCache.current.set(userId, data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error creating missing profile:', error);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    let cleanup = false;

    // Get initial session dengan timeout
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (cleanup) return;

        if (error) {
          console.error('Session error:', error);
          if (!cleanup) setLoading(false);
          return;
        }

        if (!cleanup) setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile secara async tanpa blocking
          fetchProfile(session.user.id).finally(() => {
            if (!cleanup) setLoading(false);
          });
        } else {
          if (!cleanup) setLoading(false);
        }
      } catch (error) {
        console.error('Get session error:', error);
        if (!cleanup) setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cleanup) return;

        console.log('Auth state change:', event);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Untuk sign in yang baru, langsung fetch profile
          if (event === 'SIGNED_IN') {
            await fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
          profileCache.current.clear();
        }
        
        if (!cleanup) setLoading(false);
      }
    );

    return () => {
      cleanup = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile, mounted]);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    if (!mounted) return { error: 'Component not mounted' };

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create profile dengan retry logic
        const createProfile = async (retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user!.id,
                  username,
                  full_name: fullName,
                  role: 'user',
                  total_points: 0,
                  games_played: 0,
                  current_level: 1,
                });

              if (!profileError) {
                // Cache the new profile
                const newProfile = {
                  id: data.user!.id,
                  username,
                  full_name: fullName,
                  role: 'user',
                  total_points: 0,
                  games_played: 0,
                  current_level: 1,
                };
                profileCache.current.set(data.user!.id, newProfile);
                if (mounted) setProfile(newProfile);
                break;
              }

              if (i === retries - 1) {
                return { error: profileError.message };
              }

              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err: any) {
              if (i === retries - 1) {
                return { error: err.message };
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          return {};
        };

        const profileResult = await createProfile();
        if (profileResult?.error) {
          return profileResult;
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!mounted) return { error: 'Component not mounted' };

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Profile akan di-fetch otomatis oleh auth state change listener
      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      // Loading akan di-set false oleh auth state change
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, 100);
    }
  };

  const signOut = async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      profileCache.current.clear();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user || !mounted) return { error: 'Not authenticated or not mounted' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update cache
      const currentProfile = profileCache.current.get(user.id);
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...updates };
        profileCache.current.set(user.id, updatedProfile);
        if (mounted) setProfile(updatedProfile);
      } else {
        await fetchProfile(user.id);
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  // Don't render provider until mounted
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
