'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    getClients,
    deleteClient,
    getCardHistoryByClient,
    getCardHistory,
    exportData,
    importData,
    ClientRecord,
    CardHistory
} from '@/lib/clientStorage';
import { getStrengthById } from '@/lib/strengths';
import { getArchetypeById } from '@/lib/archetypes';
import { getOccasionById } from '@/lib/occasions';
import StarsEffect from '@/components/effects/StarsEffect';

export default function ClientsPage() {
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
    const [clientHistory, setClientHistory] = useState<CardHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState('');

    useEffect(() => {
        setClients(getClients());
    }, []);

    useEffect(() => {
        if (selectedClient) {
            setClientHistory(getCardHistoryByClient(selectedClient.id));
        }
    }, [selectedClient]);

    // 통계 계산
    const stats = useMemo(() => {
        const allHistory = getCardHistory();
        return {
            totalClients: clients.length,
            totalCards: allHistory.length,
            recentCards: allHistory.filter(h => {
                const created = new Date(h.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
            }).length
        };
    }, [clients]);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            deleteClient(id);
            setClients(getClients());
            if (selectedClient?.id === id) {
                setSelectedClient(null);
            }
        }
    };

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resonant-year-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        try {
            const result = importData(importText);
            alert(`가져오기 완료: 클라이언트 ${result.clients}명, 기록 ${result.history}건`);
            setClients(getClients());
            setShowImportModal(false);
            setImportText('');
        } catch (e) {
            alert('가져오기 실패: ' + (e as Error).message);
        }
    };

    // 클라이언트 이니셜 아바타 색상
    const getAvatarColor = (name: string) => {
        const colors = [
            'from-rose-500 to-pink-500',
            'from-violet-500 to-purple-500',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <main className="min-h-screen relative">
            <StarsEffect count={30} />

            <div className="relative z-10 min-h-screen py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <Link
                                href="/"
                                className="link-subtle flex items-center gap-2"
                            >
                                ← 홈으로
                            </Link>
                            <div>
                                <h1 className="text-2xl font-elegant font-semibold text-gold-gradient">
                                    클라이언트 관리
                                </h1>
                                <p className="text-white/40 text-sm mt-1">
                                    소중한 인연을 관리하세요
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 btn-subtle rounded-lg text-sm"
                            >
                                📤 내보내기
                            </button>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="px-4 py-2 btn-subtle rounded-lg text-sm"
                            >
                                📥 가져오기
                            </button>
                        </div>
                    </div>

                    {/* 통계 대시보드 */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <motion.div
                            className="stat-card rounded-xl p-5 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <p className="text-3xl font-elegant font-semibold text-gold-gradient">
                                {stats.totalClients}
                            </p>
                            <p className="text-white/50 text-sm mt-1">전체 클라이언트</p>
                        </motion.div>
                        <motion.div
                            className="stat-card rounded-xl p-5 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-3xl font-elegant font-semibold text-white">
                                {stats.totalCards}
                            </p>
                            <p className="text-white/50 text-sm mt-1">발송한 카드</p>
                        </motion.div>
                        <motion.div
                            className="stat-card rounded-xl p-5 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <p className="text-3xl font-elegant font-semibold text-white">
                                {stats.recentCards}
                            </p>
                            <p className="text-white/50 text-sm mt-1">이번 주 발송</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 클라이언트 목록 */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="클라이언트 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 glass rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-gold-400/30 text-sm"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                    🔍
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                                <AnimatePresence>
                                    {filteredClients.length === 0 ? (
                                        <motion.div
                                            className="glass rounded-xl p-8 text-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <p className="text-4xl mb-4">📋</p>
                                            <p className="text-white/60 text-sm">아직 클라이언트가 없습니다</p>
                                            <Link href="/create" className="text-gold-400 text-sm mt-3 block hover:text-gold-300">
                                                첫 카드를 만들어보세요 →
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        filteredClients.map((client, index) => (
                                            <motion.div
                                                key={client.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedClient(client)}
                                                className={`glass rounded-xl p-4 cursor-pointer transition-all ${selectedClient?.id === client.id
                                                    ? 'ring-1 ring-gold-400/50 bg-white/10'
                                                    : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* 아바타 */}
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(client.name)} flex items-center justify-center flex-shrink-0`}>
                                                        <span className="text-white font-medium text-sm">
                                                            {client.name[0]}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-medium text-white truncate">
                                                                {client.name}
                                                            </h3>
                                                            <span className="text-xs text-white/40">
                                                                {new Date(client.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {client.strengthIds.slice(0, 3).map(id => {
                                                                const s = getStrengthById(id);
                                                                return <span key={id} className="text-sm" title={s?.name.ko}>{s?.icon}</span>;
                                                            })}
                                                            {client.strengthIds.length > 3 && (
                                                                <span className="text-xs text-white/40">
                                                                    +{client.strengthIds.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* 상세 정보 */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {selectedClient ? (
                                    <motion.div
                                        key={selectedClient.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="glass rounded-2xl p-6 space-y-6"
                                    >
                                        {/* 클라이언트 정보 헤더 */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(selectedClient.name)} flex items-center justify-center`}>
                                                    <span className="text-white font-bold text-2xl">
                                                        {selectedClient.name[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-elegant font-semibold text-gold-gradient">
                                                        {selectedClient.name}
                                                    </h2>
                                                    {selectedClient.archetypeId && (
                                                        <p className="text-white/60 mt-1 flex items-center gap-2">
                                                            <span>{getArchetypeById(selectedClient.archetypeId)?.icon}</span>
                                                            <span>{getArchetypeById(selectedClient.archetypeId)?.name.ko}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(selectedClient.id)}
                                                className="px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>

                                        {/* 강점 */}
                                        {selectedClient.strengthIds.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-medium text-white/40 mb-3 tracking-wider uppercase">
                                                    강점
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedClient.strengthIds.map(id => {
                                                        const s = getStrengthById(id);
                                                        return (
                                                            <span
                                                                key={id}
                                                                className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-white/80 border border-white/10"
                                                            >
                                                                {s?.icon} {s?.name.ko}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* 메모 */}
                                        {selectedClient.notes && (
                                            <div>
                                                <h3 className="text-xs font-medium text-white/40 mb-3 tracking-wider uppercase">
                                                    메모
                                                </h3>
                                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 rounded-lg p-4">
                                                    {selectedClient.notes}
                                                </p>
                                            </div>
                                        )}

                                        {/* 발송 기록 */}
                                        <div>
                                            <h3 className="text-xs font-medium text-white/40 mb-3 tracking-wider uppercase">
                                                발송 기록 ({clientHistory.length})
                                            </h3>
                                            {clientHistory.length === 0 ? (
                                                <p className="text-white/40 text-sm py-4">
                                                    아직 발송 기록이 없습니다
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {clientHistory.map(h => (
                                                        <div key={h.id} className="bg-white/5 rounded-lg p-3 text-sm border border-white/5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white/80 flex items-center gap-2">
                                                                    <span>{getOccasionById(h.occasionId)?.icon}</span>
                                                                    <span>{getOccasionById(h.occasionId)?.name.ko}</span>
                                                                </span>
                                                                <span className="text-white/40 text-xs">
                                                                    {new Date(h.createdAt).toLocaleDateString('ko-KR')}
                                                                </span>
                                                            </div>
                                                            {h.message && (
                                                                <p className="text-white/50 mt-2 line-clamp-2 text-xs">
                                                                    {h.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* 새 카드 만들기 */}
                                        <Link
                                            href={`/create?client=${encodeURIComponent(selectedClient.name)}`}
                                            className="block w-full py-3.5 btn-elegant rounded-xl text-center font-medium"
                                        >
                                            ✦ 새 카드 만들기
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="glass rounded-2xl p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <p className="text-5xl mb-4 opacity-50">👈</p>
                                        <p className="text-white/40 font-elegant">클라이언트를 선택하세요</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* 가져오기 모달 */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowImportModal(false)}
                    >
                        <motion.div
                            className="glass rounded-2xl p-6 max-w-lg w-full border border-white/10"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-elegant font-semibold text-gold-gradient mb-4">
                                데이터 가져오기
                            </h3>
                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="백업 JSON 데이터를 붙여넣으세요"
                                rows={10}
                                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/40 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-gold-400/30"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="flex-1 py-2.5 btn-subtle rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleImport}
                                    className="flex-1 py-2.5 btn-elegant rounded-lg font-medium"
                                >
                                    가져오기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
