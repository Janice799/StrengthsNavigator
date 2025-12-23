'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import CoachProfile from '@/components/ui/CoachProfile';
import SnowEffect from '@/components/effects/SnowEffect';
import StarsEffect from '@/components/effects/StarsEffect';
import StrengthsDNA from '@/components/effects/StrengthsDNA';

export default function HomePage() {
    // 코치의 도메인 분포 (강점에 따라 조정 가능)
    const coachDomains = {
        executing: 0.6,      // 실행력
        influencing: 0.8,    // 영향력
        relationship: 0.9,   // 관계구축
        strategic: 0.7       // 전략적사고
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* 배경 효과 */}
            <StarsEffect count={80} />
            <SnowEffect count={100} />

            {/* 강점 DNA 배경 시각화 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <StrengthsDNA
                    domains={coachDomains}
                    width={600}
                    height={600}
                />
            </div>

            {/* 콘텐츠 */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-4 py-12">
                {/* 상단 로고 */}
                <motion.div
                    className="text-center pt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-4xl font-elegant font-semibold text-gold-gradient tracking-wide">
                        StrengthsNavigator
                    </h1>
                    <p className="text-white/40 text-sm mt-1 tracking-widest">
                        강점 네비게이터
                    </p>
                </motion.div>

                {/* 중앙 - 코치 프로필 영역 */}
                <motion.div
                    className="flex-1 flex flex-col items-center justify-center py-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {/* 코치 프로필 */}
                    <CoachProfile />

                    {/* 서브 타이틀 */}
                    <motion.p
                        className="text-center text-white/70 max-w-sm mx-auto mt-8 leading-relaxed font-elegant text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        당신의 <span className="text-gold-400">강점</span>을 발견하고,<br />
                        진심을 담은 메시지로 <span className="text-gold-400">특별한 순간</span>을 선물하세요
                    </motion.p>

                    {/* CTA 버튼 - 우아한 테두리 스타일 */}
                    <motion.div
                        className="mt-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Link href="/create">
                            <motion.button
                                className="px-10 py-4 btn-elegant rounded-full font-medium text-lg tracking-wide"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-gold-400">✦</span>
                                    카드 만들기
                                    <span className="text-gold-400">✦</span>
                                </span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* 하단 영역 */}
                <motion.div
                    className="text-center pb-4 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    {/* 클라이언트 관리 - 미묘한 링크 */}
                    <Link
                        href="/clients"
                        className="link-subtle inline-flex items-center gap-2"
                    >
                        클라이언트 관리
                        <span className="text-xs">→</span>
                    </Link>

                    {/* 구분선 */}
                    <div className="divider-elegant w-32 mx-auto" />

                    {/* 하단 정보 */}
                    <p className="text-white/30 text-xs tracking-wider">
                        강점 코칭과 진심이 만나는 곳
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
