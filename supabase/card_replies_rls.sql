-- card_replies 테이블 RLS 정책 설정
-- Supabase SQL Editor에서 실행하세요

-- 1. RLS 활성화 상태 확인 후 필요시 비활성화 (테스트용)
-- ALTER TABLE card_replies DISABLE ROW LEVEL SECURITY;

-- 2. 또는 RLS 정책 추가 (권장)
-- 모든 사용자가 답장을 삭제할 수 있도록 허용
CREATE POLICY "Allow delete for authenticated users" ON card_replies
    FOR DELETE
    TO authenticated
    USING (true);

-- 모든 사용자가 답장을 조회할 수 있도록 허용
CREATE POLICY "Allow select for authenticated users" ON card_replies
    FOR SELECT
    TO authenticated
    USING (true);

-- 익명 사용자도 답장을 추가할 수 있도록 허용 (카드 받는 사람이 답장 보낼 때)
CREATE POLICY "Allow insert for all" ON card_replies
    FOR INSERT
    WITH CHECK (true);
