import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호되는 경로 목록
const protectedPaths = ['/create', '/dashboard', '/clients'];

// 공개 경로 (로그인 없이 접근 가능)
const publicPaths = ['/', '/login', '/card', '/api'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // API 경로는 통과
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // 공개 경로는 통과
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        // 단, /create, /dashboard 등은 제외
        if (!protectedPaths.some(p => pathname.startsWith(p))) {
            return NextResponse.next();
        }
    }

    // 보호된 경로 체크
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
        // 세션 쿠키 확인
        const session = request.cookies.get('coach_session');

        if (!session) {
            // 로그인 페이지로 리다이렉트
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
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
