'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CardPreview from '@/components/card/CardPreview';
import SnowEffect from '@/components/effects/SnowEffect';
import StarsEffect from '@/components/effects/StarsEffect';
import FireworksEffect from '@/components/effects/FireworksEffect';
import ScratchCard from '@/components/effects/ScratchCard';
import { decodeCardData, CardData } from '@/lib/cardEncoder';
import { getOccasionById } from '@/lib/occasions';
import { getStrengthById } from '@/lib/strengths';
import { getArchetypeById } from '@/lib/archetypes';

function CardContent() {
    const searchParams = useSearchParams();
    const [cardData, setCardData] = useState<CardData | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [replySent, setReplySent] = useState(false);

    // 스크래치 모드 확인
    const mode = searchParams.get('mode');
    const isScratchMode = mode === 'scratch';

    useEffect(() => {
        const encoded = searchParams.get('data');
        if (!encoded) {
            setError('카드 데이터가 없습니다.');
            return;
        }

        const decoded = decodeCardData(encoded);
        if (!decoded) {
            setError('카드를 불러올 수 없습니다.');
            return;
        }

        setCardData(decoded);
    }, [searchParams]);

    const occasion = cardData?.occasionId ? getOccasionById(cardData.occasionId) : null;
    const strength = cardData?.strengthId ? getStrengthById(cardData.strengthId) : null;
    const archetype = cardData?.archetypeId ? getArchetypeById(cardData.archetypeId) : null;

    const handleReveal = () => {
        setIsRevealed(true);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass rounded-2xl p-8 text-center max-w-md">
                    <p className="text-4xl mb-4">😢</p>
                    <h2 className="text-xl font-bold text-white mb-2">앗!</h2>
                    <p className="text-white/70 mb-6">{error}</p>
                    <Link href="/" className="text-gold-400 hover:text-gold-300">
                        홈으로 돌아가기 →
                    </Link>
                </div>
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white/60">로딩 중...</div>
            </div>
        );
    }

    // 스크래치 카드 내부 컨텐츠
    const ScratchContent = () => (
        <div className="text-center text-white p-2">
            <div className="text-3xl mb-2">{occasion?.icon || '✨'}</div>
            <div className="text-gold-400 font-elegant font-medium text-sm mb-1">
                {strength?.name.ko || archetype?.name.ko || '특별한 메시지'}
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
                {cardData.recipientName}님을 위한<br />
                마음을 담은 카드가<br />
                도착했습니다! 💌
            </p>
        </div>
    );

    return (
        <>
            {/* 배경 효과 */}
            <StarsEffect count={60} />
            {occasion?.effect === 'snow' && <SnowEffect count={120} />}
            {isRevealed && <FireworksEffect duration={4000} />}

            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
                <AnimatePresence mode="wait">
                    {!isRevealed ? (
                        <motion.div
                            key="hidden"
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -50 }}
                        >
                            {isScratchMode ? (
                                /* 스크래치 카드 모드 */
                                <>
                                    <motion.p
                                        className="text-white/60 mb-4 text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {cardData.recipientName}님에게 도착한 메시지
                                    </motion.p>

                                    <ScratchCard
                                        width={320}
                                        height={200}
                                        revealPercent={45}
                                        onComplete={handleReveal}
                                    >
                                        <ScratchContent />
                                    </ScratchCard>

                                    <motion.p
                                        className="mt-6 text-white/50 text-sm"
                                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✨ 긁어서 카드를 확인하세요! ✨
                                    </motion.p>
                                </>
                            ) : (
                                /* 봉투 클릭 모드 (기존) */
                                <>
                                    <motion.div
                                        className="relative cursor-pointer group"
                                        onClick={handleReveal}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-72 h-48 glass rounded-xl relative overflow-hidden">
                                            {/* 봉투 본체 */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: `linear-gradient(145deg, ${occasion?.colors.primary || '#1e3a5f'}, ${occasion?.colors.secondary || '#0c1a2b'})`
                                                }}
                                            />

                                            {/* 봉투 덮개 */}
                                            <div
                                                className="absolute top-0 left-0 right-0 h-24 origin-top"
                                                style={{
                                                    background: `linear-gradient(180deg, ${occasion?.colors.primary || '#1e3a5f'} 0%, ${occasion?.colors.secondary || '#0c1a2b'} 100%)`,
                                                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
                                                }}
                                            />

                                            {/* 씰 */}
                                            <motion.div
                                                className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: occasion?.colors.accent || '#d4af37' }}
                                                animate={{
                                                    boxShadow: [
                                                        '0 0 10px rgba(212, 175, 55, 0.5)',
                                                        '0 0 20px rgba(212, 175, 55, 0.8)',
                                                        '0 0 10px rgba(212, 175, 55, 0.5)'
                                                    ]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <span className="text-xl">{occasion?.icon || '✉️'}</span>
                                            </motion.div>

                                            {/* 수신자 이름 */}
                                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                                <p className="text-white/60 text-xs">To.</p>
                                                <p className="text-gold-400 font-medium">{cardData.recipientName}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* 안내 텍스트 */}
                                    <motion.p
                                        className="mt-8 text-white/60"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        클릭하여 카드를 열어보세요 ✨
                                    </motion.p>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            className="w-full max-w-lg"
                        >
                            <CardPreview data={cardData} showAnimation={true} />

                            {/* 코치 프로필 섹션 */}
                            {cardData.coach && (
                                <motion.div
                                    className="mt-8 glass rounded-2xl p-6 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <p className="text-white/40 text-xs tracking-widest uppercase mb-3">
                                        From Your Coach
                                    </p>

                                    {/* 코치 이름 & 타이틀 */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-elegant font-semibold text-gold-gradient">
                                            {cardData.coach.name}
                                        </h3>
                                        <p className="text-white/60 text-sm mt-1">
                                            {cardData.coach.title}
                                        </p>
                                    </div>

                                    {/* 코치 소개 */}
                                    {cardData.coach.introduction && (
                                        <p className="text-white/70 text-sm leading-relaxed mb-4">
                                            {cardData.coach.introduction}
                                        </p>
                                    )}

                                    {/* 구분선 */}
                                    <div className="divider-elegant w-16 mx-auto mb-4" />

                                    {/* 연락처 링크 */}
                                    {cardData.coach.contact && (
                                        <div className="flex justify-center gap-3">
                                            {cardData.coach.contact.email && (
                                                <a
                                                    href={`mailto:${cardData.coach.contact.email}`}
                                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                                                    title="이메일"
                                                >
                                                    <span className="text-lg">✉️</span>
                                                </a>
                                            )}
                                            {cardData.coach.contact.instagram && (
                                                <a
                                                    href={`https://instagram.com/${cardData.coach.contact.instagram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                                                    title="인스타그램"
                                                >
                                                    <span className="text-lg">📸</span>
                                                </a>
                                            )}
                                            {cardData.coach.contact.kakao && (
                                                <a
                                                    href={cardData.coach.contact.kakao}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all border border-white/10"
                                                    title="카카오톡"
                                                >
                                                    <span className="text-lg">💬</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* 답장하기 섹션 */}
                            <motion.div
                                className="mt-8 w-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.0 }}
                            >
                                {!showReplyForm && !replySent && (
                                    <motion.button
                                        onClick={() => setShowReplyForm(true)}
                                        className="w-full py-4 glass rounded-2xl text-white hover:bg-white/10 transition-colors border border-white/10"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="text-xl">💌</span>
                                            감사 인사 보내기
                                        </span>
                                    </motion.button>
                                )}

                                {showReplyForm && !replySent && (
                                    <motion.div
                                        className="glass rounded-2xl p-6"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="text-lg font-medium text-white mb-4 text-center">
                                            💌 한마디 남기기
                                        </h4>
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="감사의 마음을 전해보세요..."
                                            rows={4}
                                            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none mb-4"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowReplyForm(false)}
                                                className="flex-1 py-3 glass rounded-xl text-white/60 hover:bg-white/5 transition-colors"
                                            >
                                                취소
                                            </button>
                                            <motion.button
                                                onClick={() => {
                                                    // TODO: 실제 이메일 전송 또는 Supabase 저장 구현
                                                    if (cardData?.coach?.contact?.email) {
                                                        const subject = encodeURIComponent(`[답장] ${cardData.recipientName}님으로부터 메시지가 도착했습니다`);
                                                        const body = encodeURIComponent(`${replyMessage}\n\n---\n${cardData.recipientName} 드림`);
                                                        window.open(`mailto:${cardData.coach.contact.email}?subject=${subject}&body=${body}`);
                                                    }
                                                    setReplySent(true);
                                                    setShowReplyForm(false);
                                                }}
                                                disabled={!replyMessage.trim()}
                                                className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-medium rounded-xl disabled:opacity-50"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                보내기 ✨
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {replySent && (
                                    <motion.div
                                        className="glass rounded-2xl p-6 text-center"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <span className="text-4xl mb-3 block">💛</span>
                                        <p className="text-gold-400 font-medium">메시지가 전송되었어요!</p>
                                        <p className="text-white/60 text-sm mt-1">곧 확인할게요 😊</p>
                                    </motion.div>
                                )}
                            </motion.div>


                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

export default function CardPage() {
    return (
        <main className="min-h-screen relative">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white/60">로딩 중...</div>
                </div>
            }>
                <CardContent />
            </Suspense>
        </main>
    );
}
