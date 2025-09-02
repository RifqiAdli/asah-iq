'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Trophy, Users, Zap, Target, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-gray-900">Asah IQ</span>
              </div>
              <nav className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/quiz" className="text-gray-700 hover:text-primary transition-colors">
                  Quiz
                </Link>
                <Link href="/leaderboard" className="text-gray-700 hover:text-primary transition-colors">
                  Leaderboard
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-primary transition-colors">
                  Profile
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Selamat Datang di Platform Asah IQ
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tingkatkan kemampuan kognitif Anda dengan berbagai game dan quiz yang menantang
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="game-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  <CardTitle>Multiple Choice</CardTitle>
                </div>
                <CardDescription>
                  Quiz dengan pilihan ganda untuk menguji pengetahuan umum
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quiz/multiple-choice">
                  <Button className="w-full">Mulai Quiz</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="game-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-green-500" />
                  <CardTitle>Logic Puzzles</CardTitle>
                </div>
                <CardDescription>
                  Teka-teki logika untuk mengasah kemampuan berpikir analitis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quiz/logic">
                  <Button className="w-full">Mulai Puzzle</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="game-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <CardTitle>Pattern Recognition</CardTitle>
                </div>
                <CardDescription>
                  Mengenali pola dan urutan untuk melatih kecerdasan visual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quiz/pattern">
                  <Button className="w-full">Mulai Game</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Lihat Dashboard Lengkap
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary animate-float" />
              <span className="font-bold text-xl text-gray-900">Asah IQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Asah <span className="text-primary">Kecerdasan</span> Anda
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Platform lengkap untuk mengasah kemampuan IQ dengan berbagai jenis game dan quiz interaktif. 
              Tingkatkan kognitif Anda dengan cara yang menyenangkan!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Berbagai jenis game dan quiz yang dirancang khusus untuk mengasah berbagai aspek kecerdasan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Multiple Choice</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Quiz dengan pilihan ganda yang menguji pengetahuan umum dan kemampuan analisis dalam berbagai bidang
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Logic Puzzles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Teka-teki logika yang menantang untuk mengasah kemampuan berpikir analitis dan pemecahan masalah
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Pattern Recognition</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Mengenali pola dan urutan untuk melatih kecerdasan visual dan kemampuan prediksi
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">Leaderboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Sistem ranking real-time yang menampilkan pemain terbaik dan mendorong kompetisi sehat
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Achievement System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Sistem pencapaian dan badge yang memotivasi pemain untuk terus meningkatkan kemampuan
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="game-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Brain className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Analytics & Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Pelacakan kemajuan detail dengan grafik dan analisis performa untuk melihat perkembangan IQ
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Siap Mengasah Kecerdasan Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Bergabunglah dengan ribuan pemain lain dalam platform pembelajaran yang interaktif dan menantang
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Daftar Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Asah IQ</span>
          </div>
          <p className="text-center text-gray-400">
            © 2025 Asah IQ. Platform pembelajaran interaktif untuk mengasah kecerdasan.
          </p>
        </div>
      </footer>
    </div>
  );
}