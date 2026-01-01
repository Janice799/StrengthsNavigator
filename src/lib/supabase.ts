import { createClient as createBrowserClient } from './supabase-browser';
import { SupabaseClient } from '@supabase/supabase-js';

// SSR 기반 Supabase 클라이언트 (쿠키 기반 세션 유지 - auth.ts와 동일)
let supabase: SupabaseClient | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabase = createBrowserClient();
} else {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. 로컬 모드로 실행됩니다.');
}

export { supabase };

// 타입 정의
export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    strength_1?: string;
    strength_2?: string;
    strength_3?: string;
    strength_4?: string;
    strength_5?: string;
    memo?: string;
    created_at: string;
    updated_at: string;
}

export interface SentCard {
    id: string;
    coach_id?: string;
    client_id?: string;
    client_name: string;
    season?: string;
    situation?: string;
    strength?: string;
    strength_1?: string;
    strength_2?: string;
    strength_3?: string;
    strength_4?: string;
    strength_5?: string;
    situation_text?: string;
    coach_message?: string;
    sent_at: string;
    created_at: string;
}

export interface ClientLastContact extends Client {
    last_card_sent?: string;
    needs_followup: boolean;
    days_since_last_card?: number;
}

// 클라이언트 관련 함수
export async function searchClients(query: string): Promise<Client[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

    if (error) {
        console.error('클라이언트 검색 오류:', error);
        return [];
    }
    return data || [];
}

export async function getClientByName(name: string): Promise<Client | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('name', name)
        .single();

    if (error) {
        return null;
    }
    return data;
}

export async function createClient2(client: Partial<Client>): Promise<Client | null> {
    if (!supabase) return null;

    try {
        // 현재 로그인한 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('사용자 인증 오류:', userError?.message || '로그인 필요');
            alert('로그인이 필요합니다.');
            return null;
        }

        const clientData = {
            ...client,
            coach_id: user.id,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) {
            console.error('클라이언트 생성 오류:', error);
            alert(`고객 저장 실패: ${error.message}`);
            return null;
        }

        console.log('✅ 고객 저장 성공:', data.id);
        return data;
    } catch (error) {
        console.error('고객 생성 중 예외 발생:', error);
        alert('고객 저장 중 오류가 발생했습니다.');
        return null;
    }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('클라이언트 업데이트 오류:', error);
        return null;
    }
    return data;
}

// 전체 고객 목록 조회
export async function getAllClients(): Promise<Client[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('고객 목록 조회 오류:', error);
        return [];
    }
    return data || [];
}

// 고객 삭제
export async function deleteClient(id: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        // 현재 로그인한 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('사용자 인증 오류:', userError?.message || '로그인 필요');
            return false;
        }

        // 본인의 고객만 삭제 가능하도록 coach_id 조건 추가
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
            .eq('coach_id', user.id);

        if (error) {
            console.error('클라이언트 삭제 오류:', error);
            return false;
        }

        console.log('✅ 고객 삭제 성공:', id);
        return true;
    } catch (error) {
        console.error('고객 삭제 중 예외 발생:', error);
        return false;
    }
}

// 공용 코치 프로필 조회 (카드용)
export async function getPublicCoachProfile() {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('coach_profiles')
        .select('name, nickname, brand_name, title, tagline, profile_image_url, description, title_en, tagline_en, description_en')
        .limit(1)
        .single();

    if (error) {
        console.error('프로필 조회 오류:', error);
        return null;
    }

    return data;
}


// 카드 발송 관련 함수
export async function saveSentCard(card: Partial<SentCard>): Promise<SentCard | null> {
    if (!supabase) {
        console.log('📝 로컬 모드: 카드 저장 시뮬레이션', card);
        return { id: 'local-' + Date.now(), ...card } as SentCard;
    }

    // 현재 로그인한 사용자 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error('❌ 사용자 조회 에러:', userError.message);
        return null;
    }

    if (!user) {
        console.error('❌ 로그인 필요: 사용자 없음');
        return null;
    }

    console.log('✅ 사용자 확인됨:', user.id, user.email);

    const now = new Date().toISOString();
    const insertData = {
        ...card,
        coach_id: user.id,
        sent_at: now,
        created_at: now
    };

    console.log('📤 저장할 데이터:', JSON.stringify(insertData, null, 2));

    // coach_id, sent_at, created_at 추가하여 저장
    const { data, error } = await supabase
        .from('sent_cards')
        .insert([insertData])
        .select()
        .single();

    if (error) {
        console.error('❌ 카드 저장 실패:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
        });
        return null;
    }

    console.log('✅ 카드 저장 성공:', data.id);
    return data;
}

export async function getRecentCards(limit: number = 20): Promise<SentCard[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('sent_cards')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('최근 카드 조회 오류:', error);
        return [];
    }
    return data || [];
}

export async function getCardsByClient(clientId: string): Promise<SentCard[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('sent_cards')
        .select('*')
        .eq('client_id', clientId)
        .order('sent_at', { ascending: false });

    if (error) {
        console.error('클라이언트 카드 조회 오류:', error);
        return [];
    }
    return data || [];
}

