'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    getRecentCards,
    getClientsNeedingFollowup,
    getDashboardStats,
    getUnreadReplies,
    markReplyAsRead,
    SentCard,
    ClientLastContact,
    CardReply
} from '@/lib/supabase';

// 강점 정보
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

const SEASONS: Record<string, { name: string; emoji: string }> = {
    'spring': { name: '봄', emoji: '🌸' },
    'summer': { name: '여름', emoji: '☀️' },
    'autumn': { name: '가을', emoji: '🍂' },
    'winter': { name: '겨울', emoji: '❄️' },
};

const SITUATIONS: Record<string, { name: string; emoji: string }> = {
    'new_year': { name: '새해', emoji: '🎊' },
    'christmas': { name: '크리스마스', emoji: '🎄' },
    'birthday': { name: '생일', emoji: '🎂' },
    'promotion': { name: '승진', emoji: '🎉' },
    'graduation': { name: '졸업', emoji: '🎓' },
    'wedding': { name: '결혼', emoji: '💒' },
    'vacation': { name: '휴가', emoji: '✈️' },
    'comfort': { name: '위로', emoji: '💝' },
    'encouragement': { name: '응원', emoji: '💪' },
    'gratitude': { name: '감사', emoji: '🙏' },
};

// 별 애니메이션
function FloatingStars() {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 30 }, (_, i) => ({
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

// 날짜 포맷
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
}

export default function DashboardPage() {
    const [recentCards, setRecentCards] = useState<SentCard[]>([]);
    const [followupClients, setFollowupClients] = useState<ClientLastContact[]>([]);
    const [unreadReplies, setUnreadReplies] = useState<CardReply[]>([]);
    const [stats, setStats] = useState({ totalClients: 0, totalCardsSent: 0, clientsNeedingFollowup: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [cards, followups, dashStats, replies] = await Promise.all([
                    getRecentCards(10),
                    getClientsNeedingFollowup(),
                    getDashboardStats(),
                    getUnreadReplies()
                ]);
                setRecentCards(cards);
                setFollowupClients(followups);
                setStats(dashStats);
                setUnreadReplies(replies);
            } catch (error) {
                console.error('대시보드 데이터 로드 오류:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // 답장 읽음 처리
    const handleMarkAsRead = async (replyId: string) => {
        await markReplyAsRead(replyId);
        setUnreadReplies(prev => prev.filter(r => r.id !== replyId));
    };

    // 로그아웃
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <FloatingStars />

            <div className="relative z-10 min-h-screen py-8 px-4">
                {/* 헤더 */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/60 hover:text-gold-400 transition-colors">
                            ← 홈으로
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-elegant font-bold text-gold-gradient">대시보드</h1>
                            <p className="text-white/60 text-sm mt-1">고객 관리 & 카드 발송 현황</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/create" className="text-gold-400 hover:text-gold-300 transition-colors">
                                + 카드 만들기
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white/40 hover:text-red-400 transition-colors text-sm"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-white/60">로딩 중...</div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* 통계 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                                className="glass rounded-2xl p-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-3xl font-bold text-gold-400">{stats.totalClients}</p>
                                <p className="text-white/60 mt-1">전체 고객</p>
                            </motion.div>
                            <motion.div
                                className="glass rounded-2xl p-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-3xl font-bold text-gold-400">{stats.totalCardsSent}</p>
                                <p className="text-white/60 mt-1">발송한 카드</p>
                            </motion.div>
                            <motion.div
                                className="glass rounded-2xl p-6 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p className="text-3xl font-bold text-red-400">{stats.clientsNeedingFollowup}</p>
                                <p className="text-white/60 mt-1">안부 필요 고객</p>
                            </motion.div>
                        </div>

                        {/* 새 답장 알림 */}
                        {unreadReplies.length > 0 && (
                            <motion.div
                                className="glass rounded-2xl p-6 border border-gold-400/30"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <h2 className="text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                                    💌 새 답장
                                    <span className="bg-gold-500 text-ocean-900 text-xs font-bold px-2 py-1 rounded-full">
                                        {unreadReplies.length}
                                    </span>
                                </h2>
                                <div className="space-y-3">
                                    {unreadReplies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="flex items-start justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{reply.recipient_name}</p>
                                                <p className="text-white/70 text-sm mt-1">
                                                    "{reply.message}"
                                                </p>
                                                <p className="text-white/40 text-xs mt-2">
                                                    {formatDate(reply.created_at)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleMarkAsRead(reply.id)}
                                                className="text-gold-400 hover:text-gold-300 text-sm ml-4"
                                            >
                                                읽음 ✓
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* 안부 필요 알림 */}
                        {followupClients.length > 0 && (
                            <motion.div
                                className="glass rounded-2xl p-6 border border-red-400/30"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                    🔔 안부를 물을 때가 된 고객
                                    <span className="text-xs font-normal text-white/50">(마지막 카드 발송 후 3개월 경과)</span>
                                </h2>
                                <div className="space-y-3">
                                    {followupClients.map((client) => (
                                        <div
                                            key={client.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{client.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {[client.strength_1, client.strength_2, client.strength_3].filter(Boolean).map((s, i) => (
                                                        <span key={i} className="text-xs text-gold-400/70">
                                                            {STRENGTHS[s || '']?.emoji} {STRENGTHS[s || '']?.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/60 text-sm">
                                                    {client.last_card_sent
                                                        ? `${client.days_since_last_card}일 전 발송`
                                                        : '카드 발송 이력 없음'
                                                    }
                                                </p>
                                                <Link
                                                    href={`/create?client=${encodeURIComponent(client.name)}`}
                                                    className="text-gold-400 text-sm hover:text-gold-300"
                                                >
                                                    카드 보내기 →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* 최근 발송 카드 */}
                        <motion.div
                            className="glass rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-lg font-bold text-white mb-4">📬 최근 발송한 카드</h2>
                            {recentCards.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-white/50 mb-4">아직 발송한 카드가 없습니다</p>
                                    <Link
                                        href="/create"
                                        className="inline-block px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                    >
                                        첫 카드 만들기 ✨
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">
                                                    {SEASONS[card.season || '']?.emoji || '✉️'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{card.client_name}</p>
                                                    <div className="flex gap-2 text-sm text-white/60">
                                                        {card.situation && (
                                                            <span>{SITUATIONS[card.situation]?.emoji} {SITUATIONS[card.situation]?.name}</span>
                                                        )}
                                                        {card.strength && (
                                                            <span className="text-gold-400/70">
                                                                {STRENGTHS[card.strength]?.emoji} {STRENGTHS[card.strength]?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/60 text-sm">
                                                    {formatDate(card.sent_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </main>
    );
}
