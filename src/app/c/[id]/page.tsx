'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScratchCard from '@/components/effects/ScratchCard';
import SeasonalEffect from '@/components/effects/SeasonalEffect';
import coachProfile from '@/config/coach_profile.json';
import i18n from '@/config/i18n.json';
import strengthsI18n from '@/config/strengths_i18n.json';
import { saveCardReply, getCardById, SentCard, getPublicCoachProfile } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Language = 'ko' | 'en';
type I18nTexts = typeof i18n.ko;

// strengths_i18n.json 파일을 사용하므로 별도 객체 불필요

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

// 코치 프로필 컴포넌트
function CoachProfile({ onReply, coachName, profileImageUrl, description, title, t }: { onReply: () => void; coachName?: string; profileImageUrl?: string; description?: string; title?: string; t: I18nTexts }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 max-w-md mx-auto"
        >
            <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400/50 mb-3 bg-white/10 flex items-center justify-center">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={coachName || coachProfile.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <svg className="w-10 h-10 text-gold-400/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    )}
                </div>
                <h3 className="text-white font-bold text-lg text-center">{coachName || coachProfile.name}</h3>
                <p className="text-gold-400 text-sm text-center whitespace-pre-line">{title || coachProfile.title}</p>
            </div>
            <p className="text-white/70 text-sm mb-4 leading-relaxed text-center whitespace-pre-line">
                {description || coachProfile.introduction}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onReply}
                    className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all"
                >
                    {t.replyToCoach}
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-4 text-sm">
                {coachProfile.website && (
                    <a href={coachProfile.website} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-400 transition-colors">
                        {t.website}
                    </a>
                )}
                {coachProfile.email && (
                    <a href={`mailto:${coachProfile.email}`} className="text-white/50 hover:text-gold-400 transition-colors">
                        {t.email}
                    </a>
                )}
                {coachProfile.social.kakao_channel && (
                    <a href={coachProfile.social.kakao_channel} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-400 transition-colors">
                        {t.kakao}
                    </a>
                )}
            </div>
        </motion.div>
    );
}

// 답장 폼 컴포넌트
function ReplyForm({ recipientName, cardId, onClose, onSuccess, t, coachName }: { recipientName: string; cardId?: string; onClose: () => void; onSuccess: () => void; t: I18nTexts; coachName: string }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardId,
                    recipientName,
                    message: message.trim(),
                }),
            });

            if (!response.ok) throw new Error('Failed to send reply');

            onSuccess();
        } catch (error) {
            console.error('답장 전송 오류:', error);
            alert(t.replyError);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-white mb-4">💌 {t.replyTitle}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-2">{t.sender}: {recipientName}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t.replyPlaceholder}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none"
                            rows={5}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors">{t.cancel}</button>
                        <button type="submit" disabled={!message.trim() || isSending} className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl disabled:opacity-50">
                            {isSending ? t.sending : t.sendReply}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// 카드 내용 컴포넌트
