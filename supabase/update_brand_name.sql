-- 기본값 업데이트
UPDATE coach_profiles 
SET brand_name = 'StrengthsNavigator'
WHERE brand_name = 'Selli Club' OR brand_name IS NULL;

-- 기본값 변경
ALTER TABLE coach_profiles 
ALTER COLUMN brand_name SET DEFAULT 'StrengthsNavigator';
