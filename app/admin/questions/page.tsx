'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Plus, Edit, Trash2, Upload, Search, Filter, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text_input';
  category_id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  options?: string[];
  correct_answer: any;
  explanation: string;
  time_limit: number;
  points: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

type FormData = {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text_input';
  category_id: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  options: string[];
  correct_answer: number | boolean | string;
  explanation: string;
  time_limit: number;
  points: number;
  image_url: string;
};

export default function AdminQuestionsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<FormData>({
    question: '',
    type: 'multiple_choice',
    category_id: 0,
    difficulty: 'easy',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    time_limit: 30,
    points: 10,
    image_url: ''
  });

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

    fetchData();
  }, [user, profile, router]);

  const fetchData = async () => {
    try {
      const [questionsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('questions')
          .select(`
            *,
            categories(name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (questionsResponse.data) setQuestions(questionsResponse.data);
      if (categoriesResponse.data) setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Handle correct_answer based on question type
      let correctAnswer: any;
      
      if (formData.type === 'multiple_choice') {
        correctAnswer = formData.correct_answer;
      } else if (formData.type === 'true_false') {
        correctAnswer = formData.correct_answer === 1;
      } else {
        correctAnswer = formData.correct_answer;
      }

      const questionData = {
        question: formData.question,
        type: formData.type,
        category_id: formData.category_id,
        difficulty: formData.difficulty,
        explanation: formData.explanation,
        time_limit: formData.time_limit,
        points: formData.points,
        image_url: formData.image_url || null,
        created_by: user.id,
        options: formData.type === 'multiple_choice' ? formData.options : null,
        correct_answer: correctAnswer
      };

      const { error } = await supabase
        .from('questions')
        .insert(questionData);

      if (error) throw error;

      toast.success('Soal berhasil ditambahkan');
      setShowCreateDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Gagal menambahkan soal');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Yakin ingin menghapus soal ini?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast.success('Soal berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Gagal menghapus soal');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'multiple_choice',
      category_id: 0,
      difficulty: 'easy',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
      time_limit: 30,
      points: 10,
      image_url: ''
    });
    setEditingQuestion(null);
  };

  const handleTypeChange = (newType: 'multiple_choice' | 'true_false' | 'text_input') => {
    let newCorrectAnswer: number | boolean | string;
    
    if (newType === 'multiple_choice') {
      newCorrectAnswer = 0;
    } else if (newType === 'true_false') {
      newCorrectAnswer = 1; // 1 for true, 0 for false
    } else {
      newCorrectAnswer = '';
    }

    setFormData(prev => ({ 
      ...prev, 
      type: newType, 
      correct_answer: newCorrectAnswer 
    }));
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category_id.toString() === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty && question.is_active;
  });

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
            <Link href="/admin" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">Kelola Soal</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost">Kembali ke Admin</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Soal Quiz</h1>
          <div className="flex gap-2">
            <Link href="/admin/questions/upload">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Soal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Pertanyaan</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Masukkan pertanyaan..."
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipe Soal</Label>
                      <Select
                        value={formData.type}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="text_input">Text Input</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select
                        value={formData.category_id.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label>Pilihan Jawaban</Label>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Pilihan ${index + 1}`}
                            required
                          />
                          <Button
                            type="button"
                            variant={formData.correct_answer === index ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, correct_answer: index }))}
                          >
                            {formData.correct_answer === index ? 'Benar' : 'Pilih'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.type === 'true_false' && (
                    <div className="space-y-2">
                      <Label>Jawaban Benar</Label>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={formData.correct_answer === 1 ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({ ...prev, correct_answer: 1 }))}
                        >
                          Benar
                        </Button>
                        <Button
                          type="button"
                          variant={formData.correct_answer === 0 ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({ ...prev, correct_answer: 0 }))}
                        >
                          Salah
                        </Button>
                      </div>
                    </div>
                  )}

                  {formData.type === 'text_input' && (
                    <div className="space-y-2">
                      <Label htmlFor="text_answer">Jawaban Benar</Label>
                      <Input
                        id="text_answer"
                        value={formData.correct_answer as string}
                        onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                        placeholder="Masukkan jawaban yang benar..."
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Kesulitan</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value: 'easy' | 'medium' | 'hard' | 'expert') => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time_limit">Waktu (detik)</Label>
                      <Input
                        id="time_limit"
                        type="number"
                        value={formData.time_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                        min="10"
                        max="300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points">Poin</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="explanation">Penjelasan</Label>
                    <Textarea
                      id="explanation"
                      value={formData.explanation}
                      onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                      placeholder="Penjelasan jawaban yang benar..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL Gambar (Opsional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}>
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingQuestion ? 'Update Soal' : 'Simpan Soal'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari soal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Level</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Soal ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {question.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.points} poin
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {question.question}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {question.explanation}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {question.id}</span>
                        <span>{question.time_limit}s</span>
                        <span>{new Date(question.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingQuestion(question);
                          setFormData({
                            question: question.question,
                            type: question.type,
                            category_id: question.category_id,
                            difficulty: question.difficulty,
                            options: question.options || ['', '', '', ''],
                            correct_answer: question.correct_answer,
                            explanation: question.explanation,
                            time_limit: question.time_limit,
                            points: question.points,
                            image_url: question.image_url || ''
                          });
                          setShowCreateDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Tidak ada soal ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}