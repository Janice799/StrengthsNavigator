import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
    // Supabase Auth 세션 로그아웃
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true });

    // 세션 쿠키 삭제
    response.cookies.set('coach_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // 즉시 만료
        path: '/',
    });

    return response;
}

