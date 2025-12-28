-- Coach Profile 다국어 필드 추가
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 영어 필드 추가
ALTER TABLE coach_profiles
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS tagline_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- 확인
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'coach_profiles' 
AND column_name LIKE '%_en';