export async function getCardById(id: string): Promise<SentCard | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sent_cards')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('카드 조회 오류:', error);
        return null;
    }
    return data;
}

// 발송한 카드 삭제
export async function deleteSentCard(cardId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        // 현재 로그인한 사용자 가져오기
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('사용자 인증 오류:', userError?.message || '로그인 필요');
            return false;
        }

        // 본인의 카드만 삭제 가능하도록 coach_id 조건 추가
        const { error } = await supabase
            .from('sent_cards')
            .delete()
            .eq('id', cardId)
            .eq('coach_id', user.id);

        if (error) {
            console.error('카드 삭제 오류:', error);
            return false;
        }

        console.log('✅ 카드 삭제 성공:', cardId);
        return true;
    } catch (error) {
        console.error('카드 삭제 중 예외 발생:', error);
        return false;
    }
}

// 팔로업 필요 고객 조회
export async function getClientsNeedingFollowup(): Promise<ClientLastContact[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('client_last_contact')
        .select('*')
        .eq('needs_followup', true)
        .order('last_card_sent', { ascending: true, nullsFirst: true });

    if (error) {
        console.error('팔로업 조회 오류:', error);
        return [];
    }
    return data || [];
}


// 대시보드 통계
export async function getDashboardStats() {
    if (!supabase) {
        return {
            totalClients: 0,
            totalCardsSent: 0,
            clientsNeedingFollowup: 0
        };
    }

    const [clientsResult, cardsResult, followupResult] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('sent_cards').select('id', { count: 'exact' }),
        supabase.from('client_last_contact').select('id', { count: 'exact' }).eq('needs_followup', true)
    ]);

    return {
        totalClients: clientsResult.count || 0,
        totalCardsSent: cardsResult.count || 0,
        clientsNeedingFollowup: followupResult.count || 0
    };
}

// 답장 관련 타입 및 함수
export interface CardReply {
    id: string;
    card_id?: string;
    recipient_name: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

// 답장 저장
export async function saveCardReply(reply: Partial<CardReply>): Promise<CardReply | null> {
    if (!supabase) {
        console.log('📝 로컬 모드: 답장 저장 시뮬레이션', reply);
        return { id: 'local-' + Date.now(), ...reply, is_read: false, created_at: new Date().toISOString() } as CardReply;
    }

    const { data, error } = await supabase
        .from('card_replies')
        .insert([reply])
        .select()
        .single();

    if (error) {
        console.error('답장 저장 오류:', error);
        return null;
    }
    return data;
}

// 읽지 않은 답장 조회
export async function getUnreadReplies(): Promise<CardReply[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('card_replies')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('읽지 않은 답장 조회 오류:', error);
        return [];
    }
    return data || [];
}

// 모든 답장 조회
export async function getAllReplies(limit: number = 50): Promise<CardReply[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('card_replies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('답장 조회 오류:', error);
        return [];
    }
    return data || [];
}

// 답장 읽음 처리
export async function markReplyAsRead(replyId: string): Promise<boolean> {
    if (!supabase) return true;

    const { error } = await supabase
        .from('card_replies')
        .update({ is_read: true })
        .eq('id', replyId);

    if (error) {
        console.error('답장 읽음 처리 오류:', error);
        return false;
    }
    return true;
}

// 답장 삭제
export async function deleteReply(replyId: string): Promise<boolean> {
    if (!supabase) {
        console.error('Supabase 클라이언트 없음');
        return false;
    }

    try {
        console.log('📝 답장 삭제 시도:', replyId);

        const { error, count } = await supabase
            .from('card_replies')
            .delete()
            .eq('id', replyId);

        if (error) {
            console.error('답장 삭제 오류:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return false;
        }

        console.log('✅ 답장 삭제 성공:', replyId);
        return true;
    } catch (error) {
        console.error('답장 삭제 중 예외 발생:', error);
        return false;
    }
}

// 코치 설정 관련
export interface CoachSettings {
    id: string;
    password_hash: string;
    email?: string;
    updated_at: string;
}

// 코치 비밀번호 확인
export async function verifyCoachPassword(password: string): Promise<boolean> {
    if (!supabase) {
        // Supabase 없으면 환경 변수로 fallback
        return password === (process.env.COACH_PASSWORD || '1234');
    }

    const { data, error } = await supabase
        .from('coach_settings')
        .select('password_hash')
        .limit(1)
        .single();

    if (error || !data) {
        // 테이블 없으면 환경 변수로 fallback
        return password === (process.env.COACH_PASSWORD || '1234');
    }

    return password === data.password_hash;
}

// 코치 비밀번호 변경
export async function updateCoachPassword(newPassword: string): Promise<boolean> {
    if (!supabase) return false;

    const { error } = await supabase
        .from('coach_settings')
        .update({
            password_hash: newPassword,
            updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('coach_settings').select('id').limit(1).single()).data?.id || '');

    if (error) {
        console.error('비밀번호 변경 오류:', error);
        return false;
    }
    return true;
}

// 코치 설정 조회
export async function getCoachSettings(): Promise<CoachSettings | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('coach_settings')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('코치 설정 조회 오류:', error);
        return null;
    }
    return data;
}
