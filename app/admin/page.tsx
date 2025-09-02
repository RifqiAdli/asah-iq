'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, BookOpen, Trophy, Plus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalGames: number;
  totalCategories: number;
  recentUsers: any[];
  popularCategories: any[];
}

export default function AdminPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalGames: 0,
    totalCategories: 0,
    recentUsers: [],
    popularCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (profile?.role !== 'admin') {
      toast.error('Akses ditolak. Anda bukan admin.');
      router.push('/dashboard');
      return;
    }

    fetchAdminStats();
  }, [user, profile, router]);

  const fetchAdminStats = async () => {
    try {
      // Fetch total counts
      const [
        { count: totalUsers },
        { count: totalQuestions },
        { count: totalGames },
        { count: totalCategories }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('game_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch popular categories
      const { data: popularCategories } = await supabase
        .from('categories')
        .select(`
          *,
          questions(count)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        totalQuestions: totalQuestions || 0,
        totalGames: totalGames || 0,
        totalCategories: totalCategories || 0,
        recentUsers: recentUsers || [],
        popularCategories: popularCategories || []
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Gagal memuat statistik admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">Asah IQ Admin</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/admin" className="text-primary font-medium">
                Admin
              </Link>
              <Badge variant="secondary">Administrator</Badge>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Kelola platform Asah IQ</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">Soal tersedia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">Game dimainkan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">Kategori aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/questions">
            <Card className="game-card border-0 shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Kelola Soal</h3>
                <p className="text-gray-600 text-sm">Tambah, edit, atau hapus soal quiz</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/categories">
            <Card className="game-card border-0 shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Kategori</h3>
                <p className="text-gray-600 text-sm">Atur kategori dan tingkat kesulitan</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="game-card border-0 shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">User Management</h3>
                <p className="text-gray-600 text-sm">Kelola pengguna dan permissions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="game-card border-0 shadow-lg cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Analytics</h3>
                <p className="text-gray-600 text-sm">Statistik dan laporan platform</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Pengguna Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || user.username}</p>
                      <p className="text-sm text-gray-500">{user.username}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span>Kategori Populer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.questions?.[0]?.count || 0}</p>
                      <p className="text-xs text-gray-500">soal</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}