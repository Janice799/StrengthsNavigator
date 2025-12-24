'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SeasonalEffectProps {
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    count?: number;
}

interface Particle {
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
    rotation: number;
}

// 봄: 핑크색 꽃잎 효과
function SpringPetals({ count = 30 }: { count?: number }) {
    const [petals, setPetals] = useState<Particle[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 10,
            duration: Math.random() * 5 + 8,
            size: Math.random() * 15 + 10,
            rotation: Math.random() * 360,
        }));
        setPetals(generated);
    }, [count]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {petals.map((petal) => (
                <motion.div
                    key={petal.id}
                    className="absolute"
                    style={{
                        left: `${petal.x}%`,
                        top: -30,
                        width: petal.size,
                        height: petal.size,
                        background: `radial-gradient(ellipse at 30% 30%, #ffb7c5 0%, #ff69b4 50%, #ff1493 100%)`,
                        borderRadius: '50% 0% 50% 50%',
                        transform: `rotate(${petal.rotation}deg)`,
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, Math.sin(petal.id) * 50],
                        rotate: [petal.rotation, petal.rotation + 360],
                        opacity: [0.8, 0.6, 0],
                    }}
                    transition={{
                        duration: petal.duration,
                        delay: petal.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// 여름: 햇빛 반짝임 효과
function SummerSunshine({ count = 20 }: { count?: number }) {
    const [rays, setRays] = useState<Particle[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 3,
            duration: Math.random() * 2 + 2,
            size: Math.random() * 4 + 2,
            rotation: 0,
        }));
        setRays(generated);
    }, [count]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* 배경 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />

            {rays.map((ray) => (
                <motion.div
                    key={ray.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${ray.x}%`,
                        top: `${Math.random() * 50}%`,
                        width: ray.size,
                        height: ray.size,
                        background: 'radial-gradient(circle, #ffd700 0%, #ffaa00 100%)',
                        boxShadow: '0 0 10px #ffd700, 0 0 20px #ffaa00',
                    }}
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: ray.duration,
                        delay: ray.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

// 가을: 단풍잎 효과
function AutumnLeaves({ count = 25 }: { count?: number }) {
    const [leaves, setLeaves] = useState<Particle[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 8,
            duration: Math.random() * 6 + 10,
            size: Math.random() * 20 + 15,
            rotation: Math.random() * 360,
        }));
        setLeaves(generated);
    }, [count]);

    const leafColors = ['#e74c3c', '#e67e22', '#f39c12', '#d35400', '#c0392b'];

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {leaves.map((leaf) => (
                <motion.div
                    key={leaf.id}
                    className="absolute"
                    style={{
                        left: `${leaf.x}%`,
                        top: -40,
                        width: leaf.size,
                        height: leaf.size * 0.8,
                        background: leafColors[leaf.id % leafColors.length],
                        borderRadius: '50% 0% 50% 50%',
                        transform: `rotate(${leaf.rotation}deg)`,
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, Math.sin(leaf.id) * 80, Math.cos(leaf.id) * 40],
                        rotate: [leaf.rotation, leaf.rotation + 540],
                        opacity: [0.9, 0.7, 0],
                    }}
                    transition={{
                        duration: leaf.duration,
                        delay: leaf.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// 겨울: 눈송이 효과
function WinterSnowflakes({ count = 40 }: { count?: number }) {
    const [snowflakes, setSnowflakes] = useState<Particle[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 10,
            duration: Math.random() * 8 + 12,
            size: Math.random() * 6 + 3,
            rotation: 0,
        }));
        setSnowflakes(generated);
    }, [count]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {snowflakes.map((snow) => (
                <motion.div
                    key={snow.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${snow.x}%`,
                        top: -20,
                        width: snow.size,
                        height: snow.size,
                        background: 'white',
                        boxShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.5)',
                    }}
                    animate={{
                        y: ['0vh', '110vh'],
                        x: [0, Math.sin(snow.id) * 30, -Math.sin(snow.id) * 30, 0],
                        opacity: [0.9, 0.8, 0.6],
                    }}
                    transition={{
                        duration: snow.duration,
                        delay: snow.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// 메인 컴포넌트
export default function SeasonalEffect({ season, count }: SeasonalEffectProps) {
    switch (season) {
        case 'spring':
            return <SpringPetals count={count || 30} />;
        case 'summer':
            return <SummerSunshine count={count || 20} />;
        case 'autumn':
            return <AutumnLeaves count={count || 25} />;
        case 'winter':
            return <WinterSnowflakes count={count || 40} />;
        default:
            return null;
    }
}
