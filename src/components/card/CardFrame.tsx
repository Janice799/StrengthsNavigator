'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardFrameProps {
    children: ReactNode;
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
    className?: string;
}

export default function CardFrame({
    children,
    colors = {
        primary: '#1e3a5f',
        secondary: '#0c1a2b',
        accent: '#d4af37'
    },
    className = ''
}: CardFrameProps) {
    return (
        <motion.div
            className={`relative max-w-lg mx-auto ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* 오로라 글로우 효과 */}
            <div
                className="absolute -inset-4 rounded-3xl opacity-30 blur-xl"
                style={{
                    background: `radial-gradient(ellipse at center, ${colors.accent}40, transparent 70%)`
                }}
            />

            {/* 외곽 장식 테두리 - 이중 레이어 */}
            <div
                className="absolute -inset-[3px] rounded-[22px] opacity-60"
                style={{
                    background: `linear-gradient(135deg, ${colors.accent}60, transparent 30%, transparent 70%, ${colors.accent}40)`
                }}
            />
            <div
                className="absolute -inset-[1px] rounded-[20px] opacity-40"
                style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.15), transparent 50%)`
                }}
            />

            {/* 메인 카드 */}
            <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(165deg, ${colors.primary}f5 0%, ${colors.secondary}fa 100%)`,
                    boxShadow: `
                        0 30px 60px -15px rgba(0, 0, 0, 0.5),
                        0 0 50px ${colors.accent}15,
                        inset 0 1px 0 rgba(255,255,255,0.1)
                    `
                }}
            >
                {/* 미세한 그레인 텍스처 (노이즈 효과) */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* 상단 장식 - 얇은 골드 라인 */}
                <div
                    className="h-[2px] w-full"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`
                    }}
                />

                {/* 모서리 장식 - 좌상단 */}
                <div className="absolute top-4 left-4 w-6 h-6 pointer-events-none">
                    <div
                        className="absolute top-0 left-0 w-full h-[1px]"
                        style={{ background: `linear-gradient(90deg, ${colors.accent}80, transparent)` }}
                    />
                    <div
                        className="absolute top-0 left-0 w-[1px] h-full"
                        style={{ background: `linear-gradient(180deg, ${colors.accent}80, transparent)` }}
                    />
                    <div
                        className="absolute top-1 left-1 text-[8px]"
                        style={{ color: `${colors.accent}60` }}
                    >
                        ✦
                    </div>
                </div>

                {/* 모서리 장식 - 우하단 */}
                <div className="absolute bottom-4 right-4 w-6 h-6 pointer-events-none">
                    <div
                        className="absolute bottom-0 right-0 w-full h-[1px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${colors.accent}80)` }}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-[1px] h-full"
                        style={{ background: `linear-gradient(180deg, transparent, ${colors.accent}80)` }}
                    />
                    <div
                        className="absolute bottom-1 right-1 text-[8px]"
                        style={{ color: `${colors.accent}60` }}
                    >
                        ✦
                    </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div className="p-10 relative z-10">
                    {children}
                </div>

                {/* 하단 장식 - 얇은 골드 라인 */}
                <div
                    className="h-[2px] w-full"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`
                    }}
                />
            </div>
        </motion.div>
    );
}
