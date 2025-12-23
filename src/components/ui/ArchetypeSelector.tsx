'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { archetypes, Archetype } from '@/lib/archetypes';

interface ArchetypeSelectorProps {
    selectedId: string | null;
    onSelect: (archetype: Archetype) => void;
    lang?: 'ko' | 'en';
}

export default function ArchetypeSelector({ selectedId, onSelect, lang = 'ko' }: ArchetypeSelectorProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">
                {lang === 'ko' ? '원형 선택' : 'Select Archetype'}
            </h3>
            <p className="text-sm text-white/60">
                {lang === 'ko'
                    ? '수신자에게 어울리는 원형을 선택하세요'
                    : 'Choose an archetype that suits the recipient'}
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {archetypes.map((archetype, index) => (
                    <motion.button
                        key={archetype.id}
                        onClick={() => onSelect(archetype)}
                        onMouseEnter={() => setHoveredId(archetype.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`
              relative p-4 rounded-xl text-center transition-all duration-300
              ${selectedId === archetype.id
                                ? 'ring-2 ring-gold-400 bg-white/15'
                                : 'glass hover:bg-white/10'}
            `}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            borderColor: selectedId === archetype.id ? archetype.color : 'transparent',
                            borderWidth: '2px'
                        }}
                    >
                        <span className="text-3xl mb-2 block">{archetype.icon}</span>
                        <span className="text-sm font-medium text-white block">
                            {archetype.name[lang]}
                        </span>

                        {/* 호버 시 키워드 표시 */}
                        <AnimatePresence>
                            {hoveredId === archetype.id && (
                                <motion.div
                                    className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10 glass px-3 py-2 rounded-lg whitespace-nowrap"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                >
                                    <p className="text-xs text-white/80">
                                        {archetype.keywords[lang].join(' · ')}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </div>

            {/* 선택된 원형 메시지 미리보기 */}
            <AnimatePresence mode="wait">
                {selectedId && (
                    <motion.div
                        key={selectedId}
                        className="glass rounded-xl p-4 mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <p className="text-sm text-white/80 italic">
                            &ldquo;{archetypes.find(a => a.id === selectedId)?.message[lang]}&rdquo;
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
