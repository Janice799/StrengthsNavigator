'use client';

import { motion } from 'framer-motion';
import { occasions, Occasion } from '@/lib/occasions';

interface OccasionSelectorProps {
    selectedId: string | null;
    onSelect: (occasion: Occasion) => void;
    showAll?: boolean;
}

export default function OccasionSelector({ selectedId, onSelect, showAll = false }: OccasionSelectorProps) {
    // 현재 시즌 또는 전체 상황
    const displayOccasions = showAll
        ? occasions
        : occasions.slice(0, 6); // 기본: 상위 6개만

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">상황 선택</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayOccasions.map((occasion, index) => (
                    <motion.button
                        key={occasion.id}
                        onClick={() => onSelect(occasion)}
                        className={`
              p-4 rounded-xl text-left transition-all duration-300
              ${selectedId === occasion.id
                                ? 'ring-2 ring-gold-400 bg-white/15'
                                : 'glass hover:bg-white/10'}
            `}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{occasion.icon}</span>
                            <span className="font-medium text-white">{occasion.name.ko}</span>
                        </div>
                        <p className="text-xs text-white/60">{occasion.description.ko}</p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
