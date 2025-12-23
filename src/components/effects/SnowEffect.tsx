'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Snowflake {
    x: number;
    y: number;
    size: number;
    speed: number;
    wind: number;
    opacity: number;
}

interface SnowEffectProps {
    count?: number;
    color?: string;
}

export default function SnowEffect({ count = 150, color = 'rgba(255, 255, 255, 0.8)' }: SnowEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const snowflakesRef = useRef<Snowflake[]>([]);
    const animationRef = useRef<number>();

    const createSnowflake = useCallback((canvas: HTMLCanvasElement, atTop: boolean = true): Snowflake => {
        return {
            x: Math.random() * canvas.width,
            y: atTop ? -10 : Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 1 + 0.5,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3
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
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 초기 눈송이 생성
        snowflakesRef.current = Array.from({ length: count }, () => createSnowflake(canvas, false));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snowflakesRef.current.forEach((flake, index) => {
                // 그리기
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
                ctx.fillStyle = color.replace('0.8', String(flake.opacity));
                ctx.fill();

                // 움직임 업데이트
                flake.y += flake.speed;
                flake.x += flake.wind + Math.sin(flake.y * 0.01) * 0.5;

                // 화면 밖으로 나가면 리셋
                if (flake.y > canvas.height + 10) {
                    snowflakesRef.current[index] = createSnowflake(canvas, true);
                }
                if (flake.x > canvas.width + 10) {
                    flake.x = -10;
                }
                if (flake.x < -10) {
                    flake.x = canvas.width + 10;
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [count, color, createSnowflake]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}
