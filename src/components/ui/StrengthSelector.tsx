'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { strengths, strengthDomains, Strength } from '@/lib/strengths';

interface StrengthSelectorProps {
    selectedIds: string[];
    onSelect: (strength: Strength) => void;
    onDeselect: (strengthId: string) => void;
    maxSelections?: number;
    lang?: 'ko' | 'en';
}

type Domain = 'all' | 'executing' | 'influencing' | 'relationship' | 'strategic';

export default function StrengthSelector({
    selectedIds,
    onSelect,
    onDeselect,
    maxSelections = 5,
    lang = 'ko'
}: StrengthSelectorProps) {
    const [activeDomain, setActiveDomain] = useState<Domain>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStrengths = strengths.filter(s => {
        const matchesDomain = activeDomain === 'all' || s.domain === activeDomain;
        const matchesSearch = searchQuery === '' ||
            s.name.ko.includes(searchQuery) ||
            s.name.en.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDomain && matchesSearch;
    });

    const handleToggle = (strength: Strength) => {
        if (selectedIds.includes(strength.id)) {
            onDeselect(strength.id);
        } else if (selectedIds.length < maxSelections) {
            onSelect(strength);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white/90">
                    {lang === 'ko' ? '강점 선택' : 'Select Strengths'}
                </h3>
                <span className="text-sm text-gold-400">
                    {selectedIds.length}/{maxSelections}
                </span>
            </div>

            {/* 검색 */}
            <input
                type="text"
                placeholder={lang === 'ko' ? '강점 검색...' : 'Search strengths...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 glass rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
            />

            {/* 영역 필터 탭 */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveDomain('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeDomain === 'all'
                            ? 'bg-gold-500 text-ocean-900'
                            : 'glass text-white/70 hover:text-white'
                        }`}
                >
                    {lang === 'ko' ? '전체' : 'All'}
                </button>
                {(Object.entries(strengthDomains) as [keyof typeof strengthDomains, typeof strengthDomains[keyof typeof strengthDomains]][]).map(([key, domain]) => (
                    <button
                        key={key}
                        onClick={() => setActiveDomain(key as Domain)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeDomain === key
                                ? 'text-ocean-900'
                                : 'glass text-white/70 hover:text-white'
                            }`}
                        style={{
                            backgroundColor: activeDomain === key ? domain.color : undefined
                        }}
                    >
                        {domain[lang]}
                    </button>
                ))}
            </div>

            {/* 강점 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                    {filteredStrengths.map((strength) => {
                        const isSelected = selectedIds.includes(strength.id);
                        const domain = strengthDomains[strength.domain];

                        return (
                            <motion.button
                                key={strength.id}
                                onClick={() => handleToggle(strength)}
                                disabled={!isSelected && selectedIds.length >= maxSelections}
                                className={`
                  p-3 rounded-lg text-left transition-all duration-200 relative
                  ${isSelected
                                        ? 'ring-2 ring-gold-400 bg-white/15'
                                        : selectedIds.length >= maxSelections
                                            ? 'glass opacity-50 cursor-not-allowed'
                                            : 'glass hover:bg-white/10'}
                `}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={!isSelected && selectedIds.length < maxSelections ? { scale: 1.02 } : {}}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{strength.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {strength.name[lang]}
                                        </p>
                                        <p className="text-xs truncate" style={{ color: domain.color }}>
                                            {domain[lang]}
                                        </p>
                                    </div>
                                </div>
                                {isSelected && (
                                    <motion.div
                                        className="absolute top-1 right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <span className="text-xs text-ocean-900">✓</span>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* 선택된 강점 요약 */}
            {selectedIds.length > 0 && (
                <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {selectedIds.map(id => {
                        const strength = strengths.find(s => s.id === id);
                        if (!strength) return null;
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gold-500/20 text-gold-300"
                            >
                                {strength.icon} {strength.name[lang]}
                                <button
                                    onClick={() => onDeselect(id)}
                                    className="ml-1 hover:text-white"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
