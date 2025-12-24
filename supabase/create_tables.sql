-- StrengthsNavigator Supabase Tables
-- Run this in your Supabase SQL Editor

-- 1. Clients 테이블 (고객 정보)
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    -- 5가지 강점 저장
    strength_1 TEXT,
    strength_2 TEXT,
    strength_3 TEXT,
    strength_4 TEXT,
    strength_5 TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이름 기반 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- 2. Sent Cards 테이블 (보낸 카드 기록)
CREATE TABLE IF NOT EXISTS sent_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,  -- 고객 이름 (비연결 조회용)
    -- 카드 내용
    season TEXT,                -- spring, summer, autumn, winter
    situation TEXT,             -- new_year, christmas, birthday, etc.
    strength TEXT,              -- 선택한 강점
    situation_text TEXT,        -- 상황 설명
    coach_message TEXT,         -- 코치 메시지
    -- 메타데이터
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 최근 발송 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_sent_cards_sent_at ON sent_cards(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_cards_client_id ON sent_cards(client_id);

-- 3. 마지막 카드 발송일 조회 뷰 (3개월 경과 알림용)
CREATE OR REPLACE VIEW client_last_contact AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.strength_1,
    c.strength_2,
    c.strength_3,
    c.strength_4,
    c.strength_5,
    c.memo,
    MAX(sc.sent_at) as last_card_sent,
    CASE 
        WHEN MAX(sc.sent_at) IS NULL THEN true
        WHEN MAX(sc.sent_at) < NOW() - INTERVAL '3 months' THEN true
        ELSE false
    END as needs_followup,
    CASE 
        WHEN MAX(sc.sent_at) IS NULL THEN NULL
        ELSE DATE_PART('day', NOW() - MAX(sc.sent_at))
    END as days_since_last_card
FROM clients c
LEFT JOIN sent_cards sc ON c.id = sc.client_id
GROUP BY c.id, c.name, c.email, c.phone, 
         c.strength_1, c.strength_2, c.strength_3, c.strength_4, c.strength_5, c.memo;

-- 4. Updated at 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 5. RLS (Row Level Security) - 필요시 활성화
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sent_cards ENABLE ROW LEVEL SECURITY;

-- 샘플 데이터 (테스트용)
INSERT INTO clients (name, strength_1, strength_2, strength_3, strength_4, strength_5, memo) VALUES
('김서영', 'achiever', 'learner', 'focus', 'responsibility', 'strategic', '열정적인 리더십 코칭 클라이언트'),
('이준호', 'communication', 'woo', 'positivity', 'empathy', 'developer', '팀 커뮤니케이션 향상 목표'),
('박민지', 'analytical', 'deliberative', 'input', 'intellection', 'context', '데이터 기반 의사결정 강화')
ON CONFLICT DO NOTHING;

-- 6. Card Replies 테이블 (수신자 답장)
CREATE TABLE IF NOT EXISTS card_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES sent_cards(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,       -- 답장한 사람 이름
    message TEXT NOT NULL,              -- 답장 내용
    is_read BOOLEAN DEFAULT false,      -- 코치가 읽었는지
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 답장 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_card_replies_created_at ON card_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_replies_is_read ON card_replies(is_read);
