'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface FireworksEffectProps {
    duration?: number;
    autoStart?: boolean;
}

export default function FireworksEffect({ duration = 3000, autoStart = true }: FireworksEffectProps) {
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!autoStart || hasTriggered.current) return;
        hasTriggered.current = true;

        const end = Date.now() + duration;

        const colors = ['#d4af37', '#ffd700', '#ffffff', '#87ceeb'];

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: colors
            });

            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        // 시작 시 중앙 폭발
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            colors: colors
        });

        frame();
    }, [autoStart, duration]);

    return null;
}

// 수동 트리거용 함수
export function triggerCelebration() {
    const colors = ['#d4af37', '#ffd700', '#ffffff', '#87ceeb', '#ff69b4'];

    confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 },
        colors: colors
    });

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 80,
            origin: { x: 0, y: 0.8 },
            colors: colors
        });
    }, 300);

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 80,
            origin: { x: 1, y: 0.8 },
            colors: colors
        });
    }, 500);
}
