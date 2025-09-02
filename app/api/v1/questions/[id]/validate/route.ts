import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const { answer } = await request.json();

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

    const questionId = parseInt(params.id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    // Fetch question
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .eq('is_active', true)
      .single();

    if (error || !question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check answer
    let isCorrect = false;
    
    if (question.type === 'multiple_choice') {
      isCorrect = question.correct_answer === answer;
    } else if (question.type === 'true_false') {
      isCorrect = question.correct_answer === answer;
    } else if (question.type === 'text_input') {
      isCorrect = question.correct_answer.toString().toLowerCase() === answer.toString().toLowerCase();
    }

    return NextResponse.json({
      success: true,
      data: {
        is_correct: isCorrect,
        explanation: question.explanation,
        correct_answer: question.correct_answer
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}