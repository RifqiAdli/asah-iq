'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUploadPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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
  }, [user, profile, router]);

  const exampleJson = {
    questions: [
      {
        question: "Apa hasil dari 2 + 2?",
        type: "multiple_choice",
        category_id: 1,
        difficulty: "easy",
        options: ["3", "4", "5", "6"],
        correct_answer: 1,
        explanation: "2 + 2 = 4 adalah operasi penjumlahan dasar",
        time_limit: 30,
        points: 10
      },
      {
        question: "Bumi mengelilingi matahari",
        type: "true_false",
        category_id: 2,
        difficulty: "easy",
        correct_answer: true,
        explanation: "Bumi mengorbit mengelilingi matahari dalam sistem tata surya",
        time_limit: 15,
        points: 5
      },
      {
        question: "Berapa jumlah benua di dunia?",
        type: "text_input",
        category_id: 3,
        difficulty: "medium",
        correct_answer: "7",
        explanation: "Ada 7 benua: Asia, Afrika, Amerika Utara, Amerika Selatan, Eropa, Australia, dan Antartika",
        time_limit: 45,
        points: 15
      }
    ]
  };

  const handleUpload = async () => {
    if (!jsonData.trim()) {
      toast.error('Masukkan data JSON terlebih dahulu');
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const data = JSON.parse(jsonData);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Format JSON tidak valid. Harus memiliki property "questions" berupa array');
      }

      const result: UploadResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const questionData of data.questions) {
        try {
          // Validate required fields
          if (!questionData.question || !questionData.type || !questionData.category_id) {
            throw new Error(`Soal "${questionData.question}" tidak lengkap (question, type, category_id wajib diisi)`);
          }

          // Prepare question for insertion
          const questionToInsert = {
            ...questionData,
            created_by: user?.id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('questions')
            .insert(questionToInsert);

          if (error) throw error;

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(error.message);
        }
      }

      setUploadResult(result);
      
      if (result.success > 0) {
        toast.success(`Berhasil mengupload ${result.success} soal`);
      }
      
      if (result.failed > 0) {
        toast.error(`${result.failed} soal gagal diupload`);
      }

    } catch (error: any) {
      toast.error('Format JSON tidak valid: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExample = () => {
    const blob = new Blob([JSON.stringify(exampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contoh-soal.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin/questions" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">Bulk Upload Soal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Soal dalam Format JSON</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload multiple soal sekaligus menggunakan format JSON. Pastikan format sesuai dengan contoh di bawah.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Format JSON harus mengikuti struktur yang benar dengan property "questions" berupa array.
                </p>
                <Button variant="outline" onClick={downloadExample}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Contoh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Data JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste JSON data di sini..."
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setJsonData('')}>
                  Clear
                </Button>
                <Button onClick={handleUpload} disabled={loading || !jsonData.trim()}>
                  {loading ? 'Mengupload...' : 'Upload Soal'}
                  <Upload className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Hasil Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                    <div className="text-sm text-green-700">Berhasil</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                    <div className="text-sm text-red-700">Gagal</div>
                  </div>
                </div>

                {uploadResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Error Details:</h4>
                    <div className="space-y-1">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Link href="/admin/questions">
                    <Button>Lihat Semua Soal</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example JSON */}
          <Card>
            <CardHeader>
              <CardTitle>Contoh Format JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(exampleJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}