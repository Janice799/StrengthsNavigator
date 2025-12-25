import { NextRequest, NextResponse } from 'next/server';
import { verifyCoachPassword } from '@/lib/supabase';

// 세션 토큰 생성 (간단한 랜덤 문자열)
function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const password = body.password || '';

        console.log('🔐 로그인 시도');

        // Supabase에서 비밀번호 확인 (fallback: 환경 변수)
        const isValid = await verifyCoachPassword(password);

        if (isValid) {
            // 세션 토큰 생성
            const token = generateToken();

            // 응답 생성 후 쿠키 설정
            const response = NextResponse.json({ success: true });

            response.cookies.set('coach_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365, // 1년
                path: '/',
            });

            console.log('✅ 로그인 성공');
            return response;
        } else {
            console.log('❌ 로그인 실패');
            return NextResponse.json(
                { success: false, message: '비밀번호가 틀렸습니다.' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('🚫 로그인 오류:', error);
        return NextResponse.json(
            { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
