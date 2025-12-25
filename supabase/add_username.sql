-- Username 필드 추가
ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Username 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_profiles_username ON coach_profiles(username);

-- 트리거 업데이트 (username 추가)
CREATE OR REPLACE FUNCTION public.handle_new_coach()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.coach_profiles (id, email, name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New Coach'),
        COALESCE(NEW.raw_user_meta_data->>'username', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
