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
    // For now, we'll use a simple check
    if (apiKey !== 'demo-api-key') {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const random = searchParams.get('random') === 'true';

    // Build query
    let query = supabase
      .from('questions')
      .select('id, question, type, category_id, difficulty, options, time_limit, points, image_url, created_at, categories(name)')
      .eq('is_active', true);

    if (category) {
      if (isNaN(parseInt(category))) {
        // Search by category name
        query = query.eq('categories.name', category);
      } else {
        query = query.eq('category_id', parseInt(category));
      }
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (random) {
      // For random, we'll get more than needed and shuffle client-side
      query = query.limit(limit * 2);
    } else {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: questions, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Remove correct_answer from response for security
    const safeQuestions = questions?.map(({ correct_answer, ...question }) => question) || [];

    // Shuffle if random requested
    const finalQuestions = random 
      ? safeQuestions.sort(() => Math.random() - 0.5).slice(0, limit)
      : safeQuestions;

    return NextResponse.json({
      success: true,
      data: {
        questions: finalQuestions,
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: !random && (count || 0) > offset + limit
        }
      },
      meta: {
        rate_limit: {
          remaining: 995, // TODO: Implement actual rate limiting
          reset_at: new Date(Date.now() + 3600000).toISOString()
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}