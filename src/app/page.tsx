'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 별 애니메이션 컴포넌트
function FloatingStars() {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 60 }, (_, i) => ({
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

export default function LandingPage() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* 별 배경 효과 */}
            <FloatingStars />

            {/* 콘텐츠 - Flexbox로 3단 구성 */}
            <div className="relative z-10 min-h-screen flex flex-col px-4 py-8">

                {/* 1. 상단 로고 */}
                <motion.header
                    className="text-center pt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl font-elegant font-semibold text-gold-gradient tracking-wide">
                        StrengthsNavigator
                    </h1>
                    <p className="text-white/40 text-sm mt-1 tracking-widest">
                        강점 네비게이터
                    </p>
                </motion.header>

                {/* 2. 중앙 콘텐츠 (flex-1로 남은 공간 차지) */}
                <motion.div
                    className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {/* 코치 프로필 사진 */}
                    <motion.div
                        className="relative mb-8"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gold-500/30 shadow-2xl shadow-gold-500/20">
                            <img
                                src="/coach-photo.jpg"
                                alt="조현영 강점코치"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* 빛나는 테두리 효과 */}
                        <div className="absolute inset-0 rounded-full border-2 border-gold-400/50 animate-pulse" />
                    </motion.div>

                    {/* 코치 이름 */}
                    <motion.h2
                        className="text-3xl font-elegant font-bold text-white mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        조현영 강점코치
                    </motion.h2>

                    {/* 코치 타이틀 */}
                    <motion.p
                        className="text-gold-400 font-medium mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Gallup Certified Strengths Coach
                    </motion.p>

                    {/* 코치 소개 */}
                    <motion.p
                        className="text-white/70 leading-relaxed font-elegant text-lg mb-10 max-w-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        성공하는 나를 경험하는 새로운 방식<br />
                        <span className="text-gold-400 font-bold">LIFELITERACY Selli</span>
                    </motion.p>

                    {/* CTA 버튼 - 카드 보내기 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Link href="/create">
                            <motion.button
                                className="px-12 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 rounded-full font-bold text-lg shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="flex items-center gap-3">
                                    <span>✨</span>
                                    카드 보내기
                                    <span>✨</span>
                                </span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* 3. 하단 정보 (고정 영역, 겹치지 않음) */}
                <motion.footer
                    className="text-center pb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <Link
                        href="/login"
                        className="inline-block text-white/50 hover:text-gold-400 text-sm transition-colors mb-4"
                    >
                        🔐 코치 로그인
                    </Link>
                    <div className="divider-elegant w-32 mx-auto mb-4" />
                    <p className="text-white/30 text-xs tracking-wider">
                        강점 코칭과 진심이 만나는 곳
                    </p>
                </motion.footer>
            </div>
        </main>
    );
}
