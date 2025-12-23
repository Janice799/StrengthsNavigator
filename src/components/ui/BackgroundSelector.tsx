'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CardBackground, backgroundStyles, getBackgroundsByOccasion, BackgroundStyle } from '@/lib/cardBackgrounds';

interface BackgroundSelectorProps {
    occasionId: string;
    selectedBackgroundId?: string;
    onSelect: (background: CardBackground) => void;
    lang?: 'ko' | 'en';
}

export default function BackgroundSelector({
    occasionId,
    selectedBackgroundId,
    onSelect,
    lang = 'ko'
}: BackgroundSelectorProps) {
    const backgrounds = getBackgroundsByOccasion(occasionId);

    // 스타일별로 그룹화
    const groupedByStyle = backgroundStyles.reduce((acc, style) => {
        acc[style.id] = backgrounds.filter(bg => bg.style === style.id);
        return acc;
    }, {} as Record<BackgroundStyle, CardBackground[]>);

    return (
        <div className="space-y-6">
            <p className="text-white/60 text-sm text-center mb-4">
                카드 배경을 선택하세요
            </p>

            {backgroundStyles.map(style => {
                const styleBackgrounds = groupedByStyle[style.id];
                if (!styleBackgrounds || styleBackgrounds.length === 0) return null;

                return (
                    <div key={style.id} className="space-y-3">
                        <h4 className="text-white/70 text-sm font-medium flex items-center gap-2">
                            <span>{style.icon}</span>
                            {style.name[lang]}
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {styleBackgrounds.map(bg => (
                                <motion.button
                                    key={bg.id}
                                    onClick={() => onSelect(bg)}
                                    className={`
                                        relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all
                                        ${selectedBackgroundId === bg.id
                                            ? 'border-gold-400 ring-2 ring-gold-400/50'
                                            : 'border-white/10 hover:border-white/30'}
                                    `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {bg.imagePath ? (
                                        <Image
                                            src={bg.imagePath}
                                            alt={bg.name[lang]}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 33vw, 150px"
                                        />
                                    ) : (
                                        // 기본 CSS 그라데이션 배경
                                        <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-900 to-ocean-950" />
                                    )}

                                    {/* 선택 표시 */}
                                    {selectedBackgroundId === bg.id && (
                                        <div className="absolute inset-0 bg-gold-400/20 flex items-center justify-center">
                                            <span className="text-2xl">✓</span>
                                        </div>
                                    )}

                                    {/* 라벨 */}
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-white text-xs text-center truncate">
                                            {bg.name[lang]}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
