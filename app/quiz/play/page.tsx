'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, CheckCircle, XCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
}

interface Answer {
  answer: any;
  isCorrect: boolean;
  timeTaken: number;
}

interface GameSession {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (Answer | null)[];
  startTime: number;
  totalTime: number;
  score: number;
  isCompleted: boolean;
}

export default function QuizPlayPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    initializeQuiz();
  }, [user, router, searchParams]);

  useEffect(() => {
    if (gameSession && !gameSession.isCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameSession, timeLeft]);

  const initializeQuiz = async () => {
    try {
      const categoryId = searchParams.get('category');
      const mode = searchParams.get('mode');
      const difficulty = searchParams.get('difficulty');

      let query = supabase
        .from('questions')
        .select('*')
        .eq('is_active', true);

      if (categoryId && categoryId !== 'random') {
        query = query.eq('category_id', parseInt(categoryId));
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data: questions, error } = await query;

      if (error) throw error;

      if (!questions || questions.length === 0) {
        toast.error('Tidak ada soal tersedia untuk kategori ini');
        router.push('/quiz');
        return;
      }

      // Shuffle and limit questions
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      const questionCount = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10;
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);

      const session: GameSession = {
        id: crypto.randomUUID(),
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        answers: new Array(selectedQuestions.length).fill(null), // Initialize with proper length
        startTime: Date.now(),
        totalTime: 0,
        score: 0,
        isCompleted: false
      };

      setGameSession(session);
      setTimeLeft(selectedQuestions[0]?.time_limit || 30);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      toast.error('Gagal memuat quiz');
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    if (gameSession) {
      const updatedAnswers = [...gameSession.answers];
      updatedAnswers[gameSession.currentQuestionIndex] = {
        answer: null,
        isCorrect: false,
        timeTaken: gameSession.questions[gameSession.currentQuestionIndex]?.time_limit || 30
      };
      
      setGameSession(prev => prev ? { ...prev, answers: updatedAnswers } : null);
      handleNextQuestion();
    }
  };

  const handleAnswerSubmit = () => {
    if (!gameSession || currentAnswer === null) return;

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion, currentAnswer);
    const timeTaken = (currentQuestion.time_limit || 30) - timeLeft;

    const updatedAnswers = [...gameSession.answers];
    updatedAnswers[gameSession.currentQuestionIndex] = {
      answer: currentAnswer,
      isCorrect,
      timeTaken
    };

    setGameSession(prev => prev ? { ...prev, answers: updatedAnswers } : null);
    
    // Show feedback briefly before moving to next question
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const checkAnswer = (question: Question, answer: any): boolean => {
    if (question.type === 'multiple_choice') {
      return question.correct_answer === answer;
    } else if (question.type === 'true_false') {
      return question.correct_answer === answer;
    } else {
      return question.correct_answer.toString().toLowerCase() === answer.toString().toLowerCase();
    }
  };

  const handleNextQuestion = () => {
    if (!gameSession) return;

    if (gameSession.currentQuestionIndex < gameSession.questions.length - 1) {
      const nextIndex = gameSession.currentQuestionIndex + 1;
      setGameSession(prev => prev ? { ...prev, currentQuestionIndex: nextIndex } : null);
      setCurrentAnswer(null);
      setTimeLeft(gameSession.questions[nextIndex]?.time_limit || 30);
    } else {
      // Quiz completed
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!gameSession || !user) return;

    const totalTime = Math.round((Date.now() - gameSession.startTime) / 1000);
    const validAnswers = gameSession.answers.filter((a): a is Answer => a !== null);
    const correctAnswers = validAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / gameSession.questions.length) * 100);
    const totalPoints = gameSession.answers.reduce((sum, answer, index) => {
      if (answer && answer.isCorrect) {
        const question = gameSession.questions[index];
        return sum + (question.points || 10);
      }
      return sum;
    }, 0);

    try {
      // Save game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          category_id: gameSession.questions[0]?.category_id || 1,
          total_questions: gameSession.questions.length,
          correct_answers: correctAnswers,
          total_time: totalTime,
          score: score
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save individual answers
      const gameAnswers = gameSession.answers
        .map((answer, index) => {
          if (!answer) return null;
          return {
            session_id: session.id,
            question_id: gameSession.questions[index].id,
            user_answer: answer.answer,
            is_correct: answer.isCorrect,
            time_taken: answer.timeTaken,
            points_earned: answer.isCorrect ? (gameSession.questions[index].points || 10) : 0
          };
        })
        .filter(answer => answer !== null);

      if (gameAnswers.length > 0) {
        await supabase.from('game_answers').insert(gameAnswers);
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          total_points: (profile?.total_points || 0) + totalPoints,
          games_played: (profile?.games_played || 0) + 1,
          current_level: Math.floor(((profile?.total_points || 0) + totalPoints) / 1000) + 1
        })
        .eq('id', user.id);

      setSessionResults({
        ...session,
        totalPoints,
        answers: gameSession.answers,
        questions: gameSession.questions
      });

      setGameSession(prev => prev ? { ...prev, isCompleted: true } : null);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Gagal menyimpan hasil quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showResults && sessionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Quiz Selesai!</CardTitle>
              <CardDescription className="text-lg">
                Selamat! Anda telah menyelesaikan quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{sessionResults.score}%</div>
                  <div className="text-sm text-green-700">Skor Akhir</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{sessionResults.correct_answers}/{sessionResults.total_questions}</div>
                  <div className="text-sm text-blue-700">Benar</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">+{sessionResults.totalPoints}</div>
                  <div className="text-sm text-purple-700">Poin</div>
                </div>
              </div>

              {/* Performance Badge */}
              <div className="text-center">
                <Badge 
                  variant={sessionResults.score >= 80 ? 'default' : sessionResults.score >= 60 ? 'secondary' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {sessionResults.score >= 80 ? 'Excellent!' : sessionResults.score >= 60 ? 'Good Job!' : 'Keep Trying!'}
                </Badge>
              </div>

              {/* Question Review */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Review Jawaban</h3>
                {sessionResults.questions.map((question: Question, index: number) => {
                  const answer = sessionResults.answers[index];
                  
                  // Handle cases where answer might be null or undefined
                  const isAnswered = answer !== null && answer !== undefined;
                  const isCorrect = isAnswered ? answer.isCorrect : false;
                  const userAnswer = isAnswered ? answer.answer : null;
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">Soal {index + 1}</span>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{question.question}</p>
                      
                      {/* Show answer status */}
                      {!isAnswered && (
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            Tidak dijawab (waktu habis)
                          </Badge>
                        </div>
                      )}
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded border ${
                                optionIndex === question.correct_answer
                                  ? 'bg-green-100 border-green-400 text-green-800'
                                  : optionIndex === userAnswer && !isCorrect
                                  ? 'bg-red-100 border-red-400 text-red-800'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {option}
                              {optionIndex === question.correct_answer && (
                                <span className="ml-2 text-xs font-medium">(Jawaban benar)</span>
                              )}
                              {optionIndex === userAnswer && userAnswer !== question.correct_answer && (
                                <span className="ml-2 text-xs font-medium">(Jawaban Anda)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'true_false' && (
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div className={`p-2 rounded border text-center ${
                            question.correct_answer === true
                              ? 'bg-green-100 border-green-400 text-green-800'
                              : userAnswer === true && !isCorrect
                              ? 'bg-red-100 border-red-400 text-red-800'
                              : 'bg-gray-50'
                          }`}>
                            Benar
                            {question.correct_answer === true && (
                              <span className="block text-xs font-medium">(Jawaban benar)</span>
                            )}
                            {userAnswer === true && question.correct_answer !== true && (
                              <span className="block text-xs font-medium">(Jawaban Anda)</span>
                            )}
                          </div>
                          <div className={`p-2 rounded border text-center ${
                            question.correct_answer === false
                              ? 'bg-green-100 border-green-400 text-green-800'
                              : userAnswer === false && !isCorrect
                              ? 'bg-red-100 border-red-400 text-red-800'
                              : 'bg-gray-50'
                          }`}>
                            Salah
                            {question.correct_answer === false && (
                              <span className="block text-xs font-medium">(Jawaban benar)</span>
                            )}
                            {userAnswer === false && question.correct_answer !== false && (
                              <span className="block text-xs font-medium">(Jawaban Anda)</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {question.type === 'text_input' && (
                        <div className="mb-2">
                          <div className="p-2 bg-green-100 border-green-400 text-green-800 rounded border mb-2">
                            <span className="font-medium">Jawaban benar:</span> {question.correct_answer}
                          </div>
                          {userAnswer && (
                            <div className={`p-2 rounded border ${
                              isCorrect 
                                ? 'bg-green-100 border-green-400 text-green-800'
                                : 'bg-red-100 border-red-400 text-red-800'
                            }`}>
                              <span className="font-medium">Jawaban Anda:</span> {userAnswer}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mt-2 italic">{question.explanation}</p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quiz">
                  <Button size="lg" variant="outline">
                    Quiz Lain
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Memuat quiz...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
  const progress = ((gameSession.currentQuestionIndex + 1) / gameSession.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/quiz" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">
              {gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}
            </Badge>
            <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 shadow">
              <Clock className="h-4 w-4 text-red-500" />
              <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.points} poin
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 leading-relaxed">
                {currentQuestion.question}
              </h2>
              {currentQuestion.image_url && (
                <img 
                  src={currentQuestion.image_url} 
                  alt="Question image" 
                  className="max-w-full h-auto rounded-lg shadow-md mb-4"
                />
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentAnswer(index)}
                      className={`quiz-option ${currentAnswer === index ? 'selected' : ''}`}
                      disabled={gameSession.answers[gameSession.currentQuestionIndex] !== null}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currentAnswer === index ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {currentAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-left">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentAnswer(true)}
                    className={`quiz-option ${currentAnswer === true ? 'selected' : ''}`}
                    disabled={gameSession.answers[gameSession.currentQuestionIndex] !== null}
                  >
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <span className="text-lg font-medium">Benar</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentAnswer(false)}
                    className={`quiz-option ${currentAnswer === false ? 'selected' : ''}`}
                    disabled={gameSession.answers[gameSession.currentQuestionIndex] !== null}
                  >
                    <div className="text-center">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <span className="text-lg font-medium">Salah</span>
                    </div>
                  </button>
                </div>
              )}

              {currentQuestion.type === 'text_input' && (
                <div>
                  <input
                    type="text"
                    placeholder="Ketik jawaban Anda..."
                    value={currentAnswer || ''}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-lg"
                    disabled={gameSession.answers[gameSession.currentQuestionIndex] !== null}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                onClick={handleAnswerSubmit}
                disabled={currentAnswer === null || gameSession.answers[gameSession.currentQuestionIndex] !== null}
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                {gameSession.currentQuestionIndex === gameSession.questions.length - 1 ? 'Selesai' : 'Lanjut'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}