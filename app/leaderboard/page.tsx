'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Trophy, Crown, Medal, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string;
  total_points: number;
  games_played: number;
  current_level: number;
  average_score: number;
  rank: number;
}

interface CategoryLeaderboard {
  category_id: number;
  category_name: string;
  entries: LeaderboardEntry[];
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState<CategoryLeaderboard[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchLeaderboards();
  }, [user, router]);

  const fetchLeaderboards = async () => {
    try {
      // Fetch global leaderboard
      const { data: globalData } = await supabase
        .from('profiles')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      if (globalData) {
        const globalLeaderboardWithRanks = globalData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
          average_score: entry.games_played > 0 ? Math.round((entry.total_points / entry.games_played) * 10) : 0
        }));

        setGlobalLeaderboard(globalLeaderboardWithRanks);

        // Find user's rank
        const userRankIndex = globalLeaderboardWithRanks.findIndex(entry => entry.id === user?.id);
        if (userRankIndex !== -1) {
          setUserRank(userRankIndex + 1);
        }
      }

      // Fetch categories for category leaderboards
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      if (categories) {
        const categoryLeaderboards: CategoryLeaderboard[] = [];

        for (const category of categories) {
          // Get game sessions for this category
          const { data: sessions } = await supabase
            .from('game_sessions')
            .select(`
              user_id,
              score,
              profiles(id, username, full_name, total_points, current_level)
            `)
            .eq('category_id', category.id)
            .order('score', { ascending: false });

          if (sessions) {
            // Calculate category-specific stats
            const userStats = new Map();
            
            sessions.forEach((session: any) => {
              const userId = session.user_id;
              if (!userStats.has(userId)) {
                userStats.set(userId, {
                  profile: session.profiles,
                  totalScore: 0,
                  gameCount: 0,
                  bestScore: 0
                });
              }
              
              const stats = userStats.get(userId);
              stats.totalScore += session.score;
              stats.gameCount += 1;
              stats.bestScore = Math.max(stats.bestScore, session.score);
            });

            const categoryEntries = Array.from(userStats.values())
              .map((stats: any, index) => ({
                id: stats.profile.id,
                username: stats.profile.username,
                full_name: stats.profile.full_name,
                total_points: stats.profile.total_points,
                games_played: stats.gameCount,
                current_level: stats.profile.current_level,
                average_score: Math.round(stats.totalScore / stats.gameCount),
                rank: index + 1
              }))
              .sort((a, b) => b.average_score - a.average_score)
              .slice(0, 20);

            categoryLeaderboards.push({
              category_id: category.id,
              category_name: category.name,
              entries: categoryEntries
            });
          }
        }

        setCategoryLeaderboards(categoryLeaderboards);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
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
              <span className="font-bold text-xl text-gray-900">Asah IQ</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/quiz" className="text-gray-700 hover:text-primary transition-colors">
                Quiz
              </Link>
              <Link href="/leaderboard" className="text-primary font-medium">
                Leaderboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-gray-600">
            Pemain terbaik di platform Asah IQ
          </p>
          {userRank && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Ranking Anda: #{userRank}
              </Badge>
            </div>
          )}
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96 mx-auto">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="categories">Per Kategori</TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>Ranking Global</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalLeaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                        entry.id === user?.id ? 'bg-primary/5 border-primary' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {(entry.full_name || entry.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {entry.full_name || entry.username}
                            {entry.id === user?.id && (
                              <span className="text-primary text-sm ml-2">(Anda)</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">@{entry.username}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-lg">{entry.total_points.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Level {entry.current_level}</span>
                          <span>•</span>
                          <span>{entry.games_played} games</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Leaderboards */}
          <TabsContent value="categories">
            <div className="space-y-6">
              {categoryLeaderboards.map((categoryData) => (
                <Card key={categoryData.category_id}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      🎯 {categoryData.category_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryData.entries.slice(0, 10).map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            entry.id === user?.id ? 'bg-primary/5 border border-primary' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              {getRankBadge(entry.rank)}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {(entry.full_name || entry.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {entry.full_name || entry.username}
                                {entry.id === user?.id && <span className="text-primary ml-1">(Anda)</span>}
                              </p>
                              <p className="text-xs text-gray-500">{entry.games_played} games</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{entry.average_score}%</p>
                            <p className="text-xs text-gray-500">avg score</p>
                          </div>
                        </div>
                      ))}

                      {categoryData.entries.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p>Belum ada yang bermain di kategori ini</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {categoryLeaderboards.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500 mb-2">Belum ada data kategori</p>
                    <p className="text-sm text-gray-400">Mulai bermain untuk melihat ranking per kategori</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ingin Naik Ranking?</h2>
              <p className="text-blue-100 mb-6">
                Mainkan lebih banyak quiz untuk meningkatkan skor dan naik ke peringkat teratas!
              </p>
              <Link href="/quiz">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Mulai Quiz Sekarang
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}