function CardContent({ recipientName, strengths, situation, coachMessage, lang = 'ko', brandName, coachName }: { recipientName: string; strengths: string[]; situation: string; coachMessage: string; lang?: Language; brandName?: string; coachName?: string; }) {
    const strengthsList = strengths.map(id => {
        const s = strengthsI18n[id as keyof typeof strengthsI18n];
        return s ? { name: s[lang], emoji: s.emoji } : null;
    }).filter(Boolean);

    return (
        <div className="premium-card card-corner rounded-2xl p-3 sm:p-4 w-full h-full flex flex-col bg-gradient-to-br from-ocean-800 to-ocean-900">
            <div className="text-center mb-1">
                <p className="text-gold-400 text-xs sm:text-sm font-semibold tracking-wide mb-1">{brandName || 'StrengthsNavigator'}</p>
                <h2 className="text-gold-400 font-signature text-lg sm:text-xl">
                    {i18n[lang].to} {recipientName || (lang === 'ko' ? '받는 분' : 'Dear Friend')}
                </h2>
            </div>
            {strengthsList.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {strengthsList.map((s: any, i: number) => s && (
                        <span key={i} className="px-1.5 py-0.5 bg-gold-500/15 border border-gold-400/20 rounded-full text-gold-400 text-[11px]">
                            {s.emoji} {s.name}
                        </span>
                    ))}
                </div>
            )}
            {situation && (
                <div className="mb-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/50 text-[10px] leading-relaxed font-elegant whitespace-pre-wrap text-center">
                        {situation}
                    </p>
                </div>
            )}
            <div className="flex-1 overflow-y-auto py-2 px-1">
                <p className="text-white leading-relaxed font-elegant text-center text-sm whitespace-pre-wrap">
                    {coachMessage || '특별한 메시지'}
                </p>
            </div>
            <div className="divider-elegant w-12 mx-auto my-1.5" />
            <div className="text-center">
                <p className="text-gold-400 font-signature text-base sm:text-lg">{i18n[lang].from} {coachName || coachProfile.name}</p>
            </div>
        </div>
    );
}

