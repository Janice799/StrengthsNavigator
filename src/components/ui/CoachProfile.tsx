'use client';

import { motion } from 'framer-motion';
import { coachProfile } from '@/config/coach';
import Image from 'next/image';

interface CoachProfileProps {
    compact?: boolean;
}

export default function CoachProfile({ compact = false }: CoachProfileProps) {
    const { name, title, introduction, contact, photo } = coachProfile;

    if (compact) {
        return (
            <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center overflow-hidden ring-1 ring-gold-400/30">
                    {photo ? (
                        <Image src={photo} alt={name} width={40} height={40} className="object-cover" />
                    ) : (
                        <span className="text-ocean-900 font-elegant font-bold text-lg">{name[0]}</span>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-white/50">{title}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="relative max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* 배경 글로우 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-400/10 rounded-3xl blur-xl" />

            {/* 메인 카드 */}
            <div className="relative glass-strong rounded-2xl p-8 text-center border border-white/10">
                {/* 모서리 장식 */}
                <div className="absolute top-3 left-3 text-[10px] text-gold-400/40">✦</div>
                <div className="absolute top-3 right-3 text-[10px] text-gold-400/40">✦</div>
                <div className="absolute bottom-3 left-3 text-[10px] text-gold-400/40">✦</div>
                <div className="absolute bottom-3 right-3 text-[10px] text-gold-400/40">✦</div>

                {/* 프로필 이미지 */}
                <motion.div
                    className="relative w-28 h-28 mx-auto mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    {/* 외곽 링 */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 opacity-80" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400/50 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />

                    {/* 이미지 컨테이너 */}
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-ocean-800 flex items-center justify-center border-2 border-ocean-800">
                        {photo && (
                            <Image
                                src={photo}
                                alt={name}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                            />
                        )}
                    </div>
                </motion.div>

                {/* 이름 & 타이틀 */}
                <motion.h1
                    className="text-2xl font-elegant font-semibold text-gold-gradient mb-1 tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {name}
                </motion.h1>
                <motion.p
                    className="text-white/50 text-sm tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {title}
                </motion.p>

                {/* 구분선 */}
                <div className="divider-elegant my-6 w-24 mx-auto" />

                {/* 소개글 */}
                <motion.p
                    className="text-white/80 text-sm leading-relaxed font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {introduction}
                </motion.p>

                {/* 연락처 링크 */}
                <motion.div
                    className="flex justify-center gap-3 mt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {contact.email && (
                        <a
                            href={`mailto:${contact.email}`}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                            title="이메일"
                        >
                            <span className="text-lg">✉️</span>
                        </a>
                    )}
                    {contact.instagram && (
                        <a
                            href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                            title="인스타그램"
                        >
                            <span className="text-lg">📸</span>
                        </a>
                    )}
                    {contact.kakao && (
                        <a
                            href={contact.kakao}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                            title="카카오톡"
                        >
                            <span className="text-lg">💬</span>
                        </a>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
