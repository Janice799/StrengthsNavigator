'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import FloatingStars from '@/components/effects/FloatingStars';
import useLanguage, { LanguageToggle } from '@/hooks/useLanguage';

export default function SignUpPage() {
    const router = useRouter();
    const { t, mounted } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t.signup.passwordMismatch);
            return;
        }

        setLoading(true);

        try {
            const result = await signUp(formData.email, formData.password, formData.name);

            if (result.success) {
                alert(t.signup.signupSuccess);
                router.push('/login');
            } else {
                setError(result.error || t.signup.signupError);
            }
        } catch (err) {
            setError(t.signup.signupError);
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
                        <h1 className="text-3xl font-elegant font-bold text-gold-gradient mb-2">
                            StrengthsNavigator
                        </h1>
                        <p className="text-white/60">{t.signup.title}</p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* 회원가입 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.signup.nameLabel}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder={t.signup.namePlaceholder}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.signup.emailLabel}</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.signup.passwordLabel}</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">{t.signup.confirmPasswordLabel}</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gold-500 text-ocean-900 rounded-xl font-bold text-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t.signup.signingUp : t.signup.signUpButton}
                        </button>
                    </form>

                    {/* 로그인 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                            {t.signup.hasAccount}{' '}
                            <Link href="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
                                {t.signup.login}
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
