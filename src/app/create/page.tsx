'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SeasonalEffect from '@/components/effects/SeasonalEffect';
import seasonalTemplates from '@/config/seasonal_templates.json';
import strengthDescriptions from '@/config/strength_descriptions.json';
import strengthsI18n from '@/config/strengths_i18n.json';
import i18n from '@/config/i18n.json';
import { searchClients, saveSentCard, Client, getPublicCoachProfile } from '@/lib/supabase';
import { LanguageToggle } from '@/hooks/useLanguage';

// 34가지 강점 테마
const STRENGTHS = [
    { id: 'achiever', name: 'Achiever (성취)', domain: 'executing', emoji: '🏆' },
    { id: 'activator', name: 'Activator (행동)', domain: 'influencing', emoji: '⚡' },
    { id: 'adaptability', name: 'Adaptability (적응)', domain: 'relationship', emoji: '🌊' },
    { id: 'analytical', name: 'Analytical (분석)', domain: 'strategic', emoji: '🔍' },
    { id: 'arranger', name: 'Arranger (정리)', domain: 'executing', emoji: '🧩' },
    { id: 'belief', name: 'Belief (신념)', domain: 'executing', emoji: '💫' },
    { id: 'command', name: 'Command (주도력)', domain: 'influencing', emoji: '👑' },
    { id: 'communication', name: 'Communication (커뮤니케이션)', domain: 'influencing', emoji: '💬' },
    { id: 'competition', name: 'Competition (경쟁)', domain: 'influencing', emoji: '🏅' },
    { id: 'connectedness', name: 'Connectedness (연결)', domain: 'relationship', emoji: '🔗' },
    { id: 'consistency', name: 'Consistency (일관성)', domain: 'executing', emoji: '⚖️' },
    { id: 'context', name: 'Context (맥락)', domain: 'strategic', emoji: '📚' },
    { id: 'deliberative', name: 'Deliberative (심사숙고)', domain: 'executing', emoji: '🤔' },
    { id: 'developer', name: 'Developer (개발)', domain: 'relationship', emoji: '🌱' },
    { id: 'discipline', name: 'Discipline (체계)', domain: 'executing', emoji: '📋' },
    { id: 'empathy', name: 'Empathy (공감)', domain: 'relationship', emoji: '💝' },
    { id: 'focus', name: 'Focus (집중)', domain: 'executing', emoji: '🎯' },
    { id: 'futuristic', name: 'Futuristic (미래지향)', domain: 'strategic', emoji: '🔮' },
    { id: 'harmony', name: 'Harmony (화합)', domain: 'relationship', emoji: '🤝' },
    { id: 'ideation', name: 'Ideation (발상)', domain: 'strategic', emoji: '💡' },
    { id: 'includer', name: 'Includer (포용)', domain: 'relationship', emoji: '🤗' },
    { id: 'individualization', name: 'Individualization (개별화)', domain: 'relationship', emoji: '👤' },
    { id: 'input', name: 'Input (수집)', domain: 'strategic', emoji: '📥' },
    { id: 'intellection', name: 'Intellection (지적사고)', domain: 'strategic', emoji: '🧠' },
    { id: 'learner', name: 'Learner (배움)', domain: 'strategic', emoji: '📖' },
    { id: 'maximizer', name: 'Maximizer (극대화)', domain: 'influencing', emoji: '📈' },
    { id: 'positivity', name: 'Positivity (긍정)', domain: 'relationship', emoji: '😊' },
    { id: 'relator', name: 'Relator (절친)', domain: 'relationship', emoji: '❤️' },
    { id: 'responsibility', name: 'Responsibility (책임)', domain: 'executing', emoji: '✅' },
    { id: 'restorative', name: 'Restorative (복구)', domain: 'executing', emoji: '🔧' },
    { id: 'self-assurance', name: 'Self-Assurance (자기확신)', domain: 'influencing', emoji: '💪' },
    { id: 'significance', name: 'Significance (중요성)', domain: 'influencing', emoji: '⭐' },
    { id: 'strategic', name: 'Strategic (전략)', domain: 'strategic', emoji: '♟️' },
    { id: 'woo', name: 'Woo (사교성)', domain: 'influencing', emoji: '🎉' },
];

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type Situation = 'new_year' | 'vacation' | 'comfort' | 'promotion' | 'christmas' | 'birthday' | 'gratitude' | 'encouragement' | 'wedding' | 'graduation';

