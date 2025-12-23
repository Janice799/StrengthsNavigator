// 융의 12가지 원형 (Jungian Archetypes)
// 각 원형별 신년/축하 메시지 포함

export interface Archetype {
    id: string;
    name: {
        ko: string;
        en: string;
    };
    icon: string;
    keywords: {
        ko: string[];
        en: string[];
    };
    message: {
        ko: string;
        en: string;
    };
    color: string;
}

export const archetypes: Archetype[] = [
    {
        id: "creator",
        name: { ko: "창조자", en: "Creator" },
        icon: "🎨",
        keywords: { ko: ["혁신", "상상력", "예술"], en: ["Innovation", "Imagination", "Art"] },
        message: {
            ko: "당신의 상상은 현실의 설계도입니다. 올 한 해, 세상에 없던 풍경을 그려내시길 바랍니다.",
            en: "Your imagination is the blueprint of reality. This year, paint landscapes the world has never seen."
        },
        color: "#9b59b6"
    },
    {
        id: "explorer",
        name: { ko: "탐험가", en: "Explorer" },
        icon: "🧭",
        keywords: { ko: ["자유", "발견", "모험"], en: ["Freedom", "Discovery", "Adventure"] },
        message: {
            ko: "지도가 없는 곳에 가장 빛나는 보물이 있습니다. 미지의 바다로 닻을 올리는 당신을 응원합니다.",
            en: "The brightest treasures lie where maps don't reach. I cheer for you as you set sail into unknown waters."
        },
        color: "#3498db"
    },
    {
        id: "sage",
        name: { ko: "현자", en: "Sage" },
        icon: "📚",
        keywords: { ko: ["지혜", "진리", "통찰"], en: ["Wisdom", "Truth", "Insight"] },
        message: {
            ko: "소란스러운 세상 속에서도 침묵의 지혜를 발견하는 당신, 깊은 뿌리처럼 흔들림 없는 한 해가 되기를.",
            en: "You who find silent wisdom amid the world's noise—may this year ground you like deep roots, unshaken."
        },
        color: "#1abc9c"
    },
    {
        id: "hero",
        name: { ko: "영웅", en: "Hero" },
        icon: "⚔️",
        keywords: { ko: ["용기", "숙련", "승리"], en: ["Courage", "Mastery", "Victory"] },
        message: {
            ko: "두려움은 용기의 다른 이름입니다. 당신 앞에 놓인 산이 높을수록, 정상에서의 풍경은 더욱 찬란할 것입니다.",
            en: "Fear is just another name for courage. The higher the mountain before you, the more magnificent the view from its peak."
        },
        color: "#e74c3c"
    },
    {
        id: "caregiver",
        name: { ko: "돌봄이", en: "Caregiver" },
        icon: "💝",
        keywords: { ko: ["봉사", "보호", "헌신"], en: ["Service", "Protection", "Devotion"] },
        message: {
            ko: "당신의 따뜻함이 얼어붙은 땅을 녹입니다. 타인을 비추는 그 빛이 당신에게도 온기로 돌아오기를.",
            en: "Your warmth melts frozen ground. May the light you shine on others return to you as warmth."
        },
        color: "#e91e63"
    },
    {
        id: "ruler",
        name: { ko: "통치자", en: "Ruler" },
        icon: "👑",
        keywords: { ko: ["리더십", "질서", "책임"], en: ["Leadership", "Order", "Responsibility"] },
        message: {
            ko: "진정한 왕관은 권위가 아닌 섬김에서 빛납니다. 당신의 리더십이 더 많은 이들에게 영감이 되는 한 해가 되기를.",
            en: "A true crown shines not from authority, but from service. May your leadership inspire many more this year."
        },
        color: "#f39c12"
    },
    {
        id: "magician",
        name: { ko: "마법사", en: "Magician" },
        icon: "✨",
        keywords: { ko: ["변화", "비전", "변환"], en: ["Change", "Vision", "Transformation"] },
        message: {
            ko: "불가능을 가능으로 바꾸는 당신. 올 한 해, 당신의 손끝에서 더 많은 기적이 피어나기를.",
            en: "You who turn impossible into possible—may more miracles bloom from your fingertips this year."
        },
        color: "#8e44ad"
    },
    {
        id: "lover",
        name: { ko: "연인", en: "Lover" },
        icon: "🌹",
        keywords: { ko: ["열정", "친밀함", "아름다움"], en: ["Passion", "Intimacy", "Beauty"] },
        message: {
            ko: "세상의 아름다움을 온몸으로 느끼는 당신. 그 깊은 감수성이 더 많은 사랑으로 채워지는 한 해가 되기를.",
            en: "You who feel the world's beauty with your whole being—may this year fill your deep sensitivity with more love."
        },
        color: "#c0392b"
    },
    {
        id: "jester",
        name: { ko: "광대", en: "Jester" },
        icon: "🎭",
        keywords: { ko: ["유머", "즐거움", "현재"], en: ["Humor", "Joy", "Present"] },
        message: {
            ko: "웃음은 세상을 치유하는 마법입니다. 당신의 유쾌함이 더 많은 곳에 퍼져나가는 한 해가 되기를.",
            en: "Laughter is magic that heals the world. May your joy spread to more places this year."
        },
        color: "#f1c40f"
    },
    {
        id: "everyman",
        name: { ko: "이웃", en: "Everyman" },
        icon: "🤝",
        keywords: { ko: ["소속감", "공감", "연결"], en: ["Belonging", "Empathy", "Connection"] },
        message: {
            ko: "함께할 때 더 강해지는 것을 아는 당신. 올 한 해, 더 깊은 연결과 따뜻한 유대가 함께하기를.",
            en: "You who know we're stronger together—may deeper connections and warm bonds accompany you this year."
        },
        color: "#27ae60"
    },
    {
        id: "rebel",
        name: { ko: "반역자", en: "Rebel" },
        icon: "🔥",
        keywords: { ko: ["해방", "혁명", "변화"], en: ["Liberation", "Revolution", "Change"] },
        message: {
            ko: "낡은 것을 부수고 새로운 것을 세우는 용기. 당신의 불꽃이 더 밝게 타오르는 한 해가 되기를.",
            en: "The courage to tear down the old and build the new—may your flame burn brighter this year."
        },
        color: "#d35400"
    },
    {
        id: "innocent",
        name: { ko: "순수", en: "Innocent" },
        icon: "🌸",
        keywords: { ko: ["희망", "순수함", "낙관"], en: ["Hope", "Purity", "Optimism"] },
        message: {
            ko: "세상을 처음 보는 눈으로 바라보는 당신. 그 순수한 희망이 꽃처럼 피어나는 한 해가 되기를.",
            en: "You who see the world with fresh eyes—may your pure hope bloom like flowers this year."
        },
        color: "#ff69b4"
    }
];

export function getArchetypeById(id: string): Archetype | undefined {
    return archetypes.find(a => a.id === id);
}

export function getArchetypeMessage(id: string, lang: 'ko' | 'en' = 'ko'): string {
    const archetype = getArchetypeById(id);
    return archetype?.message[lang] || '';
}
