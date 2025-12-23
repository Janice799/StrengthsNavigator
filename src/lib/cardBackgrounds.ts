// 카드 배경 이미지 시스템
// 각 배경에 맞는 텍스트 스타일 정보 포함

export type BackgroundStyle = 'cinematic' | 'photo' | '3d' | 'anime' | 'default';

export interface CardBackground {
    id: string;
    occasionId: string;
    style: BackgroundStyle;
    name: {
        ko: string;
        en: string;
    };
    imagePath: string;
    // 텍스트 스타일링
    textStyle: {
        primaryColor: string;      // 제목/이름 색상
        secondaryColor: string;    // 본문 색상
        accentColor: string;       // 강조 색상 (강점 이름 등)
        fontFamily: string;        // 추천 폰트
        textShadow: string;        // 그림자 효과
        overlayGradient?: string;  // 텍스트 가독성을 위한 오버레이
    };
    preview: string;  // 썸네일 (같은 이미지)
}

export const cardBackgrounds: CardBackground[] = [
    // ===== 새해 (New Year) =====
    {
        id: 'newyear-cinematic',
        occasionId: 'new-year',
        style: 'cinematic',
        name: { ko: '새해 시네마틱', en: 'New Year Cinematic' },
        imagePath: '/backgrounds/newyear-cinematic.png',
        textStyle: {
            primaryColor: '#FFD700',          // 골드
            secondaryColor: '#FFFFFF',        // 화이트
            accentColor: '#FFA500',           // 오렌지 골드
            fontFamily: "'Noto Serif KR', serif",
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            overlayGradient: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)'
        },
        preview: '/backgrounds/newyear-cinematic.png'
    },
    {
        id: 'newyear-3d',
        occasionId: 'new-year',
        style: '3d',
        name: { ko: '새해 3D', en: 'New Year 3D' },
        imagePath: '/backgrounds/newyear-3d.png',
        textStyle: {
            primaryColor: '#FFFFFF',
            secondaryColor: '#E0E0E0',
            accentColor: '#FFD700',
            fontFamily: "'Pretendard', sans-serif",
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
        },
        preview: '/backgrounds/newyear-3d.png'
    },
    {
        id: 'newyear-photo',
        occasionId: 'new-year',
        style: 'photo',
        name: { ko: '새해 포토', en: 'New Year Photo' },
        imagePath: '/backgrounds/newyear-photo.png',
        textStyle: {
            primaryColor: '#FFE4B5',          // 모카신
            secondaryColor: '#FFFFFF',
            accentColor: '#DAA520',           // 골든로드
            fontFamily: "'Nanum Myeongjo', serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            overlayGradient: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%)'
        },
        preview: '/backgrounds/newyear-photo.png'
    },
    {
        id: 'newyear-anime',
        occasionId: 'new-year',
        style: 'anime',
        name: { ko: '새해 애니메이션', en: 'New Year Anime' },
        imagePath: '/backgrounds/newyear-anime.png',
        textStyle: {
            primaryColor: '#FFFACD',          // 레몬쉬폰
            secondaryColor: '#FFFFFF',
            accentColor: '#FFB6C1',           // 라이트핑크
            fontFamily: "'Jua', sans-serif",
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
        },
        preview: '/backgrounds/newyear-anime.png'
    },

    // ===== 크리스마스 (Christmas) =====
    {
        id: 'christmas-cinematic',
        occasionId: 'christmas',
        style: 'cinematic',
        name: { ko: '크리스마스 시네마틱', en: 'Christmas Cinematic' },
        imagePath: '/backgrounds/christmas-cinematic.png',
        textStyle: {
            primaryColor: '#FFD700',
            secondaryColor: '#FFFFFF',
            accentColor: '#FF6B6B',           // 레드
            fontFamily: "'Noto Serif KR', serif",
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            overlayGradient: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)'
        },
        preview: '/backgrounds/christmas-cinematic.png'
    },
    {
        id: 'christmas-3d',
        occasionId: 'christmas',
        style: '3d',
        name: { ko: '크리스마스 3D', en: 'Christmas 3D' },
        imagePath: '/backgrounds/christmas-3d.png',
        textStyle: {
            primaryColor: '#FFFFFF',
            secondaryColor: '#E8E8E8',
            accentColor: '#50C878',           // 에메랄드
            fontFamily: "'Pretendard', sans-serif",
            textShadow: '0 3px 15px rgba(0,0,0,0.6)',
        },
        preview: '/backgrounds/christmas-3d.png'
    },
    {
        id: 'christmas-photo',
        occasionId: 'christmas',
        style: 'photo',
        name: { ko: '크리스마스 포토', en: 'Christmas Photo' },
        imagePath: '/backgrounds/christmas-photo.png',
        textStyle: {
            primaryColor: '#FFFAF0',          // 플로럴화이트
            secondaryColor: '#FFFFFF',
            accentColor: '#DC143C',           // 크림슨
            fontFamily: "'Nanum Myeongjo', serif",
            textShadow: '0 2px 10px rgba(0,0,0,0.7)',
            overlayGradient: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)'
        },
        preview: '/backgrounds/christmas-photo.png'
    },

    // ===== 기본 (Default - 기존 CSS 배경 유지) =====
    {
        id: 'default-elegant',
        occasionId: 'any',
        style: 'default',
        name: { ko: '기본 우아함', en: 'Default Elegant' },
        imagePath: '',  // CSS 그라데이션 사용
        textStyle: {
            primaryColor: '#D4AF37',
            secondaryColor: '#FFFFFF',
            accentColor: '#FFD700',
            fontFamily: "'Noto Serif KR', serif",
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        },
        preview: ''
    }
];

// 상황별 배경 가져오기
export function getBackgroundsByOccasion(occasionId: string): CardBackground[] {
    return cardBackgrounds.filter(bg =>
        bg.occasionId === occasionId || bg.occasionId === 'any'
    );
}

// 스타일별 배경 가져오기
export function getBackgroundsByStyle(style: BackgroundStyle): CardBackground[] {
    return cardBackgrounds.filter(bg => bg.style === style);
}

// ID로 배경 가져오기
export function getBackgroundById(id: string): CardBackground | undefined {
    return cardBackgrounds.find(bg => bg.id === id);
}

// 모든 스타일 목록
export const backgroundStyles: { id: BackgroundStyle; name: { ko: string; en: string }; icon: string }[] = [
    { id: 'default', name: { ko: '기본', en: 'Default' }, icon: '✨' },
    { id: 'cinematic', name: { ko: '시네마틱', en: 'Cinematic' }, icon: '🎬' },
    { id: 'photo', name: { ko: '포토', en: 'Photo' }, icon: '📷' },
    { id: '3d', name: { ko: '3D', en: '3D' }, icon: '💎' },
    { id: 'anime', name: { ko: '애니메이션', en: 'Animation' }, icon: '🎨' },
];
