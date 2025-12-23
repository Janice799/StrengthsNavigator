import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 로컬 스토리지 모드로 동작합니다.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// 타입 정의
export interface Profile {
    id: string;
    email?: string;
    name: string;
    role: 'coach' | 'client';
    coach_id?: string;
    created_at: string;
}

export interface UserStrength {
    id: string;
    user_id: string;
    strength_id: string;
    rank: number;
}

export interface Interaction {
    id: string;
    coach_id: string;
    client_id: string;
    occasion_id: string;
    message?: string;
    card_url: string;
    opened_at?: string;
    created_at: string;
}

// 클라이언트 CRUD 함수들
export async function getClientsFromSupabase() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('클라이언트 조회 오류:', error);
        return [];
    }
    return data || [];
}

export async function saveClientToSupabase(client: {
    name: string;
    strengthIds?: string[];
    archetypeId?: string;
}) {
    // 기존 클라이언트 확인
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', client.name)
        .eq('role', 'client')
        .single();

    let clientId: string;

    if (existing) {
        clientId = existing.id;
    } else {
        // 새 클라이언트 생성
        const { data: newClient, error } = await supabase
            .from('profiles')
            .insert({
                name: client.name,
                role: 'client'
            })
            .select('id')
            .single();

        if (error || !newClient) {
            console.error('클라이언트 생성 오류:', error);
            return null;
        }
        clientId = newClient.id;
    }

    // 강점 저장
    if (client.strengthIds && client.strengthIds.length > 0) {
        // 기존 강점 삭제
        await supabase
            .from('user_strengths')
            .delete()
            .eq('user_id', clientId);

        // 새 강점 추가
        const strengthRecords = client.strengthIds.map((strengthId, index) => ({
            user_id: clientId,
            strength_id: strengthId,
            rank: index + 1
        }));

        await supabase.from('user_strengths').insert(strengthRecords);
    }

    return clientId;
}

export async function deleteClientFromSupabase(clientId: string) {
    // 관련 강점 삭제
    await supabase.from('user_strengths').delete().eq('user_id', clientId);
    // 관련 인터랙션 삭제
    await supabase.from('interactions').delete().eq('client_id', clientId);
    // 클라이언트 삭제
    const { error } = await supabase.from('profiles').delete().eq('id', clientId);
    return !error;
}

// 카드 기록 저장
export async function saveCardHistoryToSupabase(history: {
    clientName: string;
    occasionId: string;
    message?: string;
    cardUrl: string;
}) {
    // 클라이언트 찾기
    const { data: client } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', history.clientName)
        .eq('role', 'client')
        .single();

    if (!client) {
        console.error('클라이언트를 찾을 수 없습니다:', history.clientName);
        return null;
    }

    const { data, error } = await supabase
        .from('interactions')
        .insert({
            client_id: client.id,
            occasion_id: history.occasionId,
            message: history.message,
            card_url: history.cardUrl
        })
        .select()
        .single();

    if (error) {
        console.error('카드 기록 저장 오류:', error);
        return null;
    }
    return data;
}

// 카드 오픈 기록
export async function markCardAsOpened(interactionId: string) {
    const { error } = await supabase
        .from('interactions')
        .update({ opened_at: new Date().toISOString() })
        .eq('id', interactionId);

    return !error;
}

// 클라이언트별 카드 기록 조회
export async function getClientCardHistory(clientId: string) {
    const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('카드 기록 조회 오류:', error);
        return [];
    }
    return data || [];
}

// Supabase 연결 상태 확인
export async function checkSupabaseConnection(): Promise<boolean> {
    try {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        return !error;
    } catch {
        return false;
    }
}
