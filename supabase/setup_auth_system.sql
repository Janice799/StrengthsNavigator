-- ==========================================
-- 1단계: 기존 테이블 정리 (완전 새로 시작)
-- ==========================================

DROP TABLE IF EXISTS coach_settings CASCADE;
DROP VIEW IF EXISTS client_last_contact CASCADE;
DROP TABLE IF EXISTS card_replies CASCADE;
DROP TABLE IF EXISTS sent_cards CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS coach_profiles CASCADE;

-- ==========================================
-- 2단계: 코치 프로필 테이블 생성 (Supabase Auth 연동)
-- ==========================================

CREATE TABLE coach_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- 코치는 자신의 프로필만 조회/수정 가능
CREATE POLICY "코치는 자신의 프로필 조회" ON coach_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "코치는 자신의 프로필 수정" ON coach_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 회원가입 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_coach()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.coach_profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New Coach')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_coach();


-- ==========================================
-- 3단계: 고객 테이블 (coach_id 포함)
-- ==========================================

CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    strength_1 TEXT,
    strength_2 TEXT,
    strength_3 TEXT,
    strength_4 TEXT,
    strength_5 TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_coach_id ON clients(coach_id);
CREATE INDEX idx_clients_name ON clients(name);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "코치는 자신의 고객만 조회" ON clients
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "코치는 자신의 고객만 추가" ON clients
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "코치는 자신의 고객만 수정" ON clients
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "코치는 자신의 고객만 삭제" ON clients
    FOR DELETE USING (auth.uid() = coach_id);


-- ==========================================
-- 4단계: 발송 카드 테이블 (coach_id 포함)
-- ==========================================

CREATE TABLE sent_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    season TEXT,
    situation TEXT,
    strength TEXT,
    situation_text TEXT,
    coach_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sent_cards_coach_id ON sent_cards(coach_id);
CREATE INDEX idx_sent_cards_client_id ON sent_cards(client_id);
CREATE INDEX idx_sent_cards_sent_at ON sent_cards(sent_at DESC);

ALTER TABLE sent_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "코치는 자신의 카드만 조회" ON sent_cards
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "코치는 자신의 카드만 추가" ON sent_cards
    FOR INSERT WITH CHECK (auth.uid() = coach_id);


-- ==========================================
-- 5단계: 답장 테이블 (coach_id 포함)
-- ==========================================

CREATE TABLE card_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    card_id TEXT,
    recipient_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_card_replies_coach_id ON card_replies(coach_id);
CREATE INDEX idx_card_replies_created_at ON card_replies(created_at DESC);
CREATE INDEX idx_card_replies_is_read ON card_replies(is_read);

ALTER TABLE card_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "코치는 자신의 답장만 조회" ON card_replies
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "답장은 누구나 추가 가능" ON card_replies
    FOR INSERT WITH CHECK (true);


-- ==========================================
-- 6단계: 뷰 생성
-- ==========================================

CREATE OR REPLACE VIEW client_last_contact AS
SELECT 
    c.id,
    c.coach_id,
    c.name,
    c.email,
    c.phone,
    c.strength_1,
    c.strength_2,
    c.strength_3,
    MAX(sc.sent_at) as last_card_sent,
    CASE 
        WHEN MAX(sc.sent_at) IS NULL THEN true
        WHEN MAX(sc.sent_at) < NOW() - INTERVAL '90 days' THEN true
        ELSE false
    END as needs_followup,
    CASE 
        WHEN MAX(sc.sent_at) IS NULL THEN NULL
        ELSE EXTRACT(DAY FROM (NOW() - MAX(sc.sent_at)))
    END as days_since_last_card
FROM clients c
LEFT JOIN sent_cards sc ON c.id = sc.client_id AND c.coach_id = sc.coach_id
GROUP BY c.id, c.coach_id, c.name, c.email, c.phone, c.strength_1, c.strength_2, c.strength_3;


-- ==========================================
-- 완료! ✅
-- ==========================================
-- 다음 단계:
-- 1. Supabase Dashboard > Authentication > Providers에서 Email 활성화
-- 2. Email Templates 설정 (선택사항)
-- 3. Storage > Create bucket: 'coach-profiles' (public)
-- 4. 코드 업데이트 시작
