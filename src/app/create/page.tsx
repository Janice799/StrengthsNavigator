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
import { LanguageToggle, useLanguage } from '@/hooks/useLanguage';

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
                <p className="text-gold-400 font-signature text-lg">From. {coachName || (language === 'en' ? 'Coach' : '코치')}</p>
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
    const { lang: language, setLang } = useLanguage();

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

    // 토스트 메시지 상태
    const [toastMessage, setToastMessage] = useState<string | null>(null);

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
                console.log('✅ 카드 저장 성공:', savedCard.id);
            } else {
                // 저장 실패 시 알림 - 긴 URL 대신 에러 메시지 표시
                console.error('⚠️ DB 저장 실패');
                alert(language === 'en'
                    ? '⚠️ Card save failed. Please make sure you are logged in and try again.'
                    : '⚠️ 카드 저장에 실패했습니다. 로그인 상태를 확인하고 다시 시도해주세요.');
                setIsSaving(false);
                return;
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

    // URL 복사 (HTTP 환경 fallback 포함)
    const copyUrl = async () => {
        if (!cardUrl) return;

        const showToast = (msg: string) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(null), 3000);
        };

        try {
            // 보안 컨텍스트(HTTPS)에서만 Clipboard API 사용 가능
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(cardUrl);
                showToast(language === 'en'
                    ? '✅ Link copied! Paste it in your messenger.'
                    : '✅ 링크가 복사되었습니다! 카카오톡에 붙여넣기 하세요.');
            } else {
                // HTTP 환경 fallback: 임시 textarea 사용
                const textArea = document.createElement('textarea');
                textArea.value = cardUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast(language === 'en'
                    ? '✅ Link copied! Paste it in your messenger.'
                    : '✅ 링크가 복사되었습니다! 카카오톡에 붙여넣기 하세요.');
            }
        } catch (err) {
            console.error('복사 실패:', err);
            // 복사 실패 시 링크를 prompt로 표시
            prompt(
                language === 'en' ? 'Copy this link:' : '이 링크를 복사하세요:',
                cardUrl
            );
        }
    };

    // 공유하기 (Web Share API)
    const shareCard = async () => {
        if (!cardUrl) return;

        const shareData = {
            title: language === 'en'
                ? `${recipientName}, you have a strength card! 💌`
                : `${recipientName}님께 강점 카드가 도착했어요! 💌`,
            text: language === 'en'
                ? 'Open to discover your strengths ✨'
                : '열어서 확인해보세요 ✨',
            url: cardUrl,
        };

        // Web Share API 지원 여부 확인 (HTTPS에서만 작동)
        if (navigator.share && window.isSecureContext) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // 사용자가 공유를 취소한 경우
                if ((err as Error).name !== 'AbortError') {
                    console.error('공유 실패:', err);
                    await copyUrl(); // fallback
                }
            }
        } else {
            // Web Share API 미지원 또는 HTTP 환경 시 링크 복사로 대체
            await copyUrl();
        }
    };

    // 추천 인사말 가져오기
    const getTemplates = (): string[] => {
        if (!selectedSeason || !selectedSituation) return [];

        // 영어 모드일 때 기본 영어 메시지 반환
        if (language === 'en') {
            const englishTemplates: Record<string, Record<string, string[]>> = {
                spring: {
                    new_year: ["Wishing you a fresh start like the blooming spring!", "May your new beginning be as beautiful as spring flowers!", "Hope this spring brings you endless possibilities!", "Like cherry blossoms, may your new journey be magnificent!", "A new chapter begins - embrace it with spring's energy!"],
                    birthday: ["Happy Birthday! May your day bloom like spring flowers!", "Wishing you a birthday as warm as spring sunshine!", "Celebrate like the first flowers of spring!", "May your new year be as refreshing as spring breeze!", "Happy Birthday! Bloom and shine!"],
                    christmas: ["Merry Christmas! Warm as spring memories!", "Wishing you holiday joy as beautiful as spring!", "May your Christmas be filled with spring-like warmth!", "Season's greetings with spring-fresh blessings!", "A Christmas as lovely as a spring garden!"],
                    encouragement: ["Like spring follows winter, better days are coming!", "You'll bloom beautifully, just like spring flowers!", "Keep going - your spring is just around the corner!", "New growth awaits you, just like springtime!", "Believe in yourself - spring always arrives!"],
                    comfort: ["After every winter comes spring - hold on!", "Like spring rain brings growth, this too shall pass!", "You'll bloom again, just wait for your spring!", "Warmth is coming - spring is near!", "Nature renews, and so will you!"],
                    promotion: ["Congratulations! Your hard work has blossomed!", "Like flowers in spring, your career is blooming!", "Well deserved success - celebrate this spring moment!", "Your dedication has paid off - congratulations!", "Rising like spring sunshine - so proud of you!"],
                    graduation: ["Congratulations! Time to bloom in the real world!", "Like spring's first flowers, you're ready to shine!", "Graduation marks a new spring in your life!", "Your future is as bright as spring sunshine!", "Celebrate this new beginning - you've earned it!"],
                    wedding: ["Wishing you a love as beautiful as spring!", "May your marriage bloom like spring flowers!", "Congratulations on your spring of love!", "A new season of love begins - best wishes!", "May your love story be eternally spring!"],
                    vacation: ["Enjoy your spring getaway!", "May your vacation blossom with joy!", "Relax and bloom - you deserve it!", "Spring adventures await - have fun!", "Wishing you a refreshing spring break!"],
                    gratitude: ["Thank you for being a ray of spring sunshine!", "Your kindness blooms like spring flowers - grateful!", "Appreciation as warm as spring!", "Thank you for being so wonderful!", "Your help means the world to me!"]
                },
                summer: {
                    new_year: ["Start the year with summer's energy!", "May your new year shine like summer sun!", "Wishing you a bright and vibrant year ahead!", "Embrace new beginnings with summer warmth!", "Your year will be as brilliant as summer!"],
                    birthday: ["Happy Birthday! Shine like the summer sun!", "Wishing you a birthday as warm as summer!", "Celebrate with summer vibes - Happy Birthday!", "May your year be as bright as summer days!", "Have a sunny, spectacular birthday!"],
                    christmas: ["Merry Christmas with summer warmth in our hearts!", "Wishing you a bright holiday season!", "May your Christmas be as warm as summer memories!", "Holiday blessings - warm as summer sunshine!", "A radiant Christmas to you!"],
                    encouragement: ["Shine bright like the summer sun!", "You've got this - summer energy is yours!", "Stay strong - sunny days are ahead!", "Like summer, your spirit is unbreakable!", "Keep shining - you're doing great!"],
                    comfort: ["After every storm comes summer sunshine!", "Warmth is coming - hang in there!", "Like summer follows rain, joy follows pain!", "Brighter days are just ahead!", "You'll shine again - believe it!"],
                    promotion: ["Congratulations! You're on fire!", "Success looks great on you - well done!", "Rising like the summer sun - congrats!", "Your hard work is paying off brilliantly!", "Celebrate this sunny achievement!"],
                    graduation: ["Congratulations, graduate! Shine on!", "Your future is as bright as summer!", "You did it! Time to shine!", "Adventure awaits - go get it!", "Proud of your sunny achievement!"],
                    wedding: ["Wishing you eternal summer love!", "May your love shine bright always!", "Congratulations on your beautiful union!", "A love as warm as summer - best wishes!", "May your days together be sunny!"],
                    vacation: ["Have the best summer vacation ever!", "Enjoy every sunny moment!", "Relax, recharge, and have fun!", "Summer vibes only - enjoy!", "Make amazing summer memories!"],
                    gratitude: ["Thank you for brightening my day!", "Your warmth is appreciated!", "Grateful for your sunny spirit!", "Thank you so much!", "You're a ray of sunshine - thanks!"]
                },
                autumn: {
                    new_year: ["May your new year be rich like autumn harvest!", "Wishing you abundance in the coming year!", "A golden new beginning awaits you!", "May success fall like autumn leaves!", "Harvest the joy of new possibilities!"],
                    birthday: ["Happy Birthday! May you reap all the blessings!", "Wishing you a golden birthday!", "Celebrate your harvest of wonderful years!", "May your day be as rich as autumn!", "A beautiful birthday to you!"],
                    christmas: ["Merry Christmas with autumn's warmth!", "Wishing you a cozy holiday season!", "May your Christmas be rich with joy!", "Holiday blessings, golden and warm!", "A wonderful Christmas to you!"],
                    encouragement: ["Your hard work will bear fruit - keep going!", "Success is ripening - stay patient!", "Like autumn harvest, rewards are coming!", "Golden opportunities await you!", "Keep planting seeds of effort!"],
                    comfort: ["After leaves fall, spring comes again!", "This season of difficulty will pass!", "Peace is coming - hold on!", "Like nature, you'll renew!", "Better times are ahead!"],
                    promotion: ["Congratulations on your harvest of success!", "You've earned this golden moment!", "Your efforts have ripened beautifully!", "Well-deserved promotion - congrats!", "Reap the rewards of your hard work!"],
                    graduation: ["Congratulations! Time to harvest your dreams!", "You've cultivated success - well done!", "Golden futures await you!", "Celebrate your abundant achievement!", "Your hard work has paid off!"],
                    wedding: ["May your love be rich and golden!", "Wishing you a bountiful life together!", "Congratulations on your beautiful harvest of love!", "May your marriage be ever fruitful!", "Golden blessings on your union!"],
                    vacation: ["Enjoy the beautiful autumn scenery!", "Have a golden getaway!", "Relax among the fall colors!", "Autumn adventures await!", "Enjoy this cozy vacation!"],
                    gratitude: ["Thank you - your kindness is golden!", "Grateful for your generous spirit!", "Your help means everything!", "Thank you so much!", "Appreciation beyond words!"]
                },
                winter: {
                    new_year: ["May the new year be pure like fresh snow!", "Wishing you a cozy and blessed year!", "Start fresh like the first snowfall!", "May warmth fill your new year!", "A beautiful new beginning awaits!"],
                    birthday: ["Happy Birthday! May your day be magical!", "Wishing you birthday warmth this winter!", "Celebrate like the first snowfall - uniquely!", "May your year ahead be wonderful!", "A cozy birthday to you!"],
                    christmas: ["Merry Christmas! May it be magical!", "Wishing you a wonderful holiday season!", "May your Christmas be filled with joy!", "Warm wishes for a beautiful Christmas!", "Let it snow, let it glow - Merry Christmas!"],
                    encouragement: ["After winter comes spring - hold on!", "You'll shine through like winter stars!", "Warmth is coming - stay strong!", "Like snow melts to reveal life, good things await!", "Believe in brighter days!"],
                    comfort: ["Spring always follows winter!", "This cold season will pass!", "Warmth is on its way!", "You'll emerge stronger!", "Better days are coming!"],
                    promotion: ["Congratulations! You shine like a winter star!", "Hard work through the cold has paid off!", "You're rising like winter sunshine!", "Well-deserved success - congrats!", "Brilliant achievement - proud of you!"],
                    graduation: ["Congratulations! Spring awaits you!", "You made it through - well done!", "A bright future is ahead!", "Your perseverance paid off!", "Celebrate this milestone!"],
                    wedding: ["Wishing you eternal warmth in love!", "May your love be cozy forever!", "Congratulations on your beautiful union!", "Pure love like fresh snow!", "Best wishes for your journey together!"],
                    vacation: ["Have a magical winter getaway!", "Enjoy the cozy vacation!", "Make wonderful winter memories!", "Relax and stay warm!", "Enjoy this beautiful season!"],
                    gratitude: ["Thank you for your warm heart!", "Your kindness melts the cold - grateful!", "Thank you so much!", "Warm appreciation for everything!", "You're a blessing - thanks!"]
                }
            };

            const seasonData = englishTemplates[selectedSeason];
            if (!seasonData) return [];
            return seasonData[selectedSituation] || ["Wishing you all the best!", "May this special moment bring you joy!", "Thinking of you with warm wishes!", "You are truly special!", "Best wishes to you!"];
        }

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
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {SITUATIONS.map((situation) => (
                                        <motion.button
                                            key={situation.id}
                                            onClick={() => setSelectedSituation(situation.id)}
                                            className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${selectedSituation === situation.id
                                                ? 'border-gold-400 bg-gold-400/10'
                                                : 'border-white/10 hover:border-white/30'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-lg sm:text-xl block mb-1">{situation.emoji}</span>
                                            <span className="text-white/80 text-[10px] sm:text-xs leading-tight block">
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
                                        onClick={() => setLang('ko')}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${language === 'ko'
                                            ? 'bg-gold-500 text-ocean-900'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        🇰🇷 한국어
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLang('en')}
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
                                {/* 모바일에서는 세로로, 데스크톱에서는 가로로 정렬 */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                    <label className="text-white/80 font-medium whitespace-nowrap">
                                        {t.create.coachMessage}
                                    </label>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <motion.button
                                            type="button"
                                            onClick={generateStrengthLetter}
                                            className="text-gold-400 text-xs sm:text-sm hover:text-gold-300 transition-colors bg-gold-500/10 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap"
                                            whileHover={{ scale: 1.05 }}
                                            disabled={selectedStrengths.length === 0}
                                        >
                                            {t.create.autoGenerate}
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setShowTemplates(!showTemplates)}
                                            className="text-gold-400 text-xs sm:text-sm hover:text-gold-300 transition-colors bg-white/5 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap"
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
                                            onClick={shareCard}
                                            className="py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-ocean-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            📤 {language === 'en' ? 'Share' : '공유하기'}
                                        </button>
                                        <button
                                            onClick={copyUrl}
                                            className="py-3 glass text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {t.create.copyLink}
                                        </button>
                                    </div>

                                    {/* 토스트 메시지 */}
                                    <AnimatePresence>
                                        {toastMessage && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-3 bg-green-500/20 border border-green-400/30 rounded-xl text-center"
                                            >
                                                <p className="text-green-400 text-sm">{toastMessage}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

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
