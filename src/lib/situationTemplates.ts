// 상황별 템플릿 데이터
// 상황(Occasion)에 따른 일반적인 클라이언트 상황 예시

export interface SituationTemplate {
    id: string;
    text: string;
    occasionId?: string; // 특정 상황에만 표시
}

// 상황별 템플릿
export const situationTemplates: Record<string, SituationTemplate[]> = {
    'new-year': [
        { id: 'ny-1', text: '올해 커리어 전환을 고민 중' },
        { id: 'ny-2', text: '새로운 팀에 적응하느라 힘들어함' },
        { id: 'ny-3', text: '리더십 역할을 처음 맡게 됨' },
        { id: 'ny-4', text: '번아웃을 겪은 후 회복 중' },
        { id: 'ny-5', text: '새로운 목표를 설정하고 싶어함' },
    ],
    'christmas': [
        { id: 'xm-1', text: '연말 업무로 지쳐있음' },
        { id: 'xm-2', text: '가족과의 시간이 부족해 고민' },
        { id: 'xm-3', text: '한 해를 마무리하며 성찰이 필요함' },
        { id: 'xm-4', text: '올해 이룬 성과를 인정받고 싶어함' },
    ],
    'birthday': [
        { id: 'bd-1', text: '커리어의 중요한 전환점에 있음' },
        { id: 'bd-2', text: '새로운 도전을 앞두고 있음' },
        { id: 'bd-3', text: '지난 1년간의 성장을 돌아보고 싶어함' },
        { id: 'bd-4', text: '앞으로의 방향성을 고민 중' },
    ],
    'encouragement': [
        { id: 'ec-1', text: '최근 프로젝트 실패로 자신감 저하' },
        { id: 'ec-2', text: '팀 내 갈등으로 스트레스 받음' },
        { id: 'ec-3', text: '승진 누락으로 좌절감을 느낌' },
        { id: 'ec-4', text: '워라밸 유지에 어려움을 겪음' },
        { id: 'ec-5', text: '새 역할에 대한 불안감' },
    ],
    'thanks': [
        { id: 'th-1', text: '코칭 세션에서 큰 인사이트를 얻음' },
        { id: 'th-2', text: '목표 달성에 성공함' },
        { id: 'th-3', text: '팀을 성공적으로 이끌어냄' },
        { id: 'th-4', text: '어려운 상황을 잘 극복해냄' },
    ],
    'summer-vacation': [
        { id: 'sv-1', text: '휴식의 필요성을 느끼지 못함' },
        { id: 'sv-2', text: '업무에서 완전히 벗어나기 어려워함' },
        { id: 'sv-3', text: '재충전 후 새로운 시작을 원함' },
        { id: 'sv-4', text: '가족/연인과의 시간이 필요함' },
    ],
    'default': [
        { id: 'df-1', text: '최근 팀장으로 승진함' },
        { id: 'df-2', text: '새 프로젝트를 시작함' },
        { id: 'df-3', text: '팀 빌딩에 관심이 많음' },
        { id: 'df-4', text: '성장 기회를 찾고 있음' },
        { id: 'df-5', text: '커뮤니케이션 스킬 향상이 필요함' },
    ]
};

// 상황에 맞는 템플릿 가져오기
export function getTemplatesForOccasion(occasionId?: string): SituationTemplate[] {
    if (occasionId && situationTemplates[occasionId]) {
        return situationTemplates[occasionId];
    }
    return situationTemplates['default'];
}

// 강점 기반 상황 제안
export const strengthBasedSituations: Record<string, string[]> = {
    // 실행력 도메인
    'achiever': ['목표 달성 압박감으로 지쳐있음', '일-삶 균형 유지가 어려움', '끊임없이 성과를 내야 한다는 부담감'],
    'arranger': ['복잡한 프로젝트 관리로 스트레스', '팀원 간 업무 조율이 어려움'],
    'belief': ['조직의 가치관과 불일치 느낌', '진정한 의미 있는 일을 찾고 싶음'],
    'consistency': ['불공정한 상황에 대한 분노', '변화가 많은 환경에 적응이 어려움'],
    'deliberative': ['빠른 의사결정을 요구받아 부담됨', '리스크 관리에 대한 걱정'],
    'discipline': ['예측 불가능한 상황에 대한 불안', '체계적인 환경을 만들고 싶음'],
    'focus': ['멀티태스킹 요구로 집중하기 어려움', '우선순위 정립이 필요함'],
    'responsibility': ['과도한 책임감으로 지쳐있음', '위임하기 어려워함'],
    'restorative': ['문제 해결에만 집중하느라 지침', '예방보다 사후 처리에 급급함'],

    // 영향력 도메인
    'activator': ['아이디어 실행이 막혀있음', '조직의 느린 의사결정에 답답함'],
    'command': ['권한 없이 책임만 있음', '팀을 이끌어야 하지만 저항에 직면'],
    'communication': ['자신의 아이디어를 전달하기 어려움', '발표나 프레젠테이션에 대한 불안'],
    'competition': ['경쟁자와의 비교로 스트레스', '승리하지 못했을 때의 좌절감'],
    'maximizer': ['완벽주의로 인한 번아웃', '평범함에 대한 불만족'],
    'significance': ['자신의 기여가 인정받지 못함', '더 큰 영향력을 갖고 싶음'],
    'self-assurance': ['실패 후 자신감 회복이 필요함', '새로운 도전에 대한 확신이 필요함'],
    'woo': ['깊은 관계 형성이 어려움', '에너지 소모로 지쳐있음'],

    // 관계구축 도메인
    'adaptability': ['장기 계획 수립이 어려움', '예측 가능한 환경에서 답답함'],
    'connectedness': ['팀 내 갈등이 힘듦', '더 큰 의미를 찾고 싶음'],
    'developer': ['성장하지 않는 팀원에 대한 실망', '코칭/멘토링 기회가 부족함'],
    'empathy': ['타인의 감정에 영향받아 지침', '감정적 거리두기가 어려움'],
    'harmony': ['갈등 상황을 피하고 싶음', '자신의 의견을 말하기 어려움'],
    'includer': ['소외된 사람을 보면 마음이 아픔', '모든 사람을 만족시키려 함'],
    'individualization': ['팀 표준화 요구와 충돌', '각 개인의 특성을 살리고 싶음'],
    'positivity': ['부정적인 팀 분위기에 지침', '에너지를 유지하기 어려움'],
    'relator': ['새로운 관계 형성보다 기존 관계에 집중', '신뢰 구축에 시간이 필요함'],

    // 전략적 사고 도메인
    'analytical': ['데이터 없이 결정해야 할 때 불안', '감정적 상황 대처가 어려움'],
    'context': ['역사/배경 없이 결정하기 어려움', '변화의 이유를 알고 싶음'],
    'futuristic': ['현재에 집중하기 어려움', '비전 실현이 막혀있음'],
    'ideation': ['아이디어 실현 기회가 부족함', '창의성을 발휘할 수 없는 환경'],
    'input': ['정보 과부하로 결정이 어려움', '수집한 것을 활용하지 못함'],
    'intellection': ['혼자 생각할 시간이 부족함', '깊이 있는 대화 상대가 없음'],
    'learner': ['성장 기회가 부족함', '새로운 것을 배울 시간이 없음'],
    'strategic': ['여러 시나리오로 인한 결정 지연', '최선의 길을 찾기 어려움'],
};

// 강점에 맞는 상황 제안 가져오기
export function getSituationsForStrength(strengthId: string): string[] {
    return strengthBasedSituations[strengthId] || [];
}
