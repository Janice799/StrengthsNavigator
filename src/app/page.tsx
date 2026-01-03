'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import useLanguage, { LanguageToggle } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';

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
    const { t, lang, mounted } = useLanguage();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = 로딩중
    const [profile, setProfile] = useState({
        name: 'Coach',
        nickname: '',
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
        profile_image_url: '',
        // English fields
        name_en: '',
        title_en: '',
        tagline_en: 'Strengths Coaching Platform',
        description_en: 'We provide strengths-based coaching services.'
    });

    useEffect(() => {
        // 클라이언트 마운트 확인 후 인증 체크
        if (mounted) {
            checkAuthAndLoadProfile();
        }
    }, [mounted]);

    const checkAuthAndLoadProfile = async () => {
        try {
            // 5초 타임아웃 설정
            const timeoutPromise = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 5000)
            );

            const authPromise = supabase.auth.getSession();

            // 타임아웃과 인증 확인 중 먼저 완료되는 것 사용
            const result = await Promise.race([authPromise, timeoutPromise]);

            if (!result) {
                // 타임아웃된 경우
                setIsLoggedIn(false);
                return;
            }

            const { data: { session } } = result;

            if (session?.user) {
                setIsLoggedIn(true);
                // 로그인된 경우 본인 프로필 로드
                const { data, error } = await supabase
                    .from('coach_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                console.log('Profile load result:', { data, error, userId: session.user.id });

                if (error) {
                    console.error('프로필 로드 오류:', error);
                }

                if (data) {
                    setProfile({
                        name: data.name || 'Coach',
                        nickname: data.nickname || '',
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
                        profile_image_url: data.profile_image_url || '',
                        // English fields
                        name_en: data.name_en || '',
                        title_en: data.title_en || '',
                        tagline_en: data.tagline_en || 'Strengths Coaching Platform',
                        description_en: data.description_en || 'We provide strengths-based coaching services.'
                    });
                    console.log('Profile set successfully');
                } else {
                    console.log('No profile found for user');
                }
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('인증/프로필 로드 오류:', error);
            setIsLoggedIn(false);
        }
    };

    // 마운트 안됐거나 인증 확인 중일 때 로딩 표시
    if (!mounted || isLoggedIn === null) {
        return (
            <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
                <FloatingStars />
                <div className="relative z-10 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full mx-auto"
                    />
                </div>
            </main>
        );
    }

    // 비로그인 상태: 일반 랜딩페이지
    if (!isLoggedIn) {
        return (
            <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
                <FloatingStars />

                <div className="relative z-10 w-full">
                    {/* 헤더 */}
                    <motion.header
                        className="fixed top-0 left-0 right-0 px-8 py-6 z-20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="text-left">
                                <h1 className="text-xl font-elegant font-semibold text-gold-gradient">
                                    StrengthsNavigator
                                </h1>
                                <p className="text-white/40 text-xs mt-1">
                                    {lang === 'en' ? 'Strengths Navigator' : '강점 네비게이터'}
                                </p>
                                <LanguageToggle className="bg-white/10 hover:bg-white/20 text-white" />
                            </div>

                            <div className="flex items-center gap-3">
                                <Link href="/login" className="px-5 py-2 text-white/70 hover:text-white text-sm transition-colors">
                                    {t.login.loginButton}
                                </Link>
                                <Link href="/signup" className="px-5 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 rounded-lg text-sm transition-colors border border-gold-500/30">
                                    {t.signup.signUpButton}
                                </Link>
                            </div>
                        </div>
                    </motion.header>

                    {/* 메인 콘텐츠 - 비로그인: 일반 소개 */}
                    <div className="max-w-4xl mx-auto px-8 min-h-screen flex items-center">
                        <div className="w-full text-center py-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                {/* 메인 아이콘 */}
                                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-600/20 border-2 border-gold-400/40 flex items-center justify-center">
                                    <span className="text-6xl">✨</span>
                                </div>

                                {/* 메인 타이틀 */}
                                <h2 className="text-4xl md:text-5xl font-elegant font-bold text-white mb-4">
                                    {lang === 'en' ? 'Discover Your Strengths' : '당신의 강점을 발견하세요'}
                                </h2>

                                {/* 서브 타이틀 */}
                                <p className="text-xl text-gold-400/80 italic mb-6">
                                    {lang === 'en'
                                        ? 'Send heartfelt encouragement with strengths coaching'
                                        : '강점 코칭으로 진심 어린 응원을 전하세요'}
                                </p>

                                {/* 설명 */}
                                <div className="glass rounded-2xl p-8 border border-gold-400/20 max-w-2xl mx-auto mb-8">
                                    <p className="text-white/70 leading-relaxed text-lg">
                                        {lang === 'en'
                                            ? 'StrengthsNavigator helps coaches create personalized strength-based encouragement cards for their clients. Transform lives through the power of strengths recognition.'
                                            : 'StrengthsNavigator는 코치들이 고객을 위해 개인화된 강점 기반 응원 카드를 만들 수 있도록 돕습니다. 강점 인식의 힘으로 삶을 변화시키세요.'}
                                    </p>
                                </div>

                                {/* CTA 버튼들 */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 rounded-2xl font-bold text-lg hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40"
                                    >
                                        {lang === 'en' ? '🚀 Get Started' : '🚀 시작하기'}
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-lg transition-all border border-white/20"
                                    >
                                        {lang === 'en' ? 'Already a coach? Login' : '이미 코치이신가요? 로그인'}
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* 하단 - pointer-events-none으로 버튼 클릭 방해 방지 */}
                    <motion.footer
                        className="fixed bottom-0 left-0 right-0 text-center pb-6 bg-gradient-to-t from-ocean-900/90 to-transparent pt-12 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="divider-elegant w-32 mx-auto mb-3" />
                        <p className="text-white/40 text-xs mb-2">
                            {lang === 'en' ? 'Where strengths coaching meets heartfelt connection' : '강점 코칭과 진심이 만나는 곳'}
                        </p>
                        <p className="text-white/20 text-[10px] max-w-2xl mx-auto px-4">
                            {lang === 'en'
                                ? 'Gallup® and CliftonStrengths® are trademarks of Gallup, Inc. This product is not affiliated with or endorsed by Gallup, Inc.'
                                : 'Gallup®, CliftonStrengths®는 Gallup, Inc.의 상표입니다. 본 서비스는 Gallup, Inc.와 제휴하거나 보증받지 않았습니다.'}
                        </p>
                    </motion.footer>
                </div>
            </main>
        );
    }

    // 로그인 상태: 코치 프로필 랜딩페이지
    return (
        <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <FloatingStars />

            <div className="relative z-10 w-full">
                {/* 헤더 - 로그인 상태 */}
                <motion.header
                    className="fixed top-0 left-0 right-0 px-8 py-6 z-20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-start">
                        <div className="text-left">
                            <h1 className="text-xl font-elegant font-semibold text-gold-gradient">
                                StrengthsNavigator
                            </h1>
                            <p className="text-white/40 text-xs mt-1">
                                {lang === 'en' ? 'Strengths Navigator' : '강점 네비게이터'}
                            </p>
                            <LanguageToggle className="bg-white/10 hover:bg-white/20 text-white" />
                        </div>

                        {/* 로그인 상태: 대시보드 버튼 */}
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="px-5 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 rounded-lg text-sm transition-colors border border-gold-500/30">
                                {lang === 'en' ? 'Dashboard' : '대시보드'}
                            </Link>
                        </div>
                    </div>
                </motion.header>

                {/* 메인 콘텐츠 - 왼쪽 이미지, 오른쪽 프로필 */}
                <div className="max-w-6xl mx-auto px-8 min-h-screen flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-20">

                        {/* 왼쪽: 프로필 이미지 */}
                        <motion.div
                            className="flex justify-center lg:justify-end items-start"
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
                                    <svg className="w-32 h-32 text-gold-400/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
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
                                <h2 className="text-3xl font-elegant font-bold text-white mb-2">
                                    {profile.brand_name}
                                </h2>

                                {/* 코치명 */}
                                <p className="text-white/80 text-2xl font-semibold mb-2">
                                    {lang === 'en'
                                        ? `Coach ${profile.nickname || profile.name}`
                                        : `${profile.nickname || profile.name} 코치`
                                    }
                                </p>

                                {/* 직함/자격증 (여러줄) */}
                                <p className="text-gold-400 text-sm mb-3 whitespace-pre-line">
                                    {lang === 'en' && profile.title_en ? profile.title_en : profile.title}
                                </p>

                                {/* 대표 문구 */}
                                <p className="text-gold-400/80 text-xl italic mb-4 whitespace-pre-line">
                                    {lang === 'en' && profile.tagline_en ? profile.tagline_en : profile.tagline}
                                </p>
                            </div>

                            {/* 소개글 */}
                            <div className="glass rounded-2xl p-6 border border-gold-400/20">
                                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                    {lang === 'en' && profile.description_en ? profile.description_en : profile.description}
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

                            {/* CTA 버튼 - 응원 레터 보내기 */}
                            <div className="pt-4">
                                <Link
                                    href="/create"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 rounded-2xl font-bold text-lg hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40"
                                >
                                    {t.landing.sendCard}
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 하단 - pointer-events-none으로 버튼 클릭 방해 방지 */}
                <motion.footer
                    className="fixed bottom-0 left-0 right-0 text-center pb-6 bg-gradient-to-t from-ocean-900/90 to-transparent pt-12 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="divider-elegant w-32 mx-auto mb-3" />
                    <p className="text-white/40 text-xs mb-2">
                        {lang === 'en' ? 'Where strengths coaching meets heartfelt connection' : '강점 코칭과 진심이 만나는 곳'}
                    </p>
                    <p className="text-white/20 text-[10px] max-w-2xl mx-auto px-4">
                        {lang === 'en'
                            ? 'Gallup® and CliftonStrengths® are trademarks of Gallup, Inc. This product is not affiliated with or endorsed by Gallup, Inc.'
                            : 'Gallup®, CliftonStrengths®는 Gallup, Inc.의 상표입니다. 본 서비스는 Gallup, Inc.와 제휴하거나 보증받지 않았습니다.'}
                    </p>
                </motion.footer>
            </div>
        </main>
    );
}