function ShortCardContent({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const [cardData, setCardData] = useState<SentCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRevealed, setIsRevealed] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replySent, setReplySent] = useState(false);
    const [cardSize, setCardSize] = useState({ width: 320, height: 440 });
    const [coachInfo, setCoachInfo] = useState({
        brand_name: 'StrengthsNavigator',
        nickname: '',
        name: '',
        profile_image_url: '',
        description: '',
        title: '',
        title_en: '',
        description_en: ''
    });
    const [isCoach, setIsCoach] = useState(false);

    const langParam = searchParams.get('lang');
    const lang = (langParam === 'en' ? 'en' : 'ko') as Language;
    const t = i18n[lang];

    useEffect(() => {
        async function loadCard() {
            if (params.id) {
                const data = await getCardById(params.id);
                setCardData(data);
            }

            // 프로필 정보 로드
            const profile = await getPublicCoachProfile();
            if (profile) {
                setCoachInfo({
                    brand_name: profile.brand_name || 'StrengthsNavigator',
                    nickname: profile.nickname || profile.name || '',
                    name: profile.name || '',
                    profile_image_url: profile.profile_image_url || '',
                    description: profile.description || '',
                    title: profile.title || '',
                    title_en: profile.title_en || '',
                    description_en: profile.description_en || ''
                });
            }

            // 코치 로그인 상태 확인
            const user = await getCurrentUser();
            setIsCoach(!!user);

            setLoading(false);
        }
        loadCard();
    }, [params.id]);

    useEffect(() => {
        const updateCardSize = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            if (screenWidth < 400) {
                setCardSize({ width: Math.min(screenWidth - 32, 300), height: Math.min(screenHeight * 0.55, 420) });
            } else if (screenWidth < 768) {
                setCardSize({ width: Math.min(screenWidth - 48, 340), height: Math.min(screenHeight * 0.58, 460) });
            } else {
                setCardSize({ width: 360, height: 500 });
            }
        };
        updateCardSize();
        window.addEventListener('resize', updateCardSize);
        return () => window.removeEventListener('resize', updateCardSize);
    }, []);

    const handleReveal = () => {
        setIsRevealed(true);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
    };

    const handleReplySuccess = () => {
        setShowReplyForm(false);
        setReplySent(true);
    };

    // 공유하기 (Web Share API)
    const shareCard = async () => {
        if (!cardData) return;
        const recipientName = cardData.client_name;

        const shareData = {
            title: lang === 'en'
                ? `${recipientName}, you have a strength card! 💌`
                : `${recipientName}님께 강점 카드가 도착했어요! 💌`,
            text: lang === 'en'
                ? 'Open to discover your strengths ✨'
                : '열어서 확인해보세요 ✨',
            url: window.location.href,
        };

        // Web Share API 지원 여부 확인
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // 사용자가 공유를 취소한 경우
                if ((err as Error).name !== 'AbortError') {
                    console.error('공유 실패:', err);
                    navigator.clipboard.writeText(window.location.href);
                    alert(t.shareFallback);
                }
            }
        } else {
            // Web Share API 미지원 시 링크 복사로 대체
            navigator.clipboard.writeText(window.location.href);
            alert(t.shareFallback);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-ocean-900 text-white">{t.loading}</div>;
    if (!cardData) return <div className="min-h-screen flex items-center justify-center bg-ocean-900 text-white">{t.cardNotFound}</div>;

    // 강점 데이터를 배열로 변환
    const strengths = cardData.strength ? cardData.strength.split(',') : [];

    return (
        <main className="min-h-screen relative overflow-hidden">
            <FloatingStars />
            {confetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: -20,
                                backgroundColor: ['#d4af37', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][i % 5],
                            }}
                            animate={{
                                y: [0, window.innerHeight + 100],
                                x: [0, (Math.random() - 0.5) * 200],
                                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: Math.random() * 0.5,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showReplyForm && (
                    <ReplyForm
                        recipientName={cardData.client_name}
                        cardId={cardData.id}
                        onClose={() => setShowReplyForm(false)}
                        onSuccess={handleReplySuccess}
                        t={t}
                        coachName={coachInfo.nickname || coachInfo.name}
                    />
                )}
            </AnimatePresence>

            {/* 계절 효과 표시 */}
            {cardData?.season && (
                <SeasonalEffect season={cardData.season as "winter" | "spring" | "summer" | "autumn"} count={30} />
            )}

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <motion.div className="mb-6 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-lg font-elegant font-semibold text-gold-gradient pb-1">{coachInfo.brand_name}</h1>
                    <p className="text-white/40 text-sm mt-1">{t.cardArrived}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                    <ScratchCard width={cardSize.width} height={cardSize.height} revealPercent={40} onReveal={handleReveal}>
                        <CardContent
                            recipientName={cardData.client_name}
                            strengths={strengths}
                            situation={cardData.situation_text || ''}
                            coachMessage={cardData.coach_message || ''}
                            lang={lang}
                            brandName={coachInfo.brand_name}
                            coachName={coachInfo.nickname || coachInfo.name}
                        />
                    </ScratchCard>
                </motion.div>

                {isRevealed && (
                    <div className="mt-8 w-full max-w-md space-y-6">
                        {replySent && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-center">
                                <p className="text-green-400 font-medium">{t.replySent}</p>
                            </motion.div>
                        )}
                        <CoachProfile
                            onReply={() => setShowReplyForm(true)}
                            coachName={coachInfo.nickname || coachInfo.name}
                            profileImageUrl={coachInfo.profile_image_url}
                            description={lang === 'en' && coachInfo.description_en ? coachInfo.description_en : coachInfo.description}
                            title={lang === 'en' && coachInfo.title_en ? coachInfo.title_en : coachInfo.title}
                            t={t}
                        />
                        <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <button onClick={shareCard} className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-colors flex items-center justify-center gap-2">
                                📤 {lang === 'en' ? 'Share' : '공유하기'}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert(t.linkCopied); }} className="flex-1 py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors">
                                🔗 {t.copyLink}
                            </button>
                        </motion.div>

                        {/* 코치 전용: 카드 만들기로 돌아가기 */}
                        {isCoach && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                <Link
                                    href="/create"
                                    className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 text-white/80 rounded-xl transition-colors border border-white/20"
                                >
                                    {t.newCard}
                                </Link>
                            </motion.div>
                        )}
                    </div>
                )}

                {!isRevealed && (
                    <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <p className="text-white/50 text-sm">{t.scratchHint}</p>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

export default function Page({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ocean-900 text-white">로딩 중...</div>}>
            <ShortCardContent params={params} />
        </Suspense>
    );
}
