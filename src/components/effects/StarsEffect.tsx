'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    twinkleSpeed: number;
    phase: number;
}

interface StarsEffectProps {
    count?: number;
}

export default function StarsEffect({ count = 100 }: StarsEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const animationRef = useRef<number>();

    const createStar = useCallback((canvas: HTMLCanvasElement): Star => {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI * 2
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            starsRef.current = Array.from({ length: count }, () => createStar(canvas));
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            starsRef.current.forEach((star) => {
                const twinkle = Math.sin(time * star.twinkleSpeed + star.phase);
                const opacity = 0.3 + (twinkle + 1) * 0.35;
                const size = star.size * (0.8 + (twinkle + 1) * 0.2);

                ctx.beginPath();
                ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();

                // 큰 별에 십자 효과
                if (star.size > 1.5) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(star.x - size * 2, star.y);
                    ctx.lineTo(star.x + size * 2, star.y);
                    ctx.moveTo(star.x, star.y - size * 2);
                    ctx.lineTo(star.x, star.y + size * 2);
                    ctx.stroke();
                }
            });

            time += 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [count, createStar]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}
