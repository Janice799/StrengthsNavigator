// 상황별 테마 (Occasions)
// 계절 + 이벤트 기반 테마 시스템

export interface Occasion {
    id: string;
    name: {
        ko: string;
        en: string;
    };
    icon: string;
    description: {
        ko: string;
        en: string;
    };
    defaultGreeting: {
        ko: string;
        en: string;
    };
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    effect: 'snow' | 'fireworks' | 'cherry' | 'fireflies' | 'leaves' | 'hearts' | 'stars' | 'confetti';
    season: 'winter' | 'spring' | 'summer' | 'autumn' | 'any';
}

export const occasions: Occasion[] = [
    {
        id: "new-year",
        name: { ko: "새해", en: "New Year" },
        icon: "🎆",
        description: { ko: "새로운 시작을 축하하며", en: "Celebrating new beginnings" },
        defaultGreeting: {
            ko: "새해 복 많이 받으세요!",
            en: "Happy New Year!"
        },
        colors: {
            primary: "#1e3a5f",
            secondary: "#0c1a2b",
            accent: "#d4af37"
        },
        effect: "fireworks",
        season: "winter"
    },
    {
        id: "christmas",
        name: { ko: "크리스마스", en: "Christmas" },
        icon: "🎄",
        description: { ko: "따뜻한 연말을 함께", en: "Warm holiday wishes" },
        defaultGreeting: {
            ko: "메리 크리스마스!",
            en: "Merry Christmas!"
        },
        colors: {
            primary: "#1a472a",
            secondary: "#0d2818",
            accent: "#c41e3a"
        },
        effect: "snow",
        season: "winter"
    },
    {
        id: "lunar-new-year",
        name: { ko: "설날", en: "Lunar New Year" },
        icon: "🧧",
        description: { ko: "풍요로운 새해를 기원하며", en: "Wishing prosperity" },
        defaultGreeting: {
            ko: "새해 복 많이 받으세요! 만사형통하시길 바랍니다.",
            en: "Wishing you a prosperous Lunar New Year!"
        },
        colors: {
            primary: "#8b0000",
            secondary: "#5c0000",
            accent: "#ffd700"
        },
        effect: "fireworks",
        season: "winter"
    },
    {
        id: "spring",
        name: { ko: "봄/새출발", en: "Spring / Fresh Start" },
        icon: "🌸",
        description: { ko: "새로운 시작을 응원하며", en: "Cheering for new beginnings" },
        defaultGreeting: {
            ko: "새로운 시작을 축하합니다!",
            en: "Congratulations on your new beginning!"
        },
        colors: {
            primary: "#ffc0cb",
            secondary: "#2d5016",
            accent: "#ffffff"
        },
        effect: "cherry",
        season: "spring"
    },
    {
        id: "graduation",
        name: { ko: "졸업/입학", en: "Graduation / Enrollment" },
        icon: "🎓",
        description: { ko: "새로운 여정을 축하하며", en: "Celebrating new journeys" },
        defaultGreeting: {
            ko: "축하합니다! 새로운 여정을 응원합니다.",
            en: "Congratulations! Cheering for your new journey!"
        },
        colors: {
            primary: "#1e3a5f",
            secondary: "#0c1a2b",
            accent: "#d4af37"
        },
        effect: "confetti",
        season: "spring"
    },
    {
        id: "summer",
        name: { ko: "여름휴가", en: "Summer Vacation" },
        icon: "☀️",
        description: { ko: "재충전의 시간을 선물하며", en: "Wishing restful times" },
        defaultGreeting: {
            ko: "즐거운 휴가 보내세요!",
            en: "Have a wonderful vacation!"
        },
        colors: {
            primary: "#053f43",
            secondary: "#021c1e",
            accent: "#eee296"
        },
        effect: "fireflies",
        season: "summer"
    },
    {
        id: "autumn",
        name: { ko: "추석/추수감사", en: "Chuseok / Thanksgiving" },
        icon: "🍂",
        description: { ko: "풍요로운 수확에 감사하며", en: "Grateful for the harvest" },
        defaultGreeting: {
            ko: "풍성한 한가위 보내세요!",
            en: "Happy Thanksgiving!"
        },
        colors: {
            primary: "#b11509",
            secondary: "#5c0b05",
            accent: "#eb9911"
        },
        effect: "leaves",
        season: "autumn"
    },
    {
        id: "promotion",
        name: { ko: "승진/이직", en: "Promotion / New Job" },
        icon: "💼",
        description: { ko: "새로운 도전을 축하하며", en: "Celebrating new challenges" },
        defaultGreeting: {
            ko: "승진을 진심으로 축하합니다!",
            en: "Congratulations on your promotion!"
        },
        colors: {
            primary: "#1e3a5f",
            secondary: "#0c1a2b",
            accent: "#d4af37"
        },
        effect: "confetti",
        season: "any"
    },
    {
        id: "birthday",
        name: { ko: "생일", en: "Birthday" },
        icon: "🎂",
        description: { ko: "특별한 날을 축하하며", en: "Celebrating your special day" },
        defaultGreeting: {
            ko: "생일 축하합니다!",
            en: "Happy Birthday!"
        },
        colors: {
            primary: "#4a1942",
            secondary: "#2d1028",
            accent: "#ff69b4"
        },
        effect: "confetti",
        season: "any"
    },
    {
        id: "appreciation",
        name: { ko: "감사", en: "Appreciation" },
        icon: "💝",
        description: { ko: "진심을 담아 감사를 전하며", en: "Expressing heartfelt gratitude" },
        defaultGreeting: {
            ko: "항상 감사합니다.",
            en: "Thank you always."
        },
        colors: {
            primary: "#1e3a5f",
            secondary: "#0c1a2b",
            accent: "#e91e63"
        },
        effect: "hearts",
        season: "any"
    },
    {
        id: "encouragement",
        name: { ko: "응원", en: "Encouragement" },
        icon: "💪",
        description: { ko: "힘이 되는 메시지를 보내며", en: "Sending strength and support" },
        defaultGreeting: {
            ko: "당신을 응원합니다!",
            en: "I believe in you!"
        },
        colors: {
            primary: "#1e3a5f",
            secondary: "#0c1a2b",
            accent: "#3b82f6"
        },
        effect: "stars",
        season: "any"
    }
];

export function getOccasionById(id: string): Occasion | undefined {
    return occasions.find(o => o.id === id);
}

export function getOccasionsBySeason(season: Occasion['season']): Occasion[] {
    if (season === 'any') return occasions;
    return occasions.filter(o => o.season === season || o.season === 'any');
}

export function getCurrentSeasonOccasions(): Occasion[] {
    const month = new Date().getMonth() + 1;
    let season: Occasion['season'];

    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';

    return getOccasionsBySeason(season);
}
