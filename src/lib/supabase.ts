import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 (환경변수 없으면 null)
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
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

    const clientData = {
        ...client,
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
    return data;
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

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('클라이언트 삭제 오류:', error);
        return false;
    }
    return true;
}


// 카드 발송 관련 함수
export async function saveSentCard(card: Partial<SentCard>): Promise<SentCard | null> {
    if (!supabase) {
        console.log('📝 로컬 모드: 카드 저장 시뮬레이션', card);
        return { id: 'local-' + Date.now(), ...card } as SentCard;
    }

    const { data, error } = await supabase
        .from('sent_cards')
        .insert([card])
        .select()
        .single();

    if (error) {
        console.error('카드 저장 오류:', error);
        return null;
    }
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
