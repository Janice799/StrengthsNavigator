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
    deleteSentCard,
    SentCard,
    ClientLastContact,
    CardReply,
    Client
} from '@/lib/supabase';
import strengthsI18n from '@/config/strengths_i18n.json';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import useLanguage, { LanguageToggle } from '@/hooks/useLanguage';

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
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'settings'>('overview');
    const [selectedCard, setSelectedCard] = useState<SentCard | null>(null);

    // 언어 Hook
    const { t, lang, mounted } = useLanguage();

    // 비밀번호 변경 상태
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    // 비밀번호 변경 - Supabase Auth 사용
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert(lang === 'en' ? '⚠️ Please fill in all fields.' : '⚠️ 모든 필드를 입력해주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert(lang === 'en' ? '⚠️ New passwords do not match.' : '⚠️ 새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 6) {
            alert(lang === 'en' ? '⚠️ Password must be at least 6 characters.' : '⚠️ 비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        try {
            // Supabase Auth로 비밀번호 변경
            const { signIn, updatePassword } = await import('@/lib/auth');
            const { getCurrentUser } = await import('@/lib/auth');

            const user = await getCurrentUser();
            if (!user?.email) {
                alert(lang === 'en' ? '❌ User not found.' : '❌ 사용자를 찾을 수 없습니다.');
                return;
            }

            // 현재 비밀번호 확인 (다시 로그인 시도)
            const signInResult = await signIn(user.email, currentPassword);
            if (!signInResult.success) {
                alert(lang === 'en' ? '❌ Current password is incorrect.' : '❌ 현재 비밀번호가 틀렸습니다.');
                return;
            }

            // 비밀번호 변경
            const result = await updatePassword(newPassword);
            if (result.success) {
                alert(lang === 'en' ? '✅ Password changed successfully!' : '✅ 비밀번호가 성공적으로 변경되었습니다!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert((lang === 'en' ? '❌ Failed to change password: ' : '❌ 비밀번호 변경 실패: ') + (result.error || ''));
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert(lang === 'en' ? '❌ Error changing password.' : '❌ 비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    // 로그아웃
    const handleLogout = async () => {
        // 클라이언트 사이드에서 Supabase 세션 삭제
        const { supabase } = await import('@/lib/auth');
        await supabase.auth.signOut();

        // 서버 사이드 쿠키 삭제
        await fetch('/api/auth/logout', { method: 'POST' });

        // 랜딩 페이지로 리다이렉트
        window.location.href = '/';
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <FloatingStars />

            {/* 카드 상세 보기 모달 */}
            {selectedCard && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCard(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gold-400">
                                📬 {lang === 'en' ? 'Sent Card' : '발송한 카드'}
                            </h3>
                            <button
                                onClick={() => setSelectedCard(null)}
                                className="text-white/60 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 받는 사람 */}
                        <div className="mb-4">
                            <p className="text-white/60 text-sm mb-1">
                                {lang === 'en' ? 'Recipient' : '받는 사람'}
                            </p>
                            <p className="text-white text-lg font-medium">{selectedCard.client_name}</p>
                        </div>

                        {/* 상황 */}
                        {selectedCard.situation && (
                            <div className="mb-4">
                                <p className="text-white/60 text-sm mb-1">
                                    {lang === 'en' ? 'Situation' : '상황'}
                                </p>
                                <p className="text-white">
                                    {SITUATIONS[selectedCard.situation]?.emoji} {SITUATIONS[selectedCard.situation]?.name}
                                </p>
                            </div>
                        )}

                        {/* 강점 */}
                        {selectedCard.strength && (
                            <div className="mb-4">
                                <p className="text-white/60 text-sm mb-2">
                                    {lang === 'en' ? 'Strengths' : '강점'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCard.strength.split(',').map((s, i) => STRENGTHS[s.trim()] && (
                                        <span key={i} className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-sm">
                                            {STRENGTHS[s.trim()]?.emoji} {STRENGTHS[s.trim()]?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 상황 설명 */}
                        {selectedCard.situation_text && (
                            <div className="mb-4">
                                <p className="text-white/60 text-sm mb-1">
                                    {lang === 'en' ? 'Situation Description' : '상황 설명'}
                                </p>
                                <p className="text-white/80 bg-white/5 p-3 rounded-lg whitespace-pre-wrap">
                                    {selectedCard.situation_text}
                                </p>
                            </div>
                        )}

                        {/* 코치 메시지 */}
                        <div className="mb-4">
                            <p className="text-white/60 text-sm mb-1">
                                💌 {lang === 'en' ? 'Message Content' : '메시지 내용'}
                            </p>
                            <div className="bg-gradient-to-br from-gold-500/10 to-gold-600/10 border border-gold-400/30 p-4 rounded-xl">
                                <p className="text-white leading-relaxed whitespace-pre-wrap">
                                    {selectedCard.coach_message || (lang === 'en' ? '(No message)' : '(메시지 없음)')}
                                </p>
                            </div>
                        </div>

                        {/* 발송일 */}
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-white/40 text-sm">
                                📅 {lang === 'en' ? 'Sent:' : '발송일:'} {formatDateTime(selectedCard.sent_at)}
                            </p>
                        </div>

                        {/* 카드 다시 보기 링크 */}
                        {selectedCard.id && !selectedCard.id.startsWith('local-') && (
                            <div className="mt-4 flex gap-3">
                                <a
                                    href={`/c/${selectedCard.id}?lang=${lang}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors text-sm"
                                >
                                    🔗 {lang === 'en' ? 'Open Card Link' : '카드 링크 열기'}
                                </a>
                                <button
                                    onClick={async () => {
                                        if (confirm(lang === 'en'
                                            ? 'Are you sure you want to delete this card? This action cannot be undone.'
                                            : '정말 이 카드를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) {
                                            const success = await deleteSentCard(selectedCard.id);
                                            if (success) {
                                                setRecentCards(prev => prev.filter(c => c.id !== selectedCard.id));
                                                setSelectedCard(null);
                                                alert(lang === 'en' ? '🗑️ Card deleted.' : '🗑️ 카드가 삭제되었습니다.');
                                            } else {
                                                alert(lang === 'en' ? '❌ Failed to delete card.' : '❌ 카드 삭제에 실패했습니다.');
                                            }
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                >
                                    🗑️ {lang === 'en' ? 'Delete Card' : '카드 삭제'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
            <div className="relative z-10 min-h-screen py-8 px-4">
                {/* 헤더 */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/60 hover:text-gold-400 transition-colors">
                            {lang === 'en' ? '← Home' : '← 홈으로'}
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-elegant font-bold text-gold-gradient">
                                {lang === 'en' ? 'Dashboard' : '대시보드'}
                            </h1>
                            <p className="text-white/60 text-sm mt-1">
                                {lang === 'en' ? 'Client Management & Card History' : '고객 관리 & 카드 발송 현황'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageToggle className="bg-white/10 hover:bg-white/20 text-white" />
                            <Link href="/create" className="text-gold-400 hover:text-gold-300 transition-colors">
                                {t.dashboard.createCard}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white/40 hover:text-red-400 transition-colors text-sm"
                            >
                                {t.dashboard.logout}
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
                            👀 {t.dashboard.overview}
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'clients'
                                ? 'text-gold-400 border-b-2 border-gold-400'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            👥 {t.dashboard.clients}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'settings'
                                ? 'text-gold-400 border-b-2 border-gold-400'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            ⚙️ {t.dashboard.settings}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-white/60">{t.common.loadingData}</div>
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
                                        <p className="text-white/60 mt-1">{t.dashboard.stats.totalClients}</p>
                                    </motion.div>
                                    <motion.div
                                        className="glass rounded-2xl p-6 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-3xl font-bold text-gold-400">{stats.totalCardsSent}</p>
                                        <p className="text-white/60 mt-1">{t.dashboard.stats.cardsSent}</p>
                                    </motion.div>
                                    <motion.div
                                        className="glass rounded-2xl p-6 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <p className="text-3xl font-bold text-red-400">{stats.clientsNeedingFollowup}</p>
                                        <p className="text-white/60 mt-1">{t.dashboard.stats.needsFollowup}</p>
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
                                            💌 {lang === 'en' ? 'Card Replies' : '받은 답장'}
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
                                                            {lang === 'en' ? 'Reply date:' : '답장 날짜:'} {formatDate(reply.created_at)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkAsRead(reply.id)}
                                                        className="text-gold-400 hover:text-gold-300 text-sm ml-4"
                                                    >
                                                        {lang === 'en' ? 'Read ✓' : '읽음 ✓'}
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
                                            🔔 {lang === 'en' ? 'Clients Needing Follow-up' : '안부를 물을 때가 된 고객'}
                                            <span className="text-xs font-normal text-white/50">
                                                {lang === 'en' ? '(3+ months since last card)' : '(마지막 카드 발송 후 3개월 경과)'}
                                            </span>
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
                                                                ? (lang === 'en'
                                                                    ? `Sent ${client.days_since_last_card} days ago`
                                                                    : `${client.days_since_last_card}일 전 발송`)
                                                                : (lang === 'en' ? 'No cards sent' : '카드 발송 이력 없음')
                                                            }
                                                        </p>
                                                        <Link
                                                            href={`/create?client=${encodeURIComponent(client.name)}`}
                                                            className="text-gold-400 text-sm hover:text-gold-300"
                                                        >
                                                            {lang === 'en' ? 'Send Card →' : '카드 보내기 →'}
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
                                    <h2 className="text-lg font-bold text-white mb-4">
                                        📬 {lang === 'en' ? 'Sent Cards' : '발송한 카드'}
                                    </h2>
                                    {recentCards.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-white/50 mb-4">
                                                {lang === 'en' ? 'No cards sent yet' : '아직 발송한 카드가 없습니다'}
                                            </p>
                                            <Link
                                                href="/create"
                                                className="inline-block px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                            >
                                                {lang === 'en' ? 'Create First Card ✨' : '첫 카드 만들기 ✨'}
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedCard(card)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-2xl">
                                                            {SEASONS[card.season || '']?.emoji || '✉️'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">
                                                                {lang === 'en' ? 'To:' : '받는 사람:'} {card.client_name}
                                                            </p>
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
                                                    <div className="text-right flex items-center gap-4">
                                                        <p className="text-white/60 text-sm">
                                                            {lang === 'en' ? 'Sent:' : '발송일:'} {formatDateTime(card.sent_at)}
                                                        </p>
                                                        <span className="text-gold-400 text-sm">
                                                            {lang === 'en' ? 'View →' : '보기 →'}
                                                        </span>
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
                                    <h2 className="text-xl font-bold text-white">
                                        👥 {lang === 'en' ? 'Client Management' : '전체 고객 관리'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setEditingClient(null);
                                            setShowClientForm(true);
                                        }}
                                        className="px-4 py-2 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                    >
                                        {lang === 'en' ? '+ Add Client' : '+ 새 고객 추가'}
                                    </button>
                                </div>

                                {/* 고객 추가/수정 폼 */}
                                {showClientForm && (
                                    <div className="glass rounded-2xl p-6 border border-gold-400/30">
                                        <h3 className="text-lg font-bold text-white mb-4">
                                            {editingClient
                                                ? (lang === 'en' ? 'Edit Client' : '고객 정보 수정')
                                                : (lang === 'en' ? 'Add New Client' : '새 고객 등록')}
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
                                                <label className="block text-white/80 text-sm mb-1">
                                                    {lang === 'en' ? 'Name (Required)' : '이름 (필수)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    defaultValue={editingClient?.name || ''}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                                                    placeholder={lang === 'en' ? 'Client name' : '고객 이름'}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">
                                                        {lang === 'en' ? 'Email' : '이메일'}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        defaultValue={editingClient?.email || ''}
                                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                                                        placeholder="example@email.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-white/80 text-sm mb-1">
                                                        {lang === 'en' ? 'Phone' : '전화번호'}
                                                    </label>
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
                                                <label className="block text-white/80 text-sm mb-2">
                                                    {lang === 'en' ? 'Select 5 Strengths' : '강점 5개 선택'}
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <select
                                                            key={num}
                                                            name={`strength_${num}`}
                                                            defaultValue={editingClient?.[`strength_${num}` as keyof Client] as string || ''}
                                                            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm"
                                                        >
                                                            <option value="">
                                                                {lang === 'en' ? `Strength ${num}` : `강점 ${num}`}
                                                            </option>
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
                                                <label className="block text-white/80 text-sm mb-1">
                                                    {lang === 'en' ? 'Notes / Memo' : '특이사항 / 메모'}
                                                </label>
                                                <textarea
                                                    name="memo"
                                                    rows={3}
                                                    defaultValue={editingClient?.memo || ''}
                                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 resize-none"
                                                    placeholder={lang === 'en' ? 'Enter notes about the client' : '고객에 대한 특이사항이나 메모를 입력하세요'}
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="flex-1 px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                                >
                                                    💾 {lang === 'en' ? 'Save' : '저장'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowClientForm(false);
                                                        setEditingClient(null);
                                                    }}
                                                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                                >
                                                    {lang === 'en' ? 'Cancel' : '취소'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* 고객 목록 */}
                                {allClients.length === 0 ? (
                                    <div className="glass rounded-2xl p-12 text-center">
                                        <p className="text-white/50 mb-4">
                                            {lang === 'en' ? 'No clients registered' : '등록된 고객이 없습니다'}
                                        </p>
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
                                                                ✏️ {lang === 'en' ? 'Edit' : '수정'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClient(client.id)}
                                                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-500/10 rounded-lg"
                                                            >
                                                                🗑️ {lang === 'en' ? 'Delete' : '삭제'}
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

                        {/* 설정 탭 */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white">
                                    ⚙️ {lang === 'en' ? 'Settings' : '설정'}
                                </h2>

                                {/* 프로필 편집 */}
                                <ProfileSettings />

                                {/* 비밀번호 변경 */}
                                <div className="glass rounded-2xl p-6 max-w-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">
                                        🔐 {lang === 'en' ? 'Change Password' : '비밀번호 변경'}
                                    </h3>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">
                                                {lang === 'en' ? 'Current Password' : '현재 비밀번호'}
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400"
                                                placeholder={lang === 'en' ? 'Enter current password' : '현재 비밀번호 입력'}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">
                                                {lang === 'en' ? 'New Password (min 6 chars)' : '새 비밀번호 (최소 6자)'}
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400"
                                                placeholder={lang === 'en' ? 'Enter new password' : '새 비밀번호 입력'}
                                                required
                                                minLength={4}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/80 text-sm mb-2">
                                                {lang === 'en' ? 'Confirm New Password' : '새 비밀번호 확인'}
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-gold-400"
                                                placeholder={lang === 'en' ? 'Confirm new password' : '새 비밀번호 다시 입력'}
                                                required
                                                minLength={4}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors"
                                        >
                                            🔒 {lang === 'en' ? 'Change Password' : '비밀번호 변경'}
                                        </button>
                                    </form>
                                    <div className="mt-4 p-4 bg-white/5 rounded-xl">
                                        <p className="text-white/60 text-sm">
                                            💡 <strong>{lang === 'en' ? 'Tip:' : '팁:'}</strong>
                                            {lang === 'en'
                                                ? ' Change your password regularly for security.'
                                                : ' 보안을 위해 주기적으로 비밀번호를 변경하세요.'}
                                        </p>
                                    </div>
                                </div>

                                {/* 계정 탈퇴 */}
                                <div className="glass rounded-2xl p-6 max-w-2xl border border-red-500/30">
                                    <h3 className="text-lg font-bold text-red-400 mb-4">
                                        ⚠️ {lang === 'en' ? 'Delete Account' : '계정 탈퇴'}
                                    </h3>
                                    <div className="p-4 bg-red-500/10 rounded-xl mb-4">
                                        <p className="text-white/80 text-sm">
                                            {lang === 'en'
                                                ? '⚠️ Warning: Deleting your account will permanently remove:'
                                                : '⚠️ 경고: 계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:'}
                                        </p>
                                        <ul className="text-white/60 text-sm mt-2 list-disc list-inside space-y-1">
                                            <li>{lang === 'en' ? 'Your coach profile' : '코치 프로필'}</li>
                                            <li>{lang === 'en' ? 'All client information' : '모든 고객 정보'}</li>
                                            <li>{lang === 'en' ? 'All sent cards' : '발송한 모든 카드'}</li>
                                            <li>{lang === 'en' ? 'All received replies' : '받은 모든 답장'}</li>
                                        </ul>
                                        <p className="text-red-400 text-sm mt-3 font-medium">
                                            {lang === 'en'
                                                ? '❌ This action cannot be undone!'
                                                : '❌ 이 작업은 되돌릴 수 없습니다!'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const confirmText = lang === 'en' ? 'DELETE' : '삭제';
                                            const userInput = prompt(
                                                lang === 'en'
                                                    ? `To confirm account deletion, type "${confirmText}" below:`
                                                    : `계정 삭제를 확인하려면 아래에 "${confirmText}"를 입력하세요:`
                                            );

                                            if (userInput === confirmText) {
                                                const { deleteAccount } = await import('@/lib/auth');
                                                const result = await deleteAccount();

                                                if (result.success) {
                                                    alert(lang === 'en'
                                                        ? '✅ Account deleted. Goodbye!'
                                                        : '✅ 계정이 삭제되었습니다. 안녕히 가세요!');
                                                    window.location.href = '/';
                                                } else {
                                                    alert(lang === 'en'
                                                        ? '❌ Failed to delete account. Please try again.'
                                                        : '❌ 계정 삭제에 실패했습니다. 다시 시도해주세요.');
                                                }
                                            } else if (userInput !== null) {
                                                alert(lang === 'en'
                                                    ? 'Account deletion cancelled. Text did not match.'
                                                    : '계정 삭제가 취소되었습니다. 입력값이 일치하지 않습니다.');
                                            }
                                        }}
                                        className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors border border-red-500/30"
                                    >
                                        🗑️ {lang === 'en' ? 'Delete My Account' : '계정 삭제하기'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
