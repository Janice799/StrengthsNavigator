'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface StrengthsDNAProps {
    domains?: {
        executing: number;    // 실행력 (0-1)
        influencing: number;  // 영향력 (0-1)
        relationship: number; // 관계구축 (0-1)
        strategic: number;    // 전략적사고 (0-1)
    };
    width?: number;
    height?: number;
}

// 도메인별 색상
const domainColors = {
    executing: { r: 138, g: 43, b: 226 },     // 보라색
    influencing: { r: 255, g: 140, b: 0 },    // 주황색
    relationship: { r: 34, g: 197, b: 94 },   // 초록색
    strategic: { r: 59, g: 130, b: 246 }      // 파란색
};

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: { r: number; g: number; b: number };
    domain: string;
    life: number;
    maxLife: number;
}

export default function StrengthsDNA({
    domains = {
        executing: 0.7,
        influencing: 0.5,
        relationship: 0.8,
        strategic: 0.6
    },
    width = 400,
    height = 400
}: StrengthsDNAProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const [isLoaded, setIsLoaded] = useState(false);

    // 파티클 생성
    const createParticle = useCallback((domain: keyof typeof domainColors, centerX: number, centerY: number): Particle => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.5;
        const color = domainColors[domain];

        return {
            x: centerX + (Math.random() - 0.5) * 50,
            y: centerY + (Math.random() - 0.5) * 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.5,
            color,
            domain,
            life: 0,
            maxLife: 150 + Math.random() * 100
        };
    }, []);

    // 애니메이션 루프
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsLoaded(true);

        // 초기 파티클 생성
        const initParticles = () => {
            const particles: Particle[] = [];
            const centerX = width / 2;
            const centerY = height / 2;

            // 각 도메인별 파티클 수는 도메인 값에 비례
            Object.entries(domains).forEach(([domain, value]) => {
                const count = Math.floor(value * 30);
                for (let i = 0; i < count; i++) {
                    particles.push(createParticle(domain as keyof typeof domainColors, centerX, centerY));
                }
            });

            particlesRef.current = particles;
        };

        initParticles();

        // 렌더링 루프
        const render = () => {
            ctx.fillStyle = 'rgba(8, 20, 40, 0.1)';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // 중심 글로우
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
            gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
            gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 파티클 업데이트 및 렌더링
            particlesRef.current.forEach((p, index) => {
                // 움직임
                p.x += p.vx;
                p.y += p.vy;
                p.life++;

                // 중심으로 약간 끌어당김
                const dx = centerX - p.x;
                const dy = centerY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 100) {
                    p.vx += dx * 0.0001;
                    p.vy += dy * 0.0001;
                }

                // 생명주기에 따른 투명도
                const lifeRatio = p.life / p.maxLife;
                const currentOpacity = lifeRatio < 0.1
                    ? p.opacity * (lifeRatio * 10)
                    : lifeRatio > 0.8
                        ? p.opacity * (1 - (lifeRatio - 0.8) * 5)
                        : p.opacity;

                // 그리기
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity})`;
                ctx.fill();

                // 글로우 효과
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity * 0.2})`;
                ctx.fill();

                // 파티클 재생성
                if (p.life > p.maxLife) {
                    particlesRef.current[index] = createParticle(
                        p.domain as keyof typeof domainColors,
                        centerX,
                        centerY
                    );
                }
            });

            // 연결선 그리기 (같은 도메인 파티클끼리)
            const domainGroups: Record<string, Particle[]> = {};
            particlesRef.current.forEach(p => {
                if (!domainGroups[p.domain]) domainGroups[p.domain] = [];
                domainGroups[p.domain].push(p);
            });

            Object.values(domainGroups).forEach(group => {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const dx = group[i].x - group[j].x;
                        const dy = group[i].y - group[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 60) {
                            const opacity = (1 - dist / 60) * 0.15;
                            ctx.beginPath();
                            ctx.moveTo(group[i].x, group[i].y);
                            ctx.lineTo(group[j].x, group[j].y);
                            ctx.strokeStyle = `rgba(${group[i].color.r}, ${group[i].color.g}, ${group[i].color.b}, ${opacity})`;
                            ctx.stroke();
                        }
                    }
                }
            });

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height, domains, createParticle]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`rounded-2xl transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'transparent' }}
        />
    );
}
