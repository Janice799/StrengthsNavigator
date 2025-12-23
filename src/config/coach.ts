// 코치 프로필 설정
// 나중에 실제 코치 정보로 업데이트하세요

export interface CoachProfile {
    name: string;
    title: string;
    photo: string;
    introduction: string;
    contact: {
        email?: string;
        phone?: string;
        instagram?: string;
        kakao?: string;
        linkedin?: string;
    };
    brandColors: {
        primary: string;
        accent: string;
    };
}

export const coachProfile: CoachProfile = {
    name: "강점 코치",
    title: "갤럽 인증 강점 코치",
    photo: "/coach-photo.jpg",
    introduction: "당신의 강점을 발견하고 성장을 돕습니다. 함께 빛나는 여정을 시작하세요.",
    contact: {
        email: "coach@example.com",
        phone: "010-0000-0000",
        instagram: "@strength_coach",
        kakao: "https://open.kakao.com/",
    },
    brandColors: {
        primary: "#1e3a5f",    // Deep Ocean Blue
        accent: "#d4af37"      // Gold
    }
};
