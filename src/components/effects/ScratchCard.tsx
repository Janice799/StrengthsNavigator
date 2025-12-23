'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface ScratchCardProps {
    width?: number;
    height?: number;
    coverImage?: string;
    brushRadius?: number;
    revealPercent?: number;
    onComplete?: () => void;
    children: React.ReactNode;
}

/**
 * 스크래치 카드 컴포넌트
 * Canvas API를 사용하여 직접 구현
 * - 긁으면 숨겨진 메시지 공개
 * - 진행률 추적
 * - 완료 시 콜백
 */
export default function ScratchCard({
    width = 300,
    height = 200,
    coverImage,
    brushRadius = 25,
    revealPercent = 50,
    onComplete = () => { },
    children
}: ScratchCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isScratching, setIsScratching] = useState(false);
    const [progress, setProgress] = useState(0);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    // 캔버스 초기화
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (coverImage) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = coverImage;
        } else {
            // 그라디언트 배경
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#8b5cf6');
            gradient.addColorStop(0.5, '#d4af37');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 텍스트 추가
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.font = 'bold 16px "Pretendard Variable", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨ 긁어서 확인하세요! ✨', width / 2, height / 2);
        }
    }, [width, height, coverImage]);

    // 진행률 계산
    const calculateProgress = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparent = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }

        const percent = (transparent / (pixels.length / 4)) * 100;
        setProgress(Math.round(percent));

        if (percent >= revealPercent && !isRevealed) {
            setIsRevealed(true);
            onComplete();
        }
    }, [width, height, revealPercent, isRevealed, onComplete]);

    // 스크래치 (그리기)
    const scratch = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();

        if (lastPoint.current) {
            ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
            ctx.lineTo(canvasX, canvasY);
        } else {
            ctx.moveTo(canvasX, canvasY);
        }

        ctx.lineWidth = brushRadius * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastPoint.current = { x: canvasX, y: canvasY };
    }, [brushRadius]);

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsScratching(true);
        lastPoint.current = null;
        scratch(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isScratching) return;
        scratch(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        setIsScratching(false);
        lastPoint.current = null;
        calculateProgress();
    };

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        setIsScratching(true);
        lastPoint.current = null;
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (!isScratching) return;
        const touch = e.touches[0];
        scratch(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        setIsScratching(false);
        lastPoint.current = null;
        calculateProgress();
    };

    return (
        <div
            ref={containerRef}
            className={`relative inline-block rounded-2xl overflow-hidden shadow-2xl select-none touch-none ${isRevealed ? 'animate-pulse-once' : ''}`}
            style={{ width, height }}
        >
            {/* 숨겨진 컨텐츠 */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ocean-800 to-ocean-900 p-6">
                {children}
            </div>

            {/* 스크래치 레이어 */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={`absolute inset-0 cursor-grab active:cursor-grabbing rounded-2xl transition-opacity duration-500 ${isRevealed ? 'opacity-0 pointer-events-none' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />

            {/* 진행률 표시 */}
            {!isRevealed && progress > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-gold-400 px-3 py-1 rounded-full text-xs font-semibold">
                    {progress}% 공개됨
                </div>
            )}
        </div>
    );
}
