-- 코치 설정 테이블
-- 비밀번호를 Supabase에 저장하여 코치가 대시보드에서 직접 변경 가능

CREATE TABLE IF NOT EXISTS coach_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    password_hash TEXT NOT NULL,
    email TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 비밀번호 설정 (bcrypt 해시 권장하지만 간단하게 시작)
-- 기본 비밀번호: 1234
INSERT INTO coach_settings (password_hash, email)
VALUES ('1234', 'info@lifeliteracy.me')
ON CONFLICT DO NOTHING;

-- 코치 설정은 하나만 존재해야 하므로 체크
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_coach ON coach_settings ((id IS NOT NULL));
