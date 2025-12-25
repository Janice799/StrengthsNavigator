-- coach_profiles 테이블에 nickname 필드 추가
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 코멘트 추가
COMMENT ON COLUMN coach_profiles.nickname IS '카드에 표시될 닉네임 (기본값: name)';
