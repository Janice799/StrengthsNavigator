'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import FloatingStars from '@/components/effects/FloatingStars';
import useLanguage, { LanguageToggle } from '@/hooks/useLanguage';

export default function LoginPage() {
    const router = useRouter();
    const { t, mounted } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 저장된 로그인 정보 불러오기
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedRemember = localStorage.getItem('rememberMe');

        if (savedEmail && savedRemember === 'true') {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(email, password);

            if (result.success) {
                // 로그인 유지 옵션 처리
                if (rememberMe) {
                    localStorage.setItem('savedEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('savedEmail');
                    localStorage.removeItem('rememberMe');
                }

                // 로그인 성공 - 대시보드로 이동
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(result.error || t.login.loginFailed);
            }
        } catch (err) {
            setError(t.login.loginError);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen bg-ocean-900" />;
    }

    return (
        <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <FloatingStars />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="glass rounded-3xl p-8">
                    {/* 언어 전환 버튼 */}
                    <div className="absolute top-4 right-4">
                        <LanguageToggle className="bg-white/10 hover:bg-white/20 text-white" />
                    </div>

                    {/* 로고 */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-elegant font-bold text-gold-gradient mb-2 pb-1" style={{ lineHeight: '1.4' }}>
                            StrengthsNavigator
                        </h1>
                        <p className="text-white/60">{t.login.title}</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* 로그인 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.login.emailLabel}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.login.passwordLabel}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="••••••"
                                required
                            />
                        </div>

                        {/* 로그인 유지 체크박스 */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-gold-500 focus:ring-gold-500 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-white/70 text-sm cursor-pointer">
                                {t.login.rememberMe}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gold-500 text-ocean-900 rounded-xl font-bold text-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t.login.loggingIn : t.login.loginButton}
                        </button>
                    </form>

                    {/* 비밀번호 찾기 */}
                    <div className="mt-4 text-center">
                        <Link href="/forgot-password" className="text-white/60 hover:text-white text-sm transition-colors">
                            {t.login.forgotPassword}
                        </Link>
                    </div>

                    {/* 회원가입 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                            {t.login.noAccount}{' '}
                            <Link href="/signup" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                                {t.login.signUp}
                            </Link>
                        </p>
                    </div>

                    {/* 홈으로 */}
                    <div className="mt-4 text-center">
                        <Link href="/" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                            {t.common.backToHome}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
