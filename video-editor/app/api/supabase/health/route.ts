import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Attempt a simple query to check connectivity
    // We use projects table as it's a core table from our schema
    const { data, error } = await supabase
      .from('projects')
      .select('count', { count: 'exact', head: true });

    const duration = Date.now() - startTime;

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not connect to Supabase database',
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection healthy',
      latency: `${duration}ms`,
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error during health check',
      error: err.message || String(err),
    }, { status: 500 });
  }
}
