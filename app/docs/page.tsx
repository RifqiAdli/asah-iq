'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Code, Key, Zap, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function APIDocsPage() {
  const baseUrl = 'https://yourwebsite.com/api/v1';

  const codeExamples = {
    javascript: `// JavaScript/TypeScript Example
const apiKey = 'your-api-key-here';
const baseUrl = '${baseUrl}';

// Get questions
async function getQuestions(category = null, difficulty = null) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  params.append('limit', '20');

  const response = await fetch(\`\${baseUrl}/questions?\${params}\`, {
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return data;
}

// Validate answer
async function validateAnswer(questionId, answer) {
  const response = await fetch(\`\${baseUrl}/questions/\${questionId}/validate\`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ answer })
  });

  const data = await response.json();
  return data;
}`,

    python: `# Python Example
import requests
import json

class AsahIQAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = '${baseUrl}'
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def get_questions(self, category=None, difficulty=None, limit=20):
        params = {'limit': limit}
        if category:
            params['category'] = category
        if difficulty:
            params['difficulty'] = difficulty
            
        response = requests.get(
            f'{self.base_url}/questions',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def validate_answer(self, question_id, answer):
        response = requests.post(
            f'{self.base_url}/questions/{question_id}/validate',
            headers=self.headers,
            json={'answer': answer}
        )
        return response.json()

# Usage
api = AsahIQAPI('your-api-key-here')
questions = api.get_questions(difficulty='easy', limit=10)
print(questions)`,

    curl: `# cURL Examples

# Get questions
curl -X GET "${baseUrl}/questions?category=matematika&difficulty=easy&limit=10" \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json"

# Get categories
curl -X GET "${baseUrl}/categories" \\
  -H "X-API-Key: your-api-key-here"

# Validate answer
curl -X POST "${baseUrl}/questions/123/validate" \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{"answer": "4"}'

# Get random quiz
curl -X GET "${baseUrl}/quiz/random?count=15&category=logika" \\
  -H "X-API-Key: your-api-key-here"`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">Asah IQ API</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-primary font-medium">
                API Docs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Asah IQ Public API
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Akses ribuan soal IQ dan quiz melalui RESTful API yang mudah digunakan. 
            Perfect untuk developer yang ingin mengintegrasikan konten edukatif ke aplikasi mereka.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">Free Tier Available</Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">Rate Limited</Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-green-500" />
              <span>Quick Start</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <Key className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">1. Get API Key</h3>
                <p className="text-sm text-gray-600">Daftar akun dan buat API key di dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <Code className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">2. Make Request</h3>
                <p className="text-sm text-gray-600">Gunakan API key di header X-API-Key</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">3. Get Questions</h3>
                <p className="text-sm text-gray-600">Terima data soal dalam format JSON</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints">
            <div className="space-y-6">
              {/* Get Questions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className="bg-green-500">GET</Badge>
                      <span>/api/v1/questions</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Mengambil daftar soal quiz dengan berbagai filter</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Query Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-mono">category</span>
                        <span className="text-gray-600">string (optional) - Filter by category name or ID</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">difficulty</span>
                        <span className="text-gray-600">easy|medium|hard|expert (optional)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">type</span>
                        <span className="text-gray-600">multiple_choice|true_false|text_input (optional)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">limit</span>
                        <span className="text-gray-600">number (default: 20, max: 100)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">offset</span>
                        <span className="text-gray-600">number (default: 0)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">random</span>
                        <span className="text-gray-600">boolean (default: false)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Example Response</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "Apa hasil dari 2 + 2?",
        "type": "multiple_choice",
        "category_id": 1,
        "difficulty": "easy",
        "options": ["3", "4", "5", "6"],
        "time_limit": 30,
        "points": 10,
        "categories": { "name": "matematika" }
      }
    ],
    "pagination": {
      "total": 500,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Get Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-green-500">GET</Badge>
                    <span>/api/v1/categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Mengambil daftar semua kategori soal</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "matematika",
      "description": "Soal-soal matematika dasar hingga lanjutan",
      "total_questions": 150,
      "difficulties": ["easy", "medium", "hard"]
    }
  ]
}`}
                  </pre>
                </CardContent>
              </Card>

              {/* Validate Answer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-blue-500">POST</Badge>
                    <span>/api/v1/questions/{'{id}'}/validate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Validasi jawaban untuk soal tertentu</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Request Body</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs">
{`{
  "answer": "user_answer_here"
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs">
{`{
  "success": true,
  "data": {
    "is_correct": true,
    "explanation": "2 + 2 = 4",
    "correct_answer": "4"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Random Quiz */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-green-500">GET</Badge>
                    <span>/api/v1/quiz/random</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Generate quiz set acak dengan parameter tertentu</p>
                  <div>
                    <h4 className="font-semibold mb-2">Query Parameters</h4>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="font-mono">count</span>
                        <span className="text-gray-600">number (default: 10, max: 50)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">category</span>
                        <span className="text-gray-600">string (optional)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">difficulty</span>
                        <span className="text-gray-600">easy|medium|hard|expert (optional)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono">exclude_ids</span>
                        <span className="text-gray-600">comma-separated question IDs to exclude</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="examples">
            <div className="space-y-6">
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <Card>
                    <CardHeader>
                      <CardTitle>JavaScript/TypeScript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {codeExamples.javascript}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="python">
                  <Card>
                    <CardHeader>
                      <CardTitle>Python</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {codeExamples.python}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="curl">
                  <Card>
                    <CardHeader>
                      <CardTitle>cURL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                        {codeExamples.curl}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="rate-limits">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rate Limiting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg">Free</h3>
                      <p className="text-2xl font-bold text-primary">1,000</p>
                      <p className="text-sm text-gray-600">requests/hour</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-lg">Basic</h3>
                      <p className="text-2xl font-bold text-blue-600">5,000</p>
                      <p className="text-sm text-gray-600">requests/hour</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-lg">Premium</h3>
                      <p className="text-2xl font-bold text-purple-600">25,000</p>
                      <p className="text-sm text-gray-600">requests/hour</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-lg">Enterprise</h3>
                      <p className="text-2xl font-bold text-yellow-600">∞</p>
                      <p className="text-sm text-gray-600">unlimited</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Handling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">HTTP Status Codes</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <Badge variant="outline">200</Badge>
                          <span>Success</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline">400</Badge>
                          <span>Bad Request</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline">401</Badge>
                          <span>Unauthorized (Invalid API Key)</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline">429</Badge>
                          <span>Rate Limit Exceeded</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline">500</Badge>
                          <span>Internal Server Error</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* SDK Download */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-6 w-6 text-blue-500" />
              <span>Official SDKs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Code className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">JavaScript/TypeScript</h3>
                <p className="text-sm text-gray-600 mb-4">Official SDK untuk JavaScript dan TypeScript</p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Code className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Python</h3>
                <p className="text-sm text-gray-600 mb-4">pip install asah-iq-sdk</p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PyPI Package
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Code className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">PHP</h3>
                <p className="text-sm text-gray-600 mb-4">composer require asah-iq/sdk</p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Packagist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-blue-100 mb-6">
                Daftar sekarang untuk mendapatkan API key gratis dan mulai mengintegrasikan soal-soal IQ ke aplikasi Anda
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Free API Key
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}