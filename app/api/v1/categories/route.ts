import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch categories with question counts and difficulty distribution
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        questions(id, difficulty)
      `);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Process categories data
    const processedCategories = categories?.map(category => {
      const questions = category.questions || [];
      const difficulties = Array.from(new Set(questions.map((q: any) => q.difficulty)));
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        total_questions: questions.length,
        difficulties: difficulties.sort()
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: processedCategories
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
