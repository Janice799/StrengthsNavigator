'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// 별 애니메이션
function FloatingStars() {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/create');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.message || '비밀번호가 틀렸습니다.');
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <FloatingStars />

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* 로고 */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-elegant font-semibold text-gold-gradient">
                            StrengthsNavigator
                        </h1>
                        <p className="text-white/40 text-sm mt-1">Coach Login</p>
                    </div>

                    {/* 로그인 폼 */}
                    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
                        <div className="text-center mb-6">
                            <span className="text-4xl">🔐</span>
                            <h2 className="text-xl font-bold text-white mt-4">코치 전용 접속</h2>
                            <p className="text-white/60 text-sm mt-2">비밀번호를 입력하세요</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all text-center text-lg tracking-widest"
                                autoFocus
                            />

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-400 text-sm text-center"
                                >
                                    ❌ {error}
                                </motion.p>
                            )}

                            <motion.button
                                type="submit"
                                disabled={!password || isLoading}
                                className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? '확인 중...' : '접속하기'}
                            </motion.button>
                        </div>
                    </form>

                    {/* 홈으로 */}
                    <p className="text-center mt-6">
                        <a href="/" className="text-white/50 hover:text-gold-400 text-sm transition-colors">
                            ← 홈으로 돌아가기
                        </a>
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