const SEASONS: { id: Season; name: string; emoji: string; color: string }[] = [
    { id: 'spring', name: '봄', emoji: '🌸', color: 'from-pink-400 to-pink-600' },
    { id: 'summer', name: '여름', emoji: '☀️', color: 'from-yellow-400 to-orange-500' },
    { id: 'autumn', name: '가을', emoji: '🍂', color: 'from-orange-400 to-red-500' },
    { id: 'winter', name: '겨울', emoji: '❄️', color: 'from-blue-300 to-blue-500' },
];

const SITUATIONS: { id: Situation; name: string; emoji: string }[] = [
    { id: 'new_year', name: '새해/새시작', emoji: '🎊' },
    { id: 'christmas', name: '크리스마스', emoji: '🎄' },
    { id: 'birthday', name: '생일', emoji: '🎂' },
    { id: 'promotion', name: '승진/취업', emoji: '🎉' },
    { id: 'graduation', name: '졸업', emoji: '🎓' },
    { id: 'wedding', name: '결혼/약혼', emoji: '💒' },
    { id: 'vacation', name: '휴가/여행', emoji: '✈️' },
    { id: 'comfort', name: '위로', emoji: '💝' },
    { id: 'encouragement', name: '응원/격려', emoji: '💪' },
    { id: 'gratitude', name: '감사', emoji: '🙏' },
];

// 별 애니메이션 컴포넌트
function FloatingStars() {
    const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 40 }, (_, i) => ({
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

// 카드 미리보기 컴포넌트
function CardPreview({
    recipientName,
    strengths,
    situation,
    coachMessage,
    season,
    language = 'ko',
    brandName,
    coachName
}: {
    recipientName: string;
    strengths: string[];
    situation: string;
    coachMessage: string;
    season: Season | null;
    language?: 'ko' | 'en';
    brandName?: string;
    coachName?: string;
}) {
    // 언어에 따라 강점 이름 표시
    const selectedStrengthsList = strengths.map((id: string) => {
        const s = STRENGTHS.find(str => str.id === id);
        if (!s) return null;
        // 한국어면 괄호 안의 한글, 영어면 영어 이름
        const name = language === 'ko'
            ? s.name.match(/\(([^)]+)\)/)?.[1] || s.name.split(' ')[0]
            : s.name.split(' ')[0];
        return { ...s, displayName: name };
    }).filter(Boolean);
    const selectedSeason = SEASONS.find(s => s.id === season);

    return (
        <motion.div
            className="premium-card card-corner rounded-2xl p-4 w-full max-w-md mx-auto relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* 계절 배지 */}
            {selectedSeason && (
                <div className="absolute top-3 right-3">
                    <span className="text-xl">{selectedSeason.emoji}</span>
                </div>
            )}

            {/* 상단: 로고 + 수신자 (골드 컬러 font-signature) */}
            <div className="text-center mb-2">
                <p className="text-gold-400 text-xs font-semibold tracking-wide mb-1">{brandName || 'StrengthsNavigator'}</p>
                <h2 className="text-gold-400 font-signature text-lg">
                    To. {recipientName || (language === 'en' ? "Recipient's Name" : '받는 분의 이름')}
                </h2>
            </div>

            {/* 강점 배지 (컴팩트) */}
            {selectedStrengthsList.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {selectedStrengthsList.map((s: any, i: number) => s && (
                        <span key={i} className="px-1.5 py-0.5 bg-gold-500/15 border border-gold-400/20 rounded-full text-gold-400 text-[11px]">
                            {s.emoji} {s.displayName}
                        </span>
                    ))}
                </div>
            )}

            {/* 상황 설명 */}
            {situation && (
                <div className="mb-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/50 text-[10px] leading-relaxed font-elegant text-center">
                        {situation}
                    </p>
                </div>
            )}

            {/* 코치의 메시지 */}
            <div className="mb-2 overflow-y-auto max-h-40">
                <p className="text-white leading-relaxed font-elegant text-sm whitespace-pre-wrap text-center px-1">
                    {coachMessage || (language === 'en' ? "Coach's heartfelt message will appear here." : '코치의 진심 어린 메시지가 여기에 표시됩니다.')}
                </p>
            </div>

            {/* 구분선 */}
            <div className="divider-elegant w-12 mx-auto my-1.5" />

            {/* 코치 서명 - 골드 컬러 font-signature */}
            <div className="text-center">
                <p className="text-gold-400 font-signature text-lg">From. {coachName || '코치'}</p>
            </div>
        </motion.div>
    );
}

