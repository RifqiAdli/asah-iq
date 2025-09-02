import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = request.headers.get('X-API-Key');

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 401 }
      );
    }

    // TODO: Validate API key against database
    if (apiKey !== 'demo-api-key') {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse parameters
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const excludeIds = searchParams.get('exclude_ids')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];

    // Build query
    let query = supabase
      .from('questions')
      .select('id, question, type, category_id, difficulty, options, time_limit, points, image_url, categories(name)')
      .eq('is_active', true);

    if (category) {
      if (isNaN(parseInt(category))) {
        // Search by category name
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      } else {
        query = query.eq('category_id', parseInt(category));
      }
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data: questions, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions found matching criteria' },
        { status: 404 }
      );
    }

    // Randomly select questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, count);

    // Remove correct_answer from response
    const safeQuestions = selectedQuestions.map(({ correct_answer, ...question }) => question);

    // Calculate estimated time
    const estimatedTime = selectedQuestions.reduce((sum, q) => sum + (q.time_limit || 30), 0);

    const quizId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      data: {
        quiz_id: quizId,
        questions: safeQuestions,
        total_questions: selectedQuestions.length,
        estimated_time: estimatedTime
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}