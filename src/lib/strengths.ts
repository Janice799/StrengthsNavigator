// 갤럽 클리프턴 강점 34가지 테마
// 4가지 영역으로 분류: 실행력, 영향력, 관계구축, 전략적사고

export interface Strength {
    id: string;
    name: {
        ko: string;
        en: string;
    };
    domain: 'executing' | 'influencing' | 'relationship' | 'strategic';
    icon: string;
    description: {
        ko: string;
        en: string;
    };
    affirmation: {
        ko: string;
        en: string;
    };
}

export const strengthDomains = {
    executing: { ko: "실행력", en: "Executing", color: "#8b5cf6" },
    influencing: { ko: "영향력", en: "Influencing", color: "#f59e0b" },
    relationship: { ko: "관계구축", en: "Relationship Building", color: "#10b981" },
    strategic: { ko: "전략적 사고", en: "Strategic Thinking", color: "#3b82f6" }
};

export const strengths: Strength[] = [
    // 실행력 (Executing) - 9개
    {
        id: "achiever",
        name: { ko: "성취", en: "Achiever" },
        domain: "executing",
        icon: "🏆",
        description: { ko: "끊임없이 성과를 내는", en: "Constant drive to accomplish" },
        affirmation: {
            ko: "당신의 한 걸음 한 걸음은 헛되지 않습니다. 성실함이라는 벽돌로 쌓아 올릴 올 한 해의 성과를 기대합니다.",
            en: "Every step you take matters. I look forward to the achievements you'll build brick by brick through your dedication."
        }
    },
    {
        id: "arranger",
        name: { ko: "배열", en: "Arranger" },
        domain: "executing",
        icon: "🧩",
        description: { ko: "복잡함을 정리하는", en: "Organizing complexity" },
        affirmation: {
            ko: "혼란 속에서 질서를 찾는 당신의 능력이 더 큰 하모니를 만들어내는 한 해가 되기를.",
            en: "May your ability to find order in chaos create greater harmony this year."
        }
    },
    {
        id: "belief",
        name: { ko: "신념", en: "Belief" },
        domain: "executing",
        icon: "⭐",
        description: { ko: "핵심 가치를 지키는", en: "Core values guide actions" },
        affirmation: {
            ko: "흔들리지 않는 신념은 가장 강력한 나침반입니다. 당신의 가치가 빛나는 한 해가 되기를.",
            en: "Unwavering belief is the strongest compass. May your values shine brightly this year."
        }
    },
    {
        id: "consistency",
        name: { ko: "공정", en: "Consistency" },
        domain: "executing",
        icon: "⚖️",
        description: { ko: "공평하게 대우하는", en: "Treating everyone fairly" },
        affirmation: {
            ko: "공정함을 지키는 당신이 있어 세상은 더 신뢰할 수 있습니다. 그 균형이 더욱 빛나기를.",
            en: "The world is more trustworthy because you uphold fairness. May that balance shine brighter."
        }
    },
    {
        id: "deliberative",
        name: { ko: "신중", en: "Deliberative" },
        domain: "executing",
        icon: "🔍",
        description: { ko: "신중하게 결정하는", en: "Careful decision making" },
        affirmation: {
            ko: "깊이 생각하는 당신의 신중함이 올바른 결정으로 이어지는 한 해가 되기를.",
            en: "May your thoughtful deliberation lead to the right decisions this year."
        }
    },
    {
        id: "discipline",
        name: { ko: "규율", en: "Discipline" },
        domain: "executing",
        icon: "📋",
        description: { ko: "체계적으로 실행하는", en: "Systematic execution" },
        affirmation: {
            ko: "체계와 질서 속에서 자유를 찾는 당신. 그 규율이 더 큰 성과로 꽃피우기를.",
            en: "You who find freedom in structure and order—may your discipline bloom into greater achievements."
        }
    },
    {
        id: "focus",
        name: { ko: "집중", en: "Focus" },
        domain: "executing",
        icon: "🎯",
        description: { ko: "목표에 집중하는", en: "Prioritizing and focusing" },
        affirmation: {
            ko: "흔들림 없이 목표를 향해 나아가는 당신. 올 한 해, 그 집중력이 원하는 모든 것을 이루게 하기를.",
            en: "You who march toward goals without wavering—may your focus achieve everything you desire this year."
        }
    },
    {
        id: "responsibility",
        name: { ko: "책임", en: "Responsibility" },
        domain: "executing",
        icon: "🤲",
        description: { ko: "맡은 바를 완수하는", en: "Ownership of commitments" },
        affirmation: {
            ko: "약속을 지키는 당신의 신뢰가 더 깊은 관계로 이어지는 한 해가 되기를.",
            en: "May your trustworthiness in keeping promises lead to deeper relationships this year."
        }
    },
    {
        id: "restorative",
        name: { ko: "복구", en: "Restorative" },
        domain: "executing",
        icon: "🔧",
        description: { ko: "문제를 해결하는", en: "Problem solving" },
        affirmation: {
            ko: "문제 속에서 해결책을 찾는 당신. 그 능력이 더 많은 것을 치유하는 한 해가 되기를.",
            en: "You who find solutions within problems—may your ability heal more things this year."
        }
    },

    // 영향력 (Influencing) - 8개
    {
        id: "activator",
        name: { ko: "활성화", en: "Activator" },
        domain: "influencing",
        icon: "🚀",
        description: { ko: "행동으로 옮기는", en: "Turning ideas into action" },
        affirmation: {
            ko: "생각을 행동으로 바꾸는 당신의 에너지가 더 많은 변화를 일으키는 한 해가 되기를.",
            en: "May your energy to turn thoughts into action create more change this year."
        }
    },
    {
        id: "command",
        name: { ko: "주도", en: "Command" },
        domain: "influencing",
        icon: "🦁",
        description: { ko: "주도적으로 이끄는", en: "Taking charge" },
        affirmation: {
            ko: "당신의 목소리는 폭풍 속에서도 길을 제시합니다. 그 리더십이 더 멀리 퍼져나가기를.",
            en: "Your voice shows the way even in storms. May that leadership reach further."
        }
    },
    {
        id: "communication",
        name: { ko: "커뮤니케이션", en: "Communication" },
        domain: "influencing",
        icon: "💬",
        description: { ko: "말로 표현하는", en: "Bringing ideas to life through words" },
        affirmation: {
            ko: "당신의 말은 영감을 불어넣습니다. 그 이야기가 더 많은 마음을 움직이기를.",
            en: "Your words breathe inspiration. May your stories move more hearts."
        }
    },
    {
        id: "competition",
        name: { ko: "경쟁", en: "Competition" },
        domain: "influencing",
        icon: "🥇",
        description: { ko: "1등을 추구하는", en: "Striving to be the best" },
        affirmation: {
            ko: "경쟁 속에서 성장하는 당신. 올 한 해, 더 높은 곳에서 자신을 만나기를.",
            en: "You who grow through competition—may you meet yourself at higher places this year."
        }
    },
    {
        id: "maximizer",
        name: { ko: "최상화", en: "Maximizer" },
        domain: "influencing",
        icon: "💎",
        description: { ko: "탁월함을 추구하는", en: "Focusing on excellence" },
        affirmation: {
            ko: "좋은 것을 최고로 만드는 당신. 그 탁월함이 더욱 빛나는 한 해가 되기를.",
            en: "You who make good things great—may your excellence shine even brighter this year."
        }
    },
    {
        id: "self-assurance",
        name: { ko: "자기확신", en: "Self-Assurance" },
        domain: "influencing",
        icon: "🌟",
        description: { ko: "자신감 있게 나아가는", en: "Confidence in own abilities" },
        affirmation: {
            ko: "자신을 믿는 힘은 세상을 바꿉니다. 당신의 확신이 더 큰 도전을 가능하게 하기를.",
            en: "The power of self-belief changes the world. May your confidence enable greater challenges."
        }
    },
    {
        id: "significance",
        name: { ko: "중요성", en: "Significance" },
        domain: "influencing",
        icon: "🎖️",
        description: { ko: "의미 있는 영향을 주는", en: "Making a meaningful impact" },
        affirmation: {
            ko: "당신의 존재는 이미 의미 있습니다. 그 영향력이 더 넓게 퍼져나가기를.",
            en: "Your existence already matters. May that influence spread even wider."
        }
    },
    {
        id: "woo",
        name: { ko: "사교", en: "Woo" },
        domain: "influencing",
        icon: "🎉",
        description: { ko: "사람을 사로잡는", en: "Winning others over" },
        affirmation: {
            ko: "처음 만난 사람도 친구로 만드는 당신. 그 매력이 더 많은 인연을 만들어내기를.",
            en: "You who turn strangers into friends—may your charm create more connections."
        }
    },

    // 관계구축 (Relationship Building) - 9개
    {
        id: "adaptability",
        name: { ko: "적응", en: "Adaptability" },
        domain: "relationship",
        icon: "🌊",
        description: { ko: "유연하게 대응하는", en: "Going with the flow" },
        affirmation: {
            ko: "흐르는 물처럼 유연한 당신. 어떤 변화에도 자연스럽게 적응하는 한 해가 되기를.",
            en: "You who flow like water—may you adapt naturally to any change this year."
        }
    },
    {
        id: "connectedness",
        name: { ko: "연결성", en: "Connectedness" },
        domain: "relationship",
        icon: "🔗",
        description: { ko: "모든 것의 연결을 믿는", en: "Believing everything is linked" },
        affirmation: {
            ko: "모든 것이 연결되어 있음을 아는 당신. 그 통찰이 더 깊은 의미를 발견하게 하기를.",
            en: "You who know everything is connected—may that insight discover deeper meaning."
        }
    },
    {
        id: "developer",
        name: { ko: "성장촉진", en: "Developer" },
        domain: "relationship",
        icon: "🌱",
        description: { ko: "타인의 성장을 돕는", en: "Recognizing potential in others" },
        affirmation: {
            ko: "씨앗에서 꽃을 보는 당신. 더 많은 사람들의 성장을 이끄는 한 해가 되기를.",
            en: "You who see flowers in seeds—may you guide more people's growth this year."
        }
    },
    {
        id: "empathy",
        name: { ko: "공감", en: "Empathy" },
        domain: "relationship",
        icon: "💗",
        description: { ko: "타인의 감정을 느끼는", en: "Sensing others' feelings" },
        affirmation: {
            ko: "보이지 않는 끈으로 세상과 연결된 당신. 그 공감이 더 많은 위로가 되기를.",
            en: "You connected to the world by invisible threads—may your empathy comfort more."
        }
    },
    {
        id: "harmony",
        name: { ko: "화합", en: "Harmony" },
        domain: "relationship",
        icon: "☮️",
        description: { ko: "갈등을 피하고 조화를 추구하는", en: "Seeking common ground" },
        affirmation: {
            ko: "조화로운 세상을 만드는 당신. 그 평화가 더 넓게 퍼져나가기를.",
            en: "You who create a harmonious world—may that peace spread further."
        }
    },
    {
        id: "includer",
        name: { ko: "포괄", en: "Includer" },
        domain: "relationship",
        icon: "🤗",
        description: { ko: "모두를 품는", en: "Accepting everyone" },
        affirmation: {
            ko: "아무도 소외되지 않게 하는 당신. 그 따뜻함이 더 많은 이를 품기를.",
            en: "You who let no one be left out—may your warmth embrace more people."
        }
    },
    {
        id: "individualization",
        name: { ko: "개별화", en: "Individualization" },
        domain: "relationship",
        icon: "🔬",
        description: { ko: "각 사람의 고유함을 보는", en: "Seeing each person's uniqueness" },
        affirmation: {
            ko: "모든 사람의 특별함을 발견하는 당신. 그 눈이 더 많은 잠재력을 깨우기를.",
            en: "You who discover everyone's specialness—may your eyes awaken more potential."
        }
    },
    {
        id: "positivity",
        name: { ko: "긍정", en: "Positivity" },
        domain: "relationship",
        icon: "☀️",
        description: { ko: "밝은 에너지를 전하는", en: "Contagious enthusiasm" },
        affirmation: {
            ko: "당신의 밝은 에너지는 주변을 환하게 합니다. 그 긍정이 더 많은 곳에 닿기를.",
            en: "Your bright energy lights up surroundings. May your positivity reach more places."
        }
    },
    {
        id: "relator",
        name: { ko: "친밀", en: "Relator" },
        domain: "relationship",
        icon: "❤️",
        description: { ko: "깊은 관계를 추구하는", en: "Enjoying close relationships" },
        affirmation: {
            ko: "깊이 있는 관계를 소중히 여기는 당신. 그 유대가 더욱 깊어지는 한 해가 되기를.",
            en: "You who treasure deep relationships—may those bonds deepen this year."
        }
    },

    // 전략적 사고 (Strategic Thinking) - 8개
    {
        id: "analytical",
        name: { ko: "분석", en: "Analytical" },
        domain: "strategic",
        icon: "📊",
        description: { ko: "데이터로 이해하는", en: "Searching for reasons and causes" },
        affirmation: {
            ko: "숫자 너머의 진실을 보는 당신. 그 분석력이 더 현명한 결정을 이끌기를.",
            en: "You who see truth beyond numbers—may your analysis lead to wiser decisions."
        }
    },
    {
        id: "context",
        name: { ko: "배경", en: "Context" },
        domain: "strategic",
        icon: "📜",
        description: { ko: "과거를 통해 이해하는", en: "Understanding the present via the past" },
        affirmation: {
            ko: "역사에서 지혜를 찾는 당신. 과거의 교훈이 더 나은 미래를 만들기를.",
            en: "You who find wisdom in history—may past lessons create a better future."
        }
    },
    {
        id: "futuristic",
        name: { ko: "미래지향", en: "Futuristic" },
        domain: "strategic",
        icon: "🔮",
        description: { ko: "미래를 그리는", en: "Inspired by the future" },
        affirmation: {
            ko: "남들이 보지 못하는 가능성의 지평선을 보는 당신. 그 비전이 현실이 되기를.",
            en: "You who see horizons of possibility others can't—may your vision become reality."
        }
    },
    {
        id: "ideation",
        name: { ko: "아이디어", en: "Ideation" },
        domain: "strategic",
        icon: "💡",
        description: { ko: "새로운 아이디어를 떠올리는", en: "Fascinated by ideas" },
        affirmation: {
            ko: "끝없이 샘솟는 아이디어의 원천인 당신. 그 창의력이 더 많은 혁신을 만들기를.",
            en: "You, an endless wellspring of ideas—may your creativity create more innovation."
        }
    },
    {
        id: "input",
        name: { ko: "수집", en: "Input" },
        domain: "strategic",
        icon: "🗃️",
        description: { ko: "정보를 수집하는", en: "Craving to know more" },
        affirmation: {
            ko: "지식의 보물창고를 쌓아가는 당신. 그 호기심이 더 넓은 세상을 열기를.",
            en: "You who build treasuries of knowledge—may your curiosity open wider worlds."
        }
    },
    {
        id: "intellection",
        name: { ko: "사고", en: "Intellection" },
        domain: "strategic",
        icon: "🧠",
        description: { ko: "깊이 생각하는", en: "Characterized by intellectual activity" },
        affirmation: {
            ko: "깊은 사색 속에서 진리를 찾는 당신. 그 통찰이 더 명료해지는 한 해가 되기를.",
            en: "You who find truth in deep reflection—may your insights become clearer this year."
        }
    },
    {
        id: "learner",
        name: { ko: "학습", en: "Learner" },
        domain: "strategic",
        icon: "📖",
        description: { ko: "배우는 것을 즐기는", en: "Great desire to learn" },
        affirmation: {
            ko: "배움의 여정을 즐기는 당신. 그 길에서 더 많은 발견이 있기를.",
            en: "You who enjoy the journey of learning—may there be more discoveries on that path."
        }
    },
    {
        id: "strategic",
        name: { ko: "전략", en: "Strategic" },
        domain: "strategic",
        icon: "♟️",
        description: { ko: "대안을 발견하는", en: "Sorting through the clutter" },
        affirmation: {
            ko: "복잡함 속에서 최선의 길을 찾는 당신. 그 전략이 더 큰 성공으로 이끌기를.",
            en: "You who find the best path in complexity—may your strategy lead to greater success."
        }
    }
];

export function getStrengthById(id: string): Strength | undefined {
    return strengths.find(s => s.id === id);
}

export function getStrengthsByDomain(domain: Strength['domain']): Strength[] {
    return strengths.filter(s => s.domain === domain);
}

export function getStrengthAffirmation(id: string, lang: 'ko' | 'en' = 'ko'): string {
    const strength = getStrengthById(id);
    return strength?.affirmation[lang] || '';
}
