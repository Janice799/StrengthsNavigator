'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ScratchCardProps {
    width?: number;
    height?: number;
    coverColor?: string;
    brushSize?: number;
    revealPercent?: number;
    onReveal?: () => void;
    children: React.ReactNode;
}

export default function ScratchCard({
    width = 350,
    height = 500,
    coverColor = '#d4af37',
    brushSize = 40,
    revealPercent = 50,
    onReveal,
    children
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isScratching, setIsScratching] = useState(false);
    const [scratchedPercent, setScratchedPercent] = useState(0);

    // 선물 포장지 패턴 그리기
    const drawCover = useCallback((ctx: CanvasRenderingContext2D) => {
        // 배경색
        ctx.fillStyle = coverColor;
        ctx.fillRect(0, 0, width, height);

        // 리본 패턴
        ctx.fillStyle = '#b8972e';

        // 수직 리본
        ctx.fillRect(width / 2 - 20, 0, 40, height);

        // 수평 리본
        ctx.fillRect(0, height / 2 - 20, width, 40);

        // 리본 하이라이트
        ctx.fillStyle = '#e6c847';
        ctx.fillRect(width / 2 - 15, 0, 10, height);
        ctx.fillRect(0, height / 2 - 15, width, 10);

        // 반짝이 점들
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 4 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 별 장식
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const drawStar = (cx: number, cy: number, size: number) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = cx + Math.cos(angle) * size;
                const y = cy + Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        };

        drawStar(width * 0.2, height * 0.3, 15);
        drawStar(width * 0.8, height * 0.2, 12);
        drawStar(width * 0.15, height * 0.7, 10);
        drawStar(width * 0.85, height * 0.75, 14);

        // 텍스트 안내
        ctx.font = 'bold 18px Pretendard, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText('✨ 긁어서 확인하세요 ✨', width / 2, height - 40);

        // 리본 중앙 장식 (리본 묶음)
        ctx.fillStyle = '#c9a732';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e6c847';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#8b6914';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎁', width / 2, height / 2);

    }, [width, height, coverColor]);

    // 캔버스 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawCover(ctx);
    }, [drawCover]);

    // 긁힌 비율 계산
    const calculateScratchedPercent = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return 0;

        const ctx = canvas.getContext('2d');
        if (!ctx) return 0;

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }

        return (transparentPixels / (pixels.length / 4)) * 100;
    }, [width, height]);

    // 긁기 동작
    const scratch = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas || isRevealed) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        const percent = calculateScratchedPercent();
        setScratchedPercent(percent);

        if (percent >= revealPercent && !isRevealed) {
            setIsRevealed(true);
            onReveal?.();
        }
    }, [brushSize, revealPercent, isRevealed, onReveal, calculateScratchedPercent]);

    // 마우스 이벤트
    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsScratching(true);
        const pos = getPosition(e);
        scratch(pos.x, pos.y);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isScratching) return;
        e.preventDefault();
        const pos = getPosition(e);
        scratch(pos.x, pos.y);
    };

    const handleEnd = () => {
        setIsScratching(false);
    };

    return (
        <div className="relative" style={{ width, height }}>
            {/* 카드 내용 (아래) */}
            <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{ opacity: isRevealed ? 1 : 0.3 }}
            >
                {children}
            </div>

            {/* 스크래치 캔버스 (위) */}
            <motion.canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="absolute inset-0 rounded-2xl cursor-pointer touch-none"
                style={{
                    opacity: isRevealed ? 0 : 1,
                    pointerEvents: isRevealed ? 'none' : 'auto',
                    transition: 'opacity 0.5s ease'
                }}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.01 }}
            />

            {/* 진행률 표시 */}
            {!isRevealed && scratchedPercent > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
                    <p className="text-white text-xs">{Math.round(scratchedPercent)}% 완료</p>
                </div>
            )}

            {/* 완료 효과 */}
            {isRevealed && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                        <span className="text-2xl">🎉</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
