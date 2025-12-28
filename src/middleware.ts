import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-middleware';

// 보호되는 경로 목록
const protectedPaths = ['/create', '/dashboard', '/clients', '/settings'];

// 공개 경로 (로그인 없이 접근 가능)
const publicPaths = ['/', '/login', '/signup', '/card', '/api', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API 경로는 통과
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // 정적 파일은 통과
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') // 파일 확장자가 있는 경우
    ) {
        return NextResponse.next();
    }

    // Supabase 세션 갱신 및 유저 확인
    const { supabaseResponse, user } = await updateSession(request);

    // 보호된 경로 체크
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath && !user) {
        // 로그인 페이지로 리다이렉트
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 대시보드로
    if (user && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
