'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Trophy, Star, Calendar, Edit, Save, X, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserStats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
  favoriteCategory: string;
  currentStreak: number;
  achievements: any[];
  recentGames: any[];
  categoryStats: any[];
}

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    favoriteCategory: '',
    currentStreak: 0,
    achievements: [],
    recentGames: [],
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || ''
      });
    }

    fetchUserStats();
  }, [user, profile, router]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch game sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select(`
          *,
          categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch achievements
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements(name, description, icon, points)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (sessions) {
        const totalGames = sessions.length;
        const averageScore = totalGames > 0 
          ? Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / totalGames)
          : 0;
        const bestScore = totalGames > 0 
          ? Math.max(...sessions.map(session => session.score))
          : 0;
        const totalTime = sessions.reduce((sum, session) => sum + session.total_time, 0);

        // Calculate category stats
        const categoryMap = new Map();
        sessions.forEach(session => {
          const categoryName = session.categories?.name || 'Unknown';
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { games: 0, totalScore: 0 });
          }
          const stats = categoryMap.get(categoryName);
          stats.games += 1;
          stats.totalScore += session.score;
        });

        const categoryStats = Array.from(categoryMap.entries()).map(([name, stats]) => ({
          name,
          games: stats.games,
          averageScore: Math.round(stats.totalScore / stats.games)
        })).sort((a, b) => b.games - a.games);

        const favoriteCategory = categoryStats.length > 0 ? categoryStats[0].name : '';

        setStats({
          totalGames,
          averageScore,
          bestScore,
          totalTime,
          favoriteCategory,
          currentStreak: 0, // TODO: Calculate streak
          achievements: achievements || [],
          recentGames: sessions.slice(0, 10),
          categoryStats
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await updateProfile(formData);
      if (error) throw new Error(error);
      
      toast.success('Profile berhasil diperbarui');
      setEditMode(false);
    } catch (error: any) {
      toast.error('Gagal memperbarui profile: ' + error.message);
    }
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
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-primary font-medium">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {(profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile?.full_name || profile?.username}
                    </h1>
                    <p className="text-gray-600 mb-4">@{profile?.username}</p>
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        Level {currentLevel}
                      </Badge>
                      <Badge variant="outline">
                        {profile?.total_points?.toLocaleString()} Poin
                      </Badge>
                      <Badge variant="outline">
                        {stats.totalGames} Games
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                      className="mt-4"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Level Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress ke Level {currentLevel + 1}</span>
                <span className="text-sm text-gray-500">
                  {pointsForNextLevel - (profile?.total_points || 0) % 1000} poin lagi
                </span>
              </div>
              <Progress value={currentLevelProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Riwayat Game</TabsTrigger>
            <TabsTrigger value="achievements">Achievement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Overall Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Statistik Umum</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rata-rata Skor</span>
                    <span className="font-bold">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skor Terbaik</span>
                    <span className="font-bold">{stats.bestScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Waktu</span>
                    <span className="font-bold">{Math.round(stats.totalTime / 60)} menit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategori Favorit</span>
                    <span className="font-bold capitalize">{stats.favoriteCategory || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Performa per Kategori</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categoryStats.slice(0, 5).map((category) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize">{category.name}</span>
                          <Badge variant="outline">{category.averageScore}%</Badge>
                        </div>
                        <Progress value={category.averageScore} className="h-2" />
                        <p className="text-xs text-gray-500">{category.games} games</p>
                      </div>
                    ))}
                    {stats.categoryStats.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Belum ada data kategori
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-purple-500" />
                    <span>Achievement Terbaru</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.achievements.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.unlocked_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant="secondary">+{achievement.achievements.points}</Badge>
                      </div>
                    ))}
                    {stats.achievements.length === 0 && (
                      <div className="text-center py-4">
                        <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Belum ada achievement</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentGames.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Quiz #{game.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {game.correct_answers}/{game.total_questions} benar • {game.total_time}s
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(game.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{game.score}%</p>
                        <Badge variant={game.score >= 80 ? 'default' : game.score >= 60 ? 'secondary' : 'destructive'}>
                          {game.score >= 80 ? 'Excellent' : game.score >= 60 ? 'Good' : 'Fair'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {stats.recentGames.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">Belum ada riwayat game</p>
                      <Link href="/quiz">
                        <Button>Mulai Quiz Pertama</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <span>Achievement ({stats.achievements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{achievement.achievements.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{achievement.achievements.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">+{achievement.achievements.points} poin</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(achievement.unlocked_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {stats.achievements.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg text-gray-500 mb-2">Belum ada achievement</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Mainkan quiz untuk mendapatkan achievement pertama Anda!
                      </p>
                      <Link href="/quiz">
                        <Button>Mulai Quiz</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}