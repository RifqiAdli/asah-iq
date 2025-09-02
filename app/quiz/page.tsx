'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Zap, Star, Calculator, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  question_count?: number;
}

export default function QuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchCategories();
  }, [user, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select(`
          *,
          questions(count)
        `);

      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'target': Target,
      'zap': Zap,
      'star': Star,
      'calculator': Calculator,
      'brain': Brain,
      'clock': Clock,
      'users': Users
    };
    return icons[iconName] || Brain;
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
              <Link href="/quiz" className="text-primary font-medium">
                Quiz
              </Link>
              <Link href="/leaderboard" className="text-gray-700 hover:text-primary transition-colors">
                Leaderboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pilih Kategori Quiz
          </h1>
          <p className="text-xl text-gray-600">
            Pilih jenis quiz yang ingin Anda mainkan untuk mengasah kemampuan spesifik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length > 0 ? (
            categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Card key={category.id} className="game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl capitalize">{category.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        {category.question_count || 0} soal tersedia
                      </span>
                      <div className="flex space-x-1">
                        {['easy', 'medium', 'hard'].map((difficulty) => (
                          <div
                            key={difficulty}
                            className={`w-2 h-2 rounded-full ${
                              difficulty === 'easy' ? 'bg-green-400' :
                              difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <Link href={`/quiz/play?category=${category.id}`}>
                      <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Mulai Quiz
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-4">
                Belum ada kategori quiz tersedia
              </p>
              <p className="text-sm text-gray-400">
                Admin sedang menyiapkan konten quiz untuk Anda
              </p>
            </div>
          )}
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Atau Mulai dengan Quiz Acak
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz/play?mode=random&difficulty=easy">
              <Button size="lg" variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                Quiz Mudah (10 soal)
              </Button>
            </Link>
            <Link href="/quiz/play?mode=random&difficulty=medium">
              <Button size="lg" variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100">
                Quiz Sedang (15 soal)
              </Button>
            </Link>
            <Link href="/quiz/play?mode=random&difficulty=hard">
              <Button size="lg" variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                Quiz Sulit (20 soal)
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}