'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScratchCard from '@/components/effects/ScratchCard';
import coachProfile from '@/config/coach_profile.json';
import i18n from '@/config/i18n.json';
import strengthsI18n from '@/config/strengths_i18n.json';
import { saveCardReply, getCardById, SentCard } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

type Language = 'ko' | 'en';
type I18nTexts = typeof i18n.ko;

// 다국어 강점 정보 (card/page.tsx와 동일)
const STRENGTHS: Record<string, { name: string; emoji: string }> = {
    'achiever': { name: '성취', emoji: '🏆' },
    'activator': { name: '활성화', emoji: '⚡' },
    'adaptability': { name: '적응성', emoji: '🌊' },
    'analytical': { name: '분석', emoji: '🔍' },
    'arranger': { name: '배열', emoji: '🧩' },
    'belief': { name: '신념', emoji: '💫' },
    'command': { name: '지휘', emoji: '👑' },
    'communication': { name: '커뮤니케이션', emoji: '💬' },
    'competition': { name: '경쟁', emoji: '🏅' },
    'connectedness': { name: '연결성', emoji: '🔗' },
    'consistency': { name: '일관성', emoji: '⚖️' },
    'context': { name: '맥락', emoji: '📚' },
    'deliberative': { name: '심사숙고', emoji: '🤔' },
    'developer': { name: '성장촉진', emoji: '🌱' },
    'discipline': { name: '규율', emoji: '📋' },
    'empathy': { name: '공감', emoji: '💝' },
    'focus': { name: '집중', emoji: '🎯' },
    'futuristic': { name: '미래지향', emoji: '🔮' },
    'harmony': { name: '화합', emoji: '🤝' },
    'ideation': { name: '아이디어', emoji: '💡' },
    'includer': { name: '포용', emoji: '🤗' },
    'individualization': { name: '개별화', emoji: '👤' },
    'input': { name: '수집', emoji: '📥' },
    'intellection': { name: '지적사고', emoji: '🧠' },
    'learner': { name: '학습', emoji: '📖' },
    'maximizer': { name: '극대화', emoji: '📈' },
    'positivity': { name: '긍정', emoji: '😊' },
    'relator': { name: '친밀', emoji: '❤️' },
    'responsibility': { name: '책임', emoji: '✓' },
    'restorative': { name: '복구', emoji: '🔧' },
    'self-assurance': { name: '자기확신', emoji: '💪' },
    'significance': { name: '중요성', emoji: '⭐' },
    'strategic': { name: '전략', emoji: '♟️' },
    'woo': { name: '사교', emoji: '🎉' },
};

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
function CoachProfile({ onReply }: { onReply: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 max-w-md mx-auto"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400/50 flex-shrink-0">
                    <img
                        src={coachProfile.photo}
                        alt={coachProfile.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{coachProfile.name}</h3>
                    <p className="text-gold-400 text-sm">{coachProfile.title}</p>
                </div>
            </div>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
                {coachProfile.introduction}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onReply}
                    className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all"
                >
                    💌 코치에게 답장하기
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-4 text-sm">
                {coachProfile.website && (
                    <a href={coachProfile.website} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-400 transition-colors">
                        🌐 홈페이지
                    </a>
                )}
                {coachProfile.email && (
                    <a href={`mailto:${coachProfile.email}`} className="text-white/50 hover:text-gold-400 transition-colors">
                        ✉️ 이메일
                    </a>
                )}
                {coachProfile.social.kakao_channel && (
                    <a href={coachProfile.social.kakao_channel} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-400 transition-colors">
                        💬 카카오톡
                    </a>
                )}
            </div>
        </motion.div>
    );
}

// 답장 폼 컴포넌트
function ReplyForm({ recipientName, cardId, onClose, onSuccess }: { recipientName: string; cardId?: string; onClose: () => void; onSuccess: () => void; }) {
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
            alert('답장 전송 중 오류가 발생했습니다.');
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
                <h3 className="text-xl font-bold text-white mb-4">💌 {coachProfile.name} 코치에게 답장</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm mb-2">보내는 분: {recipientName}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="코치에게 전하고 싶은 말을 적어주세요..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 resize-none"
                            rows={5}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors">취소</button>
                        <button type="submit" disabled={!message.trim() || isSending} className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl disabled:opacity-50">
                            {isSending ? '전송 중...' : '답장 보내기'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// 카드 내용 컴포넌트
function CardContent({ recipientName, strengths, situation, coachMessage, lang = 'ko' }: { recipientName: string; strengths: string[]; situation: string; coachMessage: string; lang?: Language; }) {
    const strengthsList = strengths.map(id => {
        const s = strengthsI18n[id as keyof typeof strengthsI18n];
        return s ? { name: s[lang], emoji: s.emoji } : null;
    }).filter(Boolean);

    return (
        <div className="premium-card card-corner rounded-2xl p-3 sm:p-4 w-full h-full flex flex-col bg-gradient-to-br from-ocean-800 to-ocean-900">
            <div className="text-center mb-1">
                <p className="text-gold-400 text-xs sm:text-sm font-semibold tracking-wide mb-1">LIFELITERACY Selli</p>
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
                <p className="text-gold-400 font-signature text-base sm:text-lg">{i18n[lang].from} {coachProfile.name}</p>
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

    const langParam = searchParams.get('lang');
    const lang = (langParam === 'en' ? 'en' : 'ko') as Language;
    const t = i18n[lang];

    useEffect(() => {
        async function loadCard() {
            if (params.id) {
                const data = await getCardById(params.id);
                setCardData(data);
            }
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

    const shareToKakao = () => {
        if (!cardData) return;
        const recipientName = cardData.client_name;
        // 강점 콤마로 분리된 문자열을 그대로 사용
        const strengthsStr = cardData.strength || '';

        if (typeof window !== 'undefined' && (window as any).Kakao?.Share) {
            (window as any).Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${recipientName}님께 강점 카드가 도착했어요! 💌`,
                    description: '긁어서 확인해보세요 ✨',
                    imageUrl: `${window.location.origin}/api/og?name=${encodeURIComponent(recipientName)}&strengths=${strengthsStr}`,
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 복사되었습니다! 카카오톡에 붙여넣기 하세요.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-ocean-900 text-white">카드를 불러오는 중...</div>;
    if (!cardData) return <div className="min-h-screen flex items-center justify-center bg-ocean-900 text-white">존재하지 않는 카드입니다.</div>;

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
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <motion.div className="mb-6 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-xl font-elegant font-semibold text-gold-gradient">LIFELITERACY Selli</h1>
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
                        />
                    </ScratchCard>
                </motion.div>

                {isRevealed && (
                    <div className="mt-8 w-full max-w-md space-y-6">
                        {replySent && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-center">
                                <p className="text-green-400 font-medium">✅ 답장이 코치에게 전달되었습니다!</p>
                            </motion.div>
                        )}
                        <CoachProfile onReply={() => setShowReplyForm(true)} />
                        <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <button onClick={shareToKakao} className="flex-1 py-3 bg-[#FEE500] text-black font-bold rounded-xl hover:bg-[#FDD800] transition-colors flex items-center justify-center gap-2">
                                💬 {t.kakaoShare}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert(t.linkCopied); }} className="flex-1 py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors">
                                🔗 {t.copyLink}
                            </button>
                        </motion.div>
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