export default function CardCreatorPage() {
    // 폼 상태
    const [recipientName, setRecipientName] = useState('');
    const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
    const [situationText, setSituationText] = useState('');
    const [coachMessage, setCoachMessage] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    // i18n 텍스트
    const t = (i18n as any)[language];

    // 계절 테마 상태
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);

    // Auto-fill 상태
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 코치 프로필 상태
    const [coachProfile, setCoachProfile] = useState({
        brand_name: 'StrengthsNavigator',
        nickname: '',
        name: ''
    });

    // 프로필 로드
    useEffect(() => {
        async function loadProfile() {
            const profile = await getPublicCoachProfile();
            if (profile) {
                setCoachProfile({
                    brand_name: profile.brand_name || 'StrengthsNavigator',
                    nickname: profile.nickname || '',
                    name: profile.name || ''
                });
            }
        }
        loadProfile();
    }, []);

    // 고객 검색 (debounced)
    const searchClientsDebounced = useCallback(async (query: string) => {
        if (query.length < 1) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchClients(query);
            setSearchResults(results);
            setShowSearchResults(results.length > 0);
        } catch (error) {
            console.error('검색 오류:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 이름 입력 시 검색
    useEffect(() => {
        const timer = setTimeout(() => {
            searchClientsDebounced(recipientName);
        }, 300);
        return () => clearTimeout(timer);
    }, [recipientName, searchClientsDebounced]);

    // 고객 선택 시 강점 자동 채우기
    const handleClientSelect = (client: Client) => {
        setRecipientName(client.name);
        setSelectedClient(client);
        setShowSearchResults(false);
        // 강점은 자동으로 채우지 않음 - 코치가 선택적으로 채울 수 있음
    };

    // 선택된 고객의 강점 불러오기
    const handleLoadClientStrengths = () => {
        if (!selectedClient) return;
        const clientStrengths = [
            selectedClient.strength_1,
            selectedClient.strength_2,
            selectedClient.strength_3,
            selectedClient.strength_4,
            selectedClient.strength_5
        ].filter(Boolean) as string[];
        setSelectedStrengths(clientStrengths);
    };

    // 강점 기반 편지 자동 생성
    const generateStrengthLetter = () => {
        if (selectedStrengths.length === 0) {
            alert(language === 'ko' ? '먼저 강점을 선택해주세요.' : 'Please select strengths first.');
            return;
        }

        const lang = language;
        const name = recipientName || (lang === 'ko' ? '소중한 분' : 'Dear Friend');

        // 인사말 (To. [이름]이 카드에 있으므로 제거)
        let letter = lang === 'ko'
            ? `당신은 정말 특별한 강점의 조합을 가지고 계시네요.\n\n`
            : `You have a truly special combination of strengths.\n\n`;

        // 각 강점에 대한 설명 추가
        selectedStrengths.forEach((strengthId, index) => {
            const desc = strengthDescriptions[strengthId as keyof typeof strengthDescriptions];
            const strengthI18n = strengthsI18n[strengthId as keyof typeof strengthsI18n];
            if (desc && strengthI18n) {
                const strengthName = strengthI18n[lang]; // 언어에 맞는 이름 사용
                const emoji = strengthI18n.emoji;
                const trait = desc[lang].trait;
                const description = desc[lang].description;

                if (lang === 'ko') {
                    letter += `${emoji} ${strengthName}\n「 ${trait} 당신 」\n${description}\n\n`;
                } else {
                    letter += `${emoji} ${strengthName}\n「 You, ${trait} 」\n${description}\n\n`;
                }

                // 마지막 항목이 아니면 구분선 추가
                if (index < selectedStrengths.length - 1) {
                    letter += `· · ·\n\n`;
                }
            }
        });

        // 마무리 인사
        if (lang === 'ko') {
            letter += `━━━━━━━━━━━━━━\n\n✨ 이 강점들이 조화를 이루어\n당신만의 특별한 빛을 만들어냅니다.\n\n앞으로의 여정을 응원합니다!`;
        } else {
            letter += `━━━━━━━━━━━━━━\n\n✨ These strengths harmonize\nto create your unique light.\n\nCheering for your journey ahead!`;
        }

        setCoachMessage(letter);
    };

    // 생성된 카드 URL
    const [cardUrl, setCardUrl] = useState<string | null>(null);

    // 카드 저장 및 URL 생성
    const handleSaveCard = async () => {
        if (!recipientName || !coachMessage) return;

        setIsSaving(true);
        try {
            const savedCard = await saveSentCard({
                client_id: selectedClient?.id,
                client_name: recipientName,
                season: selectedSeason || undefined,
                situation: selectedSituation || undefined,
                strength: selectedStrengths.join(',') || undefined,
                situation_text: situationText || undefined,
                coach_message: coachMessage,
            });

            // 고유 URL 생성
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

            if (savedCard?.id && !savedCard.id.startsWith('local-')) {
                // DB 저장 성공 시 짧은 링크 생성
                const url = `${baseUrl}/c/${savedCard.id}?lang=${language}`;
                setCardUrl(url);
            } else {
                // 저장 실패 시 알림 및 긴 링크 Fallback
                console.warn('⚠️ DB 저장 실패, 긴 링크로 대체됨');

                const params = new URLSearchParams({
                    name: recipientName,
                    strengths: selectedStrengths.join(','),
                    situation: situationText,
                    message: coachMessage,
                    season: selectedSeason || '',
                    lang: language,
                });
                const url = `${baseUrl}/card?${params.toString()}`;
                setCardUrl(url);
            }

            setSaveSuccess(true);
        } catch (error) {
            console.error('카드 저장 오류:', error);
            alert(language === 'en'
                ? '⚠️ Card save failed. Please try again.'
                : '⚠️ 카드 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    // URL 복사
    const copyUrl = async () => {
        if (!cardUrl) return;
        await navigator.clipboard.writeText(cardUrl);
        alert('링크가 복사되었습니다! 카카오톡에 붙여넣기 하세요.');
    };

    // 카카오톡 공유
    const shareToKakao = () => {
        if (!cardUrl) return;

        if (typeof window !== 'undefined' && (window as any).Kakao?.Share) {
            (window as any).Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${recipientName}님께 강점 카드가 도착했어요! 💌`,
                    description: '긁어서 확인해보세요 ✨',
                    imageUrl: `${window.location.origin}/api/og?name=${encodeURIComponent(recipientName)}&strengths=${selectedStrengths.join(',')}`,
                    link: {
                        mobileWebUrl: cardUrl,
                        webUrl: cardUrl,
                    },
                },
            });
        } else {
            copyUrl();
        }
    };

    // 추천 인사말 가져오기
    const getTemplates = (): string[] => {
        if (!selectedSeason || !selectedSituation) return [];

        const seasonData = seasonalTemplates.seasons[selectedSeason];
        if (!seasonData) return [];

        const templates = seasonData.templates[selectedSituation];
        return templates || [];
    };

    // 인사말 선택 시 자동 입력
    const handleTemplateSelect = (template: string) => {
        setCoachMessage(template);
        setShowTemplates(false);
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* 계절 효과 또는 기본 별 배경 */}
            {selectedSeason ? (
                <SeasonalEffect season={selectedSeason} />
            ) : (
                <FloatingStars />
            )}

            {/* 콘텐츠 */}
            <div className="relative z-10 min-h-screen py-8 px-4">
                {/* 헤더 */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-white/60 hover:text-gold-400 transition-colors flex items-center gap-2">
                            {language === 'en' ? '← Home' : '← 홈으로'}
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-elegant font-bold text-gold-gradient">
                                {language === 'en' ? 'Create Card' : '카드 만들기'}
                            </h1>
                            <p className="text-white/60 text-sm mt-1">
                                {language === 'en' ? 'Add a special message' : '특별한 메시지를 담아보세요'}
                            </p>
                        </div>
                        <div className="w-20" />
                    </div>
                </div>

                {/* 2컬럼 레이아웃: 폼 + 미리보기 */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 왼쪽: 입력 폼 */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="glass rounded-2xl p-6 space-y-6">
                            {/* 🌸 계절 테마 선택 */}
                            <div>
                                <label className="block text-white/80 mb-3 font-medium">
                                    {language === 'en' ? '🌈 Season Theme' : '🌈 계절 테마'}
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {SEASONS.map((season) => (
                                        <motion.button
                                            key={season.id}
                                            onClick={() => setSelectedSeason(season.id)}
                                            className={`p-3 rounded-xl border-2 transition-all ${selectedSeason === season.id
                                                ? 'border-gold-400 bg-gold-400/10'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span className="text-2xl block mb-1">{season.emoji}</span>
                                            <span className="text-white/80 text-xs">
                                                {(i18n as any)[language].seasons[season.id]}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* 📨 상황 선택 */}
                            <div>
                                <label className="block text-white/80 mb-3 font-medium">
                                    {language === 'en' ? '📝 Select Situation' : '📝 상황 선택'}
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {SITUATIONS.map((situation) => (
                                        <motion.button
                                            key={situation.id}
                                            onClick={() => setSelectedSituation(situation.id)}
                                            className={`p-3 rounded-xl border-2 transition-all ${selectedSituation === situation.id
                                                ? 'border-gold-400 bg-gold-400/10'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-xl block mb-1">{situation.emoji}</span>
                                            <span className="text-white/80 text-xs">
                                                {(i18n as any)[language].situations[situation.id]}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* 언어 선택 */}
                            <div>
                                <label className="block text-white/80 mb-2 font-medium">
                                    {t.create.languageSelect}
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setLanguage('ko')}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${language === 'ko'
                                            ? 'bg-gold-500 text-ocean-900'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        🇰🇷 한국어
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${language === 'en'
                                            ? 'bg-gold-500 text-ocean-900'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        🇺🇸 English
                                    </button>
                                </div>
                            </div>

                            {/* 수신자 이름 */}
                            <div className="relative">
                                <label className="block text-white/80 mb-2 font-medium">
                                    {t.create.recipientName}
                                    {isSearching && <span className="text-gold-400 text-xs ml-2">{t.create.searching}</span>}
                                </label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => {
                                        setRecipientName(e.target.value);
                                        setSelectedClient(null);
                                    }}
                                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all"
                                    placeholder={t.create.recipientPlaceholder}
                                />

                                {/* 검색 결과 드롭다운 */}
                                <AnimatePresence>
                                    {showSearchResults && searchResults.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-20 w-full mt-1 bg-ocean-800 border border-gold-400/30 rounded-xl overflow-hidden shadow-xl"
                                        >
                                            <p className="px-3 py-2 text-xs text-gold-400 bg-gold-500/10">
                                                {t.create.existingClient}
                                            </p>
                                            {searchResults.map((client) => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => handleClientSelect(client)}
                                                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-t border-white/5"
                                                >
                                                    <p className="text-white font-medium">{client.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {[client.strength_1, client.strength_2, client.strength_3].filter(Boolean).map((s, i) => {
                                                            const strengthInfo = STRENGTHS.find(str => str.id === s);
                                                            return (
                                                                <span key={i} className="text-xs text-gold-400/70">
                                                                    {strengthInfo?.name?.split(' ')[0]}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* 선택된 고객 - 강점 불러오기 버튼 */}
                                {selectedClient && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 p-3 bg-gold-500/10 border border-gold-400/20 rounded-lg flex items-center justify-between"
                                    >
                                        <p className="text-gold-400 text-sm">
                                            ✅ {selectedClient.name}님 선택됨
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleLoadClientStrengths}
                                            className="px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 text-sm rounded-lg transition-colors"
                                        >
                                            강점 불러오기
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            {/* 강점 선택 (다중 선택 - 최대 5개) */}
                            <div>
                                <label className="block text-white/80 mb-2 font-medium">
                                    {t.create.strengthSelect} <span className="text-white/50 text-sm">({selectedStrengths.length}/5)</span>
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-white/5 border border-white/10 rounded-xl">
                                    {STRENGTHS.map((s) => {
                                        const isSelected = selectedStrengths.includes(s.id);
                                        const isDisabled = !isSelected && selectedStrengths.length >= 5;
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedStrengths(prev => prev.filter(id => id !== s.id));
                                                    } else if (!isDisabled) {
                                                        setSelectedStrengths(prev => [...prev, s.id]);
                                                    }
                                                }}
                                                disabled={isDisabled}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${isSelected
                                                    ? 'bg-gold-500 text-ocean-900 font-bold'
                                                    : isDisabled
                                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {s.emoji} {
                                                    language === 'ko'
                                                        ? `${strengthsI18n[s.id as keyof typeof strengthsI18n]?.ko || s.name.split(' ')[0]} (${s.name.split(' ')[0]})`
                                                        : s.name.split(' ')[0]
                                                }
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedStrengths.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedStrengths.map(id => {
                                            const s = STRENGTHS.find(str => str.id === id);
                                            const strengthName = language === 'ko'
                                                ? `${strengthsI18n[id as keyof typeof strengthsI18n]?.ko} (${s?.name.split(' ')[0]})`
                                                : s?.name.split(' ')[0];
                                            return s ? (
                                                <span key={id} className="px-3 py-1 bg-gold-500/20 border border-gold-400/30 rounded-full text-gold-400 text-sm flex items-center gap-1">
                                                    {s.emoji} {strengthName}
                                                    <button
                                                        onClick={() => setSelectedStrengths(prev => prev.filter(i => i !== id))}
                                                        className="ml-1 hover:text-red-400"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 상황 설명 (Textarea) */}
                            <div>
                                <label className="block text-white/80 mb-2 font-medium">
                                    {t.create.situationDesc}
                                </label>
                                <textarea
                                    value={situationText}
                                    onChange={(e) => setSituationText(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all resize-none"
                                    rows={3}
                                    placeholder={t.create.situationDescPlaceholder}
                                />
                            </div>

                            {/* 코치의 한마디 (Textarea) + 추천 인사말 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-white/80 font-medium">
                                        {t.create.coachMessage}
                                    </label>
                                    <div className="flex gap-2">
                                        <motion.button
                                            type="button"
                                            onClick={generateStrengthLetter}
                                            className="text-gold-400 text-sm hover:text-gold-300 transition-colors bg-gold-500/10 px-3 py-1 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                            disabled={selectedStrengths.length === 0}
                                        >
                                            {t.create.autoGenerate}
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setShowTemplates(!showTemplates)}
                                            className="text-gold-400 text-sm hover:text-gold-300 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            {showTemplates ? t.create.closeGreetings : t.create.recommendedGreetings}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* 추천 인사말 리스트 */}
                                <AnimatePresence>
                                    {showTemplates && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-3 space-y-2 overflow-hidden"
                                        >
                                            {/* 계절이나 상황 미선택 시 안내 */}
                                            {(!selectedSeason || !selectedSituation) ? (
                                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                                                    <p className="text-white/60 text-sm">
                                                        {t.create.selectSeasonFirst}
                                                    </p>
                                                </div>
                                            ) : (
                                                /* 추천 인사말 목록 */
                                                getTemplates().map((template, index) => (
                                                    <motion.button
                                                        key={index}
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className="w-full p-3 text-left bg-white/5 hover:bg-gold-400/10 border border-white/10 hover:border-gold-400/30 rounded-lg text-white/80 text-sm transition-all"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ scale: 1.01 }}
                                                    >
                                                        "{template}"
                                                    </motion.button>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <textarea
                                    value={coachMessage}
                                    onChange={(e) => setCoachMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all resize-none"
                                    rows={4}
                                    placeholder={language === 'en' ? 'Write your heartfelt message here' : '진심을 담은 메시지를 작성해주세요'}
                                />
                            </div>

                            {/* 카드 생성 버튼 또는 공유 UI */}
                            {!cardUrl ? (
                                <motion.button
                                    onClick={handleSaveCard}
                                    className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold text-lg rounded-xl shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!recipientName || selectedStrengths.length === 0 || !coachMessage || isSaving}
                                >
                                    {isSaving ? t.create.saving : t.create.createCard}
                                </motion.button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* 성공 메시지 */}
                                    <div className="text-center p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                                        <p className="text-green-400 font-bold">{t.create.cardCreated}</p>
                                        <p className="text-white/60 text-sm mt-1">{t.create.shareBelow}</p>
                                    </div>

                                    {/* URL 표시 */}
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-white/50 text-xs mb-1">{t.create.shareLink}</p>
                                        <p className="text-white text-sm break-all">{cardUrl}</p>
                                    </div>

                                    {/* 공유 버튼들 */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={shareToKakao}
                                            className="py-3 bg-[#FEE500] text-black font-bold rounded-xl hover:bg-[#FAE100] transition-colors flex items-center justify-center gap-2"
                                        >
                                            {t.create.kakaoShare}
                                        </button>
                                        <button
                                            onClick={copyUrl}
                                            className="py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {t.create.copyLink}
                                        </button>
                                    </div>

                                    {/* 미리보기 링크 */}
                                    <Link
                                        href={cardUrl}
                                        target="_blank"
                                        className="block text-center text-gold-400 hover:text-gold-300 text-sm transition-colors"
                                    >
                                        {language === 'en' ? '👀 Preview Card →' : '👀 카드 미리보기 →'}
                                    </Link>

                                    {/* 새 카드 만들기 */}
                                    <button
                                        onClick={() => {
                                            setCardUrl(null);
                                            setSaveSuccess(false);
                                            setRecipientName('');
                                            setSelectedStrengths([]);
                                            setSituationText('');
                                            setCoachMessage('');
                                            setSelectedSeason(null);
                                            setSelectedSituation(null);
                                            setSelectedClient(null);
                                        }}
                                        className="w-full py-3 text-white/50 hover:text-white transition-colors text-sm"
                                    >
                                        {t.create.createAnother}
                                    </button>
                                </motion.div>
                            )}

                            {/* 대시보드 링크 */}
                            <Link
                                href="/dashboard"
                                className="block text-center text-white/50 hover:text-gold-400 text-sm transition-colors mt-4"
                            >
                                {language === 'en' ? '📊 View History in Dashboard →' : '📊 대시보드에서 발송 기록 보기 →'}
                            </Link>
                        </div>
                    </motion.div>

                    {/* 오른쪽: 실시간 미리보기 */}
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="sticky top-8">
                            <p className="text-center text-white/50 text-sm mb-4">
                                {language === 'en' ? '✨ Live Preview' : '✨ 실시간 미리보기'}
                            </p>
                            <CardPreview
                                recipientName={recipientName}
                                strengths={selectedStrengths}
                                situation={situationText}
                                coachMessage={coachMessage}
                                season={selectedSeason}
                                language={language}
                                brandName={coachProfile.brand_name}
                                coachName={coachProfile.nickname || coachProfile.name}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
