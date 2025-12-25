'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';

// 별 애니메이션
function FloatingStars() {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

export default function LandingPage() {
    const [profile, setProfile] = useState({
        name: 'Coach',
        brand_name: 'StrengthsNavigator',
        tagline: '강점 코칭 플랫폼',
        title: 'Strengths Coach',
        description: '강점 기반 코칭 서비스를 제공합니다.',
        contact_email: '',
        contact_phone: '',
        website: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: '',
        profile_image_url: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await supabase
                .from('coach_profiles')
                .select('*')
                .limit(1)
                .single();

            if (data) {
                setProfile({
                    name: data.name || 'Coach',
                    brand_name: data.brand_name || 'StrengthsNavigator',
                    tagline: data.tagline || '강점 코칭 플랫폼',
                    title: data.title || 'Strengths Coach',
                    description: data.description || '강점 기반 코칭 서비스를 제공합니다.',
                    contact_email: data.contact_email || '',
                    contact_phone: data.contact_phone || '',
                    website: data.website || '',
                    instagram: data.instagram || '',
                    facebook: data.facebook || '',
                    linkedin: data.linkedin || '',
                    youtube: data.youtube || '',
                    profile_image_url: data.profile_image_url || ''
                });
            }
        } catch (error) {
            console.error('프로필 로드 오류:', error);
        }
    };

    return (
        <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <FloatingStars />

            <div className="relative z-10 w-full">
                {/* 헤더 - 중앙에 로고, 우측 상단에 로그인/회원가입 */}
                <motion.header
                    className="fixed top-0 left-0 right-0 px-8 py-6 z-20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-start">
                        {/* 중앙 로고 */}
                        <div className="flex-1 flex justify-center">
                            <div className="text-center">
                                <h1 className="text-2xl font-elegant font-semibold text-gold-gradient">
                                    StrengthsNavigator
                                </h1>
                                <p className="text-white/40 text-xs mt-1">강점 네비게이터</p>
                            </div>
                        </div>

                        {/* 우측 버튼 */}
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="px-5 py-2 text-white/70 hover:text-white text-sm transition-colors">
                                로그인
                            </Link>
                            <Link href="/signup" className="px-5 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 rounded-lg text-sm transition-colors border border-gold-500/30">
                                회원가입
                            </Link>
                        </div>
                    </div>
                </motion.header>

                {/* 메인 콘텐츠 - 왼쪽 이미지, 오른쪽 프로필 */}
                <div className="max-w-6xl mx-auto px-8 min-h-screen flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">

                        {/* 왼쪽: 프로필 이미지 */}
                        <motion.div
                            className="flex justify-center lg:justify-end"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            {profile.profile_image_url ? (
                                <div className="relative">
                                    <div className="relative w-80 h-80 rounded-3xl overflow-hidden border-4 border-gold-500/30 shadow-2xl shadow-gold-500/20">
                                        <img
                                            src={profile.profile_image_url}
                                            alt={`${profile.name} 코치`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 rounded-3xl border-2 border-gold-400/50 animate-pulse pointer-events-none" />
                                </div>
                            ) : (
                                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 border-2 border-gold-400/30 flex items-center justify-center">
                                    <span className="text-8xl">✨</span>
                                </div>
                            )}
                        </motion.div>

                        {/* 오른쪽: 프로필 정보 */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            {/* 상호/브랜드 */}
                            <div>
                                <h2 className="text-5xl font-elegant font-bold text-white mb-2">
                                    {profile.brand_name}
                                </h2>

                                {/* 직함/자격증 */}
                                <p className="text-gold-400 text-lg mb-3">
                                    {profile.title}
                                </p>

                                {/* 대표 문구 */}
                                <p className="text-gold-400/80 text-xl italic mb-4">
                                    {profile.tagline}
                                </p>
                            </div>

                            {/* 소개글 */}
                            <div className="glass rounded-2xl p-6 border border-gold-400/20">
                                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                    {profile.description}
                                </p>
                            </div>

                            {/* 연락처 정보 */}
                            {(profile.contact_email || profile.contact_phone) && (
                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                    {profile.contact_email && (
                                        <div className="flex items-center gap-2">
                                            <span>📧</span>
                                            <span>{profile.contact_email}</span>
                                        </div>
                                    )}
                                    {profile.contact_phone && (
                                        <div className="flex items-center gap-2">
                                            <span>📞</span>
                                            <span>{profile.contact_phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SNS & 웹사이트 */}
                            {(profile.website || profile.instagram || profile.facebook || profile.linkedin || profile.youtube) && (
                                <div className="flex items-center gap-3 text-white/40">
                                    {profile.website && (
                                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xl">
                                            🌐
                                        </a>
                                    )}
                                    {profile.instagram && (
                                        <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xl">
                                            📷
                                        </a>
                                    )}
                                    {profile.facebook && (
                                        <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xl">
                                            👤
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xl">
                                            💼
                                        </a>
                                    )}
                                    {profile.youtube && (
                                        <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xl">
                                            ▶️
                                        </a>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* 하단 */}
                <motion.footer
                    className="fixed bottom-0 left-0 right-0 text-center pb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="divider-elegant w-32 mx-auto mb-3" />
                    <p className="text-white/30 text-xs">
                        강점 코칭과 진심이 만나는 곳
                    </p>
                </motion.footer>
            </div>
        </main>
    );
}
