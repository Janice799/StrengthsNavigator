'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import FloatingStars from '@/components/effects/FloatingStars';

export default function SignUpPage() {
    const router = useRouter();
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

        // 유효성 검사
        if (!formData.name || !formData.email || !formData.password) {
            setError('모든 필드를 입력해주세요.');
            return;
        }

        if (formData.password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);

        try {
            const result = await signUp(formData.email, formData.password, formData.name);

            if (result.success) {
                alert('✅ 회원가입 완료! 이메일을 확인해주세요.');
                router.push('/login');
            } else {
                setError(result.error || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            setError('회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <FloatingStars />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="glass rounded-3xl p-8">
                    {/* 로고 */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-elegant font-bold text-gold-gradient mb-2">
                            StrengthsNavigator
                        </h1>
                        <p className="text-white/60">코치 회원가입</p>
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
                            <label className="block text-white/80 text-sm mb-2">이름</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="홍길동"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">아이디 (이메일)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                placeholder="example@email.com"
                                required
                            />
                            <p className="text-white/40 text-xs mt-1">비밀번호 찾기에 사용됩니다</p>
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">비밀번호 (최소 6자)</label>
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
                            <label className="block text-white/80 text-sm mb-2">비밀번호 확인</label>
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
                            {loading ? '가입 중...' : '회원가입'}
                        </button>
                    </form>

                    {/* 로그인 링크 */}
                    <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
                                로그인
                            </Link>
                        </p>
                    </div>

                    {/* 홈으로 */}
                    <div className="mt-4 text-center">
                        <Link href="/" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                            ← 홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
