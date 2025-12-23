// 카드 데이터 URL 인코딩/디코딩
// 서버 없이 URL로 카드 데이터 공유

export interface CoachInfo {
    name: string;
    title: string;
    introduction?: string;
    contact?: {
        email?: string;
        instagram?: string;
        kakao?: string;
    };
}

export interface CardData {
    recipientName: string;
    senderName: string;
    occasionId: string;
    archetypeId?: string;
    strengthId?: string;
    situation: string;
    personalMessage: string;
    lang: 'ko' | 'en';
    createdAt: string;
    // 코치 정보
    coach?: CoachInfo;
}

// 카드 데이터를 URL 안전한 문자열로 인코딩
export function encodeCardData(data: CardData): string {
    try {
        const jsonString = JSON.stringify(data);
        // Base64로 인코딩 후 URL 안전하게 변환
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        // URL 안전 문자로 변환 (+, /, = 를 대체)
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (e) {
        console.error('카드 데이터 인코딩 실패:', e);
        return '';
    }
}

// URL 문자열을 카드 데이터로 디코딩
export function decodeCardData(encoded: string): CardData | null {
    try {
        // URL 안전 문자를 원래대로 복원
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // 패딩 복원
        while (base64.length % 4) {
            base64 += '=';
        }
        const jsonString = decodeURIComponent(escape(atob(base64)));
        return JSON.parse(jsonString) as CardData;
    } catch (e) {
        console.error('카드 데이터 디코딩 실패:', e);
        return null;
    }
}

// 카드 공유 URL 생성
export function generateCardUrl(data: CardData, baseUrl: string = ''): string {
    const encoded = encodeCardData(data);
    return `${baseUrl}/card?data=${encoded}`;
}

// URL에서 카드 데이터 추출
export function getCardDataFromUrl(url: string): CardData | null {
    try {
        const urlObj = new URL(url, window.location.origin);
        const encoded = urlObj.searchParams.get('data');
        if (!encoded) return null;
        return decodeCardData(encoded);
    } catch (e) {
        return null;
    }
}

// 카드 데이터 유효성 검증
export function validateCardData(data: Partial<CardData>): string[] {
    const errors: string[] = [];

    if (!data.recipientName?.trim()) {
        errors.push('수신자 이름을 입력해주세요.');
    }
    if (!data.occasionId) {
        errors.push('상황을 선택해주세요.');
    }
    if (data.personalMessage && data.personalMessage.length > 500) {
        errors.push('개인 메시지는 500자 이하로 작성해주세요.');
    }

    return errors;
}

// URL 길이 체크 (브라우저 제한: 약 2048자)
export function isCardUrlValid(data: CardData): boolean {
    const url = generateCardUrl(data);
    return url.length <= 2000;
}
