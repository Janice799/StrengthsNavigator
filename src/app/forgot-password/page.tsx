'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';
import FloatingStars from '@/components/effects/FloatingStars';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword(email);

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || '비밀번호 재설정에 실패했습니다.');
            }
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.');
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
                        <p className="text-white/60">비밀번호 찾기</p>
                    </div>

                    {success ? (
                        /* 성공 메시지 */
                        <div className="space-y-4">
                            <div className="p-6 bg-gold-500/20 border border-gold-500/50 rounded-xl text-center">
                                <div className="text-4xl mb-3">📧</div>
                                <p className="text-white font-medium mb-2">이메일을 확인하세요!</p>
                                <p className="text-white/60 text-sm">
                                    {email}로 비밀번호 재설정 링크를 발송했습니다.
                                    이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="block w-full py-3 bg-gold-500 text-ocean-900 rounded-xl font-bold text-center hover:bg-gold-400 transition-colors"
                            >
                                로그인으로 돌아가기
                            </Link>
                        </div>
                    ) : (
                        /* 이메일 입력 폼 */
                        <>
                            {/* 안내 */}
                            <div className="mb-6 p-4 bg-white/5 rounded-xl">
                                <p className="text-white/60 text-sm">
                                    가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
                                </p>
                            </div>

                            {/* 에러 메시지 */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-white/80 text-sm mb-2">이메일</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                                        placeholder="coach@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gold-500 text-ocean-900 rounded-xl font-bold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '발송 중...' : '재설정 링크 보내기'}
                                </button>
                            </form>

                            {/* 링크들 */}
                            <div className="mt-6 space-y-2 text-center">
                                <Link href="/login" className="block text-white/60 hover:text-white text-sm transition-colors">
                                    로그인으로 돌아가기
                                </Link>
                                <Link href="/signup" className="block text-white/60 hover:text-white text-sm transition-colors">
                                    회원가입하기
                                </Link>
                            </div>
                        </>
                    )}

                    {/* 홈으로 */}
                    <div className="mt-6 text-center">
                        <Link href="/" className="text-white/40 hover:text-white/60 text-sm transition-colors">
                            ← 홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
