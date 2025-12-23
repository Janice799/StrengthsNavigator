'use client';

import { motion } from 'framer-motion';
import CardFrame from './CardFrame';
import { getOccasionById } from '@/lib/occasions';
import { getArchetypeById } from '@/lib/archetypes';
import { getStrengthById } from '@/lib/strengths';
import { getBackgroundById } from '@/lib/cardBackgrounds';
import { coachProfile } from '@/config/coach';
import type { CardData } from '@/lib/cardEncoder';

interface CardPreviewProps {
    data: Partial<CardData>;
    showAnimation?: boolean;
}

export default function CardPreview({ data, showAnimation = true }: CardPreviewProps) {
    const occasion = data.occasionId ? getOccasionById(data.occasionId) : null;
    const archetype = data.archetypeId ? getArchetypeById(data.archetypeId) : null;
    const strength = data.strengthId ? getStrengthById(data.strengthId) : null;
    const background = data.backgroundId ? getBackgroundById(data.backgroundId) : null;
    const lang = data.lang || 'ko';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
        }
    };

    return (
        <CardFrame colors={occasion?.colors} backgroundImage={background?.imagePath}>
            <motion.div
                className="text-center space-y-8"
                variants={showAnimation ? containerVariants : undefined}
                initial={showAnimation ? 'hidden' : undefined}
                animate={showAnimation ? 'visible' : undefined}
            >
                {/* 상황 아이콘 */}
                {occasion && (
                    <motion.div
                        variants={itemVariants}
                        className="text-5xl"
                    >
                        {occasion.icon}
                    </motion.div>
                )}

                {/* 수신자 이름 */}
                {data.recipientName && (
                    <motion.div variants={itemVariants} className="space-y-1">
                        <p className="text-white/70 text-sm tracking-[0.2em] uppercase font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            To.
                        </p>
                        <h2 className="text-3xl font-elegant font-bold text-gold-gradient tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                            {data.recipientName}
                        </h2>
                    </motion.div>
                )}

                {/* 기본 인사말 */}
                {occasion && (
                    <motion.p
                        variants={itemVariants}
                        className="text-2xl font-elegant font-bold text-white leading-relaxed"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                    >
                        {occasion.defaultGreeting[lang]}
                    </motion.p>
                )}

                {/* 상황 설명 */}
                {data.situation && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/5 rounded-xl p-5 text-left border border-white/10"
                    >
                        <p className="text-xs text-gold-400/80 mb-2 tracking-wider uppercase">
                            {lang === 'ko' ? '당신의 이야기' : 'Your Story'}
                        </p>
                        <p className="text-white/85 text-sm leading-relaxed font-light">
                            {data.situation}
                        </p>
                    </motion.div>
                )}

                {/* 원형 메시지 */}
                {archetype && (
                    <motion.div variants={itemVariants} className="space-y-4 py-2">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl">{archetype.icon}</span>
                            <span className="text-gold-400 font-elegant font-medium text-lg">
                                {archetype.name[lang]}
                            </span>
                        </div>
                        <p className="text-white/90 font-signature text-lg leading-relaxed px-4">
                            &ldquo;{archetype.message[lang]}&rdquo;
                        </p>
                    </motion.div>
                )}

                {/* 강점 메시지 - 여러 강점 지원 */}
                {!archetype && (data.strengthIds?.length || strength) && (
                    <motion.div variants={itemVariants} className="space-y-6 py-2">
                        {/* strengthIds가 있으면 모든 강점 표시 */}
                        {data.strengthIds && data.strengthIds.length > 0 ? (
                            data.strengthIds.map((sId, index) => {
                                const s = getStrengthById(sId);
                                if (!s) return null;
                                return (
                                    <div key={sId} className="space-y-3">
                                        {index > 0 && <div className="divider-elegant w-12 mx-auto" />}
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-2xl">{s.icon}</span>
                                            <span className="text-gold-400 font-elegant font-medium text-lg">
                                                {s.name[lang]}
                                            </span>
                                        </div>
                                        <p className="text-white/90 font-signature text-base leading-relaxed px-4">
                                            &ldquo;{s.affirmation[lang]}&rdquo;
                                        </p>
                                        <p className="text-white/60 text-sm leading-relaxed px-4">
                                            {s.description[lang]}
                                        </p>
                                    </div>
                                );
                            })
                        ) : strength && (
                            /* 단일 strength (하위 호환) */
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl">{strength.icon}</span>
                                    <span className="text-gold-400 font-elegant font-medium text-lg">
                                        {strength.name[lang]}
                                    </span>
                                </div>
                                <p className="text-white/90 font-signature text-lg leading-relaxed px-4">
                                    &ldquo;{strength.affirmation[lang]}&rdquo;
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 개인 메시지 */}
                {data.personalMessage && (
                    <motion.div
                        variants={itemVariants}
                        className="pt-4"
                    >
                        <div className="divider-elegant mb-6" />
                        <p className="text-white/95 leading-relaxed whitespace-pre-wrap font-elegant font-light">
                            {data.personalMessage}
                        </p>
                    </motion.div>
                )}

                {/* 발신자 (코치) */}
                <motion.div
                    variants={itemVariants}
                    className="pt-6 space-y-1"
                >
                    <p className="text-white/40 text-xs tracking-[0.2em] uppercase">
                        From.
                    </p>
                    <p className="text-gold-400 font-signature text-xl">
                        {data.senderName || coachProfile.name}
                    </p>
                </motion.div>
            </motion.div>
        </CardFrame>
    );
}
