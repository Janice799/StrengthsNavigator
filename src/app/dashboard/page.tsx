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
    getAllClients,
    createClient2,
    updateClient,
    deleteClient,
    SentCard,
    ClientLastContact,
    CardReply,
    Client
} from '@/lib/supabase';
import strengthsI18n from '@/config/strengths_i18n.json';

// 강점 정보 (Gallup 공식 한국어)
const STRENGTHS: Record<string, { name: string; emoji: string }> = {
    'achiever': { name: '성취', emoji: '🏆' },
    'activator': { name: '행동', emoji: '⚡' },
    'adaptability': { name: '적응', emoji: '🌊' },
    'analytical': { name: '분석', emoji: '🔍' },
    'arranger': { name: '정리', emoji: '🧩' },
    'belief': { name: '신념', emoji: '💫' },
    'command': { name: '주도력', emoji: '👑' },
    'communication': { name: '커뮤니케이션', emoji: '💬' },
    'competition': { name: '경쟁', emoji: '🏅' },
    'connectedness': { name: '연결', emoji: '🔗' },
    'consistency': { name: '일관성', emoji: '⚖️' },
    'context': { name: '맥락', emoji: '📚' },
    'deliberative': { name: '심사숙고', emoji: '🤔' },
    'developer': { name: '개발', emoji: '🌱' },
    'discipline': { name: '체계', emoji: '📋' },
    'empathy': { name: '공감', emoji: '💝' },
    'focus': { name: '집중', emoji: '🎯' },
    'futuristic': { name: '미래지향', emoji: '🔮' },
    'harmony': { name: '화합', emoji: '🤝' },
    'ideation': { name: '발상', emoji: '💡' },
    'includer': { name: '포용', emoji: '🤗' },
    'individualization': { name: '개별화', emoji: '👤' },
    'input': { name: '수집', emoji: '📥' },
    'intellection': { name: '지적사고', emoji: '🧠' },
    'learner': { name: '배움', emoji: '📖' },
    'maximizer': { name: '극대화', emoji: '📈' },
    'positivity': { name: '긍정', emoji: '😊' },
    'relator': { name: '절친', emoji: '❤️' },
    'responsibility': { name: '책임', emoji: '✓' },
    'restorative': { name: '복구', emoji: '🔧' },
    'self-assurance': { name: '자기확신', emoji: '💪' },
    'significance': { name: '중요성', emoji: '⭐' },
    'strategic': { name: '전략', emoji: '♟️' },
    'woo': { name: '사교성', emoji: '🎉' },
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

// 정확한 날짜 포맷 (YYYY-MM-DD HH:MM)
function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function DashboardPage() {
    const [recentCards, setRecentCards] = useState<SentCard[]>([]);
    const [followupClients, setFollowupClients] = useState<ClientLastContact[]>([]);
    const [unreadReplies, setUnreadReplies] = useState<CardReply[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [stats, setStats] = useState({ totalClients: 0, totalCardsSent: 0, clientsNeedingFollowup: 0 });
    const [loading, setLoading] = useState(true);
    const [showClientForm, setShowClientForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'clients'>('overview');

    useEffect(() => {
        async function loadData() {
            try {
                const [cards, followups, dashStats, replies, clients] = await Promise.all([
                    getRecentCards(10),
                    getClientsNeedingFollowup(),
                    getDashboardStats(),
                    getUnreadReplies(),
                    getAllClients()
                ]);
                setRecentCards(cards);
                setFollowupClients(followups);
                setStats(dashStats);
                setUnreadReplies(replies);
                setAllClients(clients);
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

    // 고객 저장 (추가/수정)
    const handleSaveClient = async (clientData: Partial<Client>) => {
        if (editingClient) {
            // 수정
            const updated = await updateClient(editingClient.id, clientData);
            if (updated) {
                setAllClients(prev => prev.map(c => c.id === updated.id ? updated : c));
                setShowClientForm(false);
                setEditingClient(null);
                alert('✅ 고객 정보가 수정되었습니다!');
            }
        } else {
            // 추가
            const newClient = await createClient2(clientData);
            if (newClient) {
                setAllClients(prev => [newClient, ...prev]);
                setStats(prev => ({ ...prev, totalClients: prev.totalClients + 1 }));
                setShowClientForm(false);
                alert('✅ 새 고객이 등록되었습니다!');
            }
        }
    };

    // 고객 삭제
    const handleDeleteClient = async (id: string) => {
        if (confirm('정말 이 고객을 삭제하시겠습니까?')) {
            const success = await deleteClient(id);
            if (success) {
                setAllClients(prev => prev.filter(c => c.id !== id));
                setStats(prev => ({ ...prev, totalClients: prev.totalClients - 1 }));
                alert('🗑️ 고객이 삭제되었습니다.');
            }
        }
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

                    {/* 탭 메뉴 */}
                    <div className="flex gap-4 mt-6 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'overview'
                                ? 'text-gold-400 border-b-2 border-gold-400'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            👀 개요
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'clients'
                                ? 'text-gold-400 border-b-2 border-gold-400'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            👥 전체 고객 (Clients)
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-white/60">로딩 중...</div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* 개요 탭 */}
                        {activeTab === 'overview' && (
                            <>
                                {/* 통계 카드 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <motion.div
                                        className="glass rounded-2xl p-6 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <p className="text-3xl font-bold text-gold-400">{stats.totalClients}</p>
                                        <p className="text-white/60 mt-1">전체 고객 (Clients)</p>
                                    </motion.div>
                                    <motion.div
                                        className="glass rounded-2xl p-6 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-3xl font-bold text-gold-400">{stats.totalCardsSent}</p>
                                        <p className="text-white/60 mt-1">발송한 카드 (Sent Cards)</p>
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
                                            💌 받은 답장 (Card Replies)
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
                                                            답장 날짜: {formatDate(reply.created_at)}
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
                                    <h2 className="text-lg font-bold text-white mb-4">📬 발송한 카드 (Sent Cards)</h2>
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
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">받는 사람: {card.client_name}</p>
                                                            <div className="flex flex-wrap gap-2 text-sm text-white/60 mt-1">
                                                                {card.situation && (
                                                                    <span>{SITUATIONS[card.situation]?.emoji} {SITUATIONS[card.situation]?.name}</span>
                                                                )}
                                                            </div>
                                                            {card.strength && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {card.strength.split(',').map((s, i) => STRENGTHS[s.trim()] && (
                                                                        <span key={i} className="text-xs px-2 py-0.5 bg-gold-500/20 text-gold-400 rounded-full">
                                                                            {STRENGTHS[s.trim()]?.emoji} {STRENGTHS[s.trim()]?.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white/60 text-sm">
                                                            발송일: {formatDateTime(card.sent_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}

                        {/* 전체 고객 탭 */}
                        {activeTab === 'clients' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">👥 전체 고객 관리</h2>
                                    <button
                                        onClick={() => {
                                            setEditingClient(null);
                                            setShowClientForm(true);
                                        }}
                                        className="px-4 py-2 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                    >
                                        + 새 고객 추가
                                    </button>
                                </div>

                                {/* 고객 추가/수정 폼 */}
                                {showClientForm && (
                                    <div className="glass rounded-2xl p-6 border border-gold-400/30">
                                        <h3 className="text-lg font-bold text-white mb-4">
                                            {editingClient ? '고객 정보 수정' : '새 고객 등록'}
                                        </h3>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            handleSaveClient({
                                                name: formData.get('name') as string,
                                                email: formData.get('email') as string || undefined,
                                                phone: formData.get('phone') as string || undefined,
                                                strength_1: formData.get('strength_1') as string || undefined,
                                                strength_2: formData.get('strength_2') as string || undefined,
                                                strength_3: formData.get('strength_3') as string || undefined,
                                                strength_4: formData.get('strength_4') as string || undefined,
                                                strength_5: formData.get('strength_5') as string || undefined,
                                                memo: formData.get('memo') as string || undefined,
                                            });
                                        }} className="space-y-4">
                                            <div>
                                                <label className="block text-white/80 text-sm mb-1">이름 (필수)</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    defaultValue={editingClient?.name || ''}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                                                    placeholder="고객 이름"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">이메일</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        defaultValue={editingClient?.email || ''}
                                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                                                        placeholder="example@email.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">전화번호</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        defaultValue={editingClient?.phone || ''}
                                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                                                        placeholder="010-1234-5678"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-white/80 text-sm mb-2">강점 5개 선택</label>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <select
                                                            key={num}
                                                            name={`strength_${num}`}
                                                            defaultValue={editingClient?.[`strength_${num}` as keyof Client] as string || ''}
                                                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                                                        >
                                                            <option value="">강점 {num}</option>
                                                            {Object.entries(strengthsI18n).map(([id, strength]) => (
                                                                <option key={id} value={id} className="bg-ocean-900">
                                                                    {strength.emoji} {strength.ko}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-white/80 text-sm mb-1">특이사항 / 메모</label>
                                                <textarea
                                                    name="memo"
                                                    rows={3}
                                                    defaultValue={editingClient?.memo || ''}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none"
                                                    placeholder="고객에 대한 특이사항이나 메모를 입력하세요"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="flex-1 px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                                >
                                                    💾 저장
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowClientForm(false);
                                                        setEditingClient(null);
                                                    }}
                                                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* 고객 목록 */}
                                {allClients.length === 0 ? (
                                    <div className="glass rounded-2xl p-12 text-center">
                                        <p className="text-white/50 mb-4">등록된 고객이 없습니다</p>
                                    </div>
                                ) : (
                                    <div className="glass rounded-2xl p-6">
                                        <div className="space-y-3">
                                            {allClients.map((client) => (
                                                <div key={client.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h3 className="text-white font-bold text-lg">{client.name}</h3>
                                                            <div className="flex gap-4 mt-1 text-sm text-white/60">
                                                                {client.email && <span>📧 {client.email}</span>}
                                                                {client.phone && <span>📞 {client.phone}</span>}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {[client.strength_1, client.strength_2, client.strength_3, client.strength_4, client.strength_5]
                                                                    .filter(Boolean)
                                                                    .map((s, i) => {
                                                                        const strength = strengthsI18n[s as keyof typeof strengthsI18n];
                                                                        return strength ? (
                                                                            <span key={i} className="px-2 py-1 bg-gold-500/20 text-gold-400 rounded-full text-xs">
                                                                                {strength.emoji} {strength.ko}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                            </div>
                                                            {client.memo && (
                                                                <p className="mt-2 text-white/50 text-sm">💡 {client.memo}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingClient(client);
                                                                    setShowClientForm(true);
                                                                }}
                                                                className="text-gold-400 hover:text-gold-300 text-sm px-3 py-1 bg-gold-500/10 rounded-lg"
                                                            >
                                                                ✏️ 수정
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClient(client.id)}
                                                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg"
                                                            >
                                                                🗑️ 삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
