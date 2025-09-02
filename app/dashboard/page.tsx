'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, Target, Zap, Star, Play, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalGames: number;
  averageScore: number;
  currentRank: number;
  totalPoints: number;
  recentGames: any[];
  achievements: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 5,
    averageScore: 85,
    currentRank: 42,
    totalPoints: 2500,
    recentGames: [],
    achievements: []
  });
  const [loading, setLoading] = useState(false);

  // Simplified auth check - remove useAuth dependency for now
  const [user, setUser] = useState({ id: '1', email: 'test@example.com' });
  const [profile, setProfile] = useState({ 
    full_name: 'Test User',
    username: 'testuser',
    current_level: 3,
    total_points: 2500,
    role: 'user'
  });

  useEffect(() => {
    // Comment out auth check for debugging
    // if (!user) {
    //   router.push('/auth/login');
    //   return;
    // }
    
    // Simulate data loading without Supabase
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const handleSignOut = async () => {
    // Simplified sign out
    router.push('/');
  };

  const currentLevel = profile?.current_level || 1;
  const pointsForNextLevel = currentLevel * 1000;
  const currentLevelProgress = ((profile?.total_points || 0) % 1000) / 10;

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
                <div className="text-center py-6">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Belum ada achievement. Mulai quiz untuk mendapatkan achievement pertama!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
