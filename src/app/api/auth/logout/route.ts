import { NextResponse } from 'next/server';

export async function POST() {
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
