'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, Target, Zap, Star, Play, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalGames: number;
  averageScore: number;
  currentRank: number;
  totalPoints: number;
  recentGames: any[];
  achievements: any[];
}

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    averageScore: 0,
    currentRank: 0,
    totalPoints: 0,
    recentGames: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardStats();
  }, [user, router]);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      // Fetch game sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate stats
      const totalGames = sessions?.length || 0;
      const averageScore = sessions?.length 
        ? Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length)
        : 0;

      // Fetch user achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            name,
            description,
            icon,
            points
          )
        `)
        .eq('user_id', user.id);

      setStats({
        totalGames,
        averageScore,
        currentRank: 1, // TODO: Calculate actual rank
        totalPoints: profile?.total_points || 0,
        recentGames: sessions || [],
        achievements: achievements || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const currentLevel = profile?.current_level || 1;
  const pointsForNextLevel = currentLevel * 1000;
  const currentLevelProgress = ((profile?.total_points || 0) % 1000) / 10;

  if (!user || loading) {
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
              <Link href="/dashboard" className="text-primary font-medium">
                Dashboard
              </Link>
              <Link href="/quiz" className="text-gray-700 hover:text-primary transition-colors">
                Quiz
              </Link>
              <Link href="/leaderboard" className="text-gray-700 hover:text-primary transition-colors">
                Leaderboard
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors">
                  Admin
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {profile?.full_name || profile?.username}!
          </h1>
          <p className="text-gray-600">
            Siap untuk mengasah kemampuan IQ Anda hari ini?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Game</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">
                Game yang telah dimainkan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Performa keseluruhan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Level {currentLevel}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.currentRank}</div>
              <p className="text-xs text-muted-foreground">
                Posisi global
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Progress Level</span>
            </CardTitle>
            <CardDescription>
              Level {currentLevel} - {pointsForNextLevel - (stats.totalPoints % 1000)} poin lagi untuk level berikutnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={currentLevelProgress} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mulai Quiz</CardTitle>
                <CardDescription>
                  Pilih jenis quiz untuk mengasah kemampuan spesifik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/quiz/multiple-choice">
                    <Button className="w-full h-16 bg-blue-500 hover:bg-blue-600 flex flex-col items-center justify-center">
                      <Target className="h-6 w-6 mb-1" />
                      <span>Multiple Choice</span>
                    </Button>
                  </Link>
                  
                  <Link href="/quiz/logic">
                    <Button className="w-full h-16 bg-green-500 hover:bg-green-600 flex flex-col items-center justify-center">
                      <Zap className="h-6 w-6 mb-1" />
                      <span>Logic Puzzles</span>
                    </Button>
                  </Link>
                  
                  <Link href="/quiz/pattern">
                    <Button className="w-full h-16 bg-purple-500 hover:bg-purple-600 flex flex-col items-center justify-center">
                      <Star className="h-6 w-6 mb-1" />
                      <span>Pattern Recognition</span>
                    </Button>
                  </Link>
                  
                  <Link href="/quiz/math">
                    <Button className="w-full h-16 bg-orange-500 hover:bg-orange-600 flex flex-col items-center justify-center">
                      <Brain className="h-6 w-6 mb-1" />
                      <span>Math Problems</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Achievement Terbaru</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {stats.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.achievements.name}</p>
                          <p className="text-xs text-gray-500">{achievement.achievements.description}</p>
                        </div>
                        <Badge variant="secondary">+{achievement.achievements.points}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Belum ada achievement. Mulai quiz untuk mendapatkan achievement pertama!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Games */}
        {stats.recentGames.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Game Terakhir</CardTitle>
              <CardDescription>
                Riwayat 5 game terakhir yang Anda mainkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Quiz #{game.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {game.correct_answers}/{game.total_questions} benar - {game.total_time}s
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{game.score}%</p>
                      <Badge variant={game.score >= 80 ? 'default' : game.score >= 60 ? 'secondary' : 'destructive'}>
                        {game.score >= 80 ? 'Excellent' : game.score >= 60 ? 'Good' : 'Fair'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}