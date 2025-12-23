// Gemini AI 메시지 엔진
// 강점 + 상황 기반 맞춤 메시지 생성

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStrengthById, Strength } from './strengths';
import { getOccasionById, Occasion } from './occasions';
import { getArchetypeById, Archetype } from './archetypes';

// 코치 페르소나 타입
export type CoachPersona = 'warm' | 'strict' | 'logical';

export interface PersonaConfig {
    name: string;
    description: string;
    systemPrompt: string;
}

// 페르소나별 시스템 프롬프트
export const personas: Record<CoachPersona, PersonaConfig> = {
    warm: {
        name: '따뜻한 치유형',
        description: '공감과 위로를 중시하는 따뜻한 어조',
        systemPrompt: `당신은 따뜻하고 공감 능력이 뛰어난 강점 코치입니다.
클라이언트의 감정을 먼저 이해하고, 부드럽고 격려하는 어조로 메시지를 작성합니다.
마치 다정한 친구처럼 다가가되, 전문성을 잃지 않습니다.
메시지는 한국어로 작성하며, 이모지를 적절히 사용해 친근함을 더합니다.`
    },
    strict: {
        name: '엄격한 트레이너형',
        description: '목표 지향적이고 동기부여하는 어조',
        systemPrompt: `당신은 목표 지향적인 강점 코치입니다.
클라이언트가 잠재력을 최대한 발휘하도록 직접적이고 동기부여하는 메시지를 작성합니다.
도전적이지만 존중하는 어조를 유지하며, 구체적인 액션을 제안합니다.
메시지는 한국어로 작성하며, 핵심을 간결하게 전달합니다.`
    },
    logical: {
        name: '논리적인 컨설턴트형',
        description: '데이터와 근거 기반의 분석적 어조',
        systemPrompt: `당신은 분석적이고 논리적인 강점 코치입니다.
강점 심리학과 행동과학에 근거한 인사이트를 제공합니다.
감정보다는 이유와 근거를 중시하며, 명확하고 체계적인 메시지를 작성합니다.
메시지는 한국어로 작성하며, 전문성이 느껴지도록 합니다.`
    }
};

// 상황별 심리적 기제
const psychologicalMechanisms: Record<string, Record<string, string>> = {
    'new-year': {
        'executing': '새 목표를 향한 에너지 충전',
        'influencing': '새로운 만남과 기회에 대한 기대',
        'relationship': '소중한 관계 강화의 시작',
        'strategic': '장기 계획 수립의 최적 시점'
    },
    'christmas': {
        'executing': '휴식에 대한 불안감 해소',
        'influencing': '연결 욕구 충족과 파티 에너지',
        'relationship': '가족/친구와의 깊은 유대',
        'strategic': '한 해 성찰과 의미 부여'
    },
    'birthday': {
        'executing': '성취 회고와 새 목표 설정',
        'influencing': '축하받는 기쁨과 인정 욕구',
        'relationship': '관계 속 자신의 가치 확인',
        'strategic': '개인 성장 분석과 통찰'
    },
    'summer-vacation': {
        'executing': '충전 후 더 큰 도약 준비',
        'influencing': '새로운 경험과 네트워킹',
        'relationship': '함께하는 시간의 소중함',
        'strategic': '창의적 아이디어 발굴'
    },
    'encouragement': {
        'executing': '작은 성취에 대한 인정',
        'influencing': '영향력 확장에 대한 격려',
        'relationship': '관계 속 역할의 가치',
        'strategic': '문제 해결 능력 인정'
    },
    'thanks': {
        'executing': '노력과 헌신에 대한 감사',
        'influencing': '긍정적 영향에 대한 감사',
        'relationship': '함께함에 대한 감사',
        'strategic': '통찰과 조언에 대한 감사'
    }
};

export interface MessageGenerationParams {
    recipientName: string;
    occasionId: string;
    strengthId?: string;
    archetypeId?: string;
    situation?: string;
    persona?: CoachPersona;
    coachName?: string;
}

export interface GeneratedMessage {
    message: string;
    insight?: string;
    tone: string;
}

// Gemini 클라이언트 초기화 (서버 사이드에서만)
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
    return new GoogleGenerativeAI(apiKey);
}

// AI 메시지 생성
export async function generatePersonalizedMessage(
    params: MessageGenerationParams
): Promise<GeneratedMessage> {
    const {
        recipientName,
        occasionId,
        strengthId,
        archetypeId,
        situation,
        persona = 'warm',
        coachName = '코치'
    } = params;

    const occasion = getOccasionById(occasionId);
    const strength = strengthId ? getStrengthById(strengthId) : null;
    const archetype = archetypeId ? getArchetypeById(archetypeId) : null;

    // 심리적 기제 찾기
    const domain = strength?.domain || 'executing';
    const mechanism = psychologicalMechanisms[occasionId]?.[domain] || '강점 활용과 성장';

    // 프롬프트 구성
    const systemPrompt = personas[persona].systemPrompt;

    const userPrompt = `
다음 정보를 바탕으로 클라이언트에게 보낼 개인화된 메시지를 작성해주세요.

## 클라이언트 정보
- 이름: ${recipientName}
- 상황: ${occasion?.name.ko || occasionId}
- 대표 강점: ${strength?.name.ko || archetype?.name.ko || '(없음)'}
${strength ? `- 강점 도메인: ${getDomainName(strength.domain)}` : ''}
${archetype ? `- 원형 특성: ${archetype.message.ko}` : ''}
${situation ? `- 현재 상황 설명: ${situation}` : ''}

## 심리적 기제
${mechanism}

## 작성 가이드라인
1. ${recipientName}님의 강점을 구체적으로 언급하며 시작
2. 상황(${occasion?.name.ko})에 맞는 맥락을 반영
3. 심리적 기제를 활용해 공감대 형성
4. 구체적인 격려나 조언으로 마무리
5. 100-150자 내외로 간결하게 작성
6. 코치(${coachName})의 진심이 느껴지도록

## 출력 형식
메시지만 작성해주세요. 추가 설명이나 인용부호 없이 바로 메시지 내용만 출력합니다.
`;

    try {
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text().trim();

        return {
            message: text,
            insight: mechanism,
            tone: personas[persona].name
        };
    } catch (error) {
        console.error('Gemini API 오류:', error);

        // 폴백 메시지
        return {
            message: `${recipientName}님, ${occasion?.defaultGreeting.ko || '특별한 날'}을 맞이하여 진심으로 축하드립니다. 늘 빛나는 모습으로 주변을 밝혀주셔서 감사합니다. 오늘도 행복한 하루 보내세요!`,
            insight: mechanism,
            tone: personas[persona].name
        };
    }
}

// 도메인 한글 이름
function getDomainName(domain: string): string {
    const names: Record<string, string> = {
        'executing': '실행력',
        'influencing': '영향력',
        'relationship': '관계 구축',
        'strategic': '전략적 사고'
    };
    return names[domain] || domain;
}

// 여러 메시지 아이디어 생성 (선택 옵션 제공)
export async function generateMessageOptions(
    params: MessageGenerationParams,
    count: number = 3
): Promise<GeneratedMessage[]> {
    const options: GeneratedMessage[] = [];
    const personaTypes: CoachPersona[] = ['warm', 'strict', 'logical'];

    for (let i = 0; i < Math.min(count, 3); i++) {
        const persona = personaTypes[i];
        const result = await generatePersonalizedMessage({
            ...params,
            persona
        });
        options.push(result);
    }

    return options;
}
