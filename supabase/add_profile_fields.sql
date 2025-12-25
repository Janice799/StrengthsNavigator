-- coach_profiles 테이블에 프로필 필드 추가

ALTER TABLE coach_profiles 
ADD COLUMN IF NOT EXISTS brand_name TEXT DEFAULT 'Selli Club',
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT '성공하는 나를 경험하는 새로운 방식',
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Gallup Certified Strengths Coach',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '강점 코칭을 통해 개인과 팀이 본연의 재능을 발견하고 성장할 수 있도록 돕습니다.',
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'info@lifeliteracy.me';

-- 코멘트 추가
COMMENT ON COLUMN coach_profiles.brand_name IS '상호명/브랜드명';
COMMENT ON COLUMN coach_profiles.tagline IS '대표 문구';
COMMENT ON COLUMN coach_profiles.title IS '직함/자격증';
COMMENT ON COLUMN coach_profiles.description IS '소개글';
COMMENT ON COLUMN coach_profiles.website IS '홈페이지 URL';
COMMENT ON COLUMN coach_profiles.instagram IS '인스타그램 URL';
COMMENT ON COLUMN coach_profiles.contact_email IS '공개 이메일';
