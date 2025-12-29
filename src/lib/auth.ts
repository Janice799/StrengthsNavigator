import { createClient as createBrowserClient } from './supabase-browser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드 Supabase (SSR 패키지 - 쿠키 기반 세션 유지)
export const supabase = createBrowserClient();

// Auth Types
export interface CoachProfile {
    id: string;
    email: string;
    name: string;
    nickname?: string;
    brand_name?: string;
    tagline?: string;
    title?: string;
    description?: string;
    bio?: string;
    profile_image_url?: string;
    phone?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    created_at: string;
    updated_at: string;
}

// 회원가입
export async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            }
        }
    });

    if (error) {
        console.error('회원가입 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
}

// 로그인
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('로그인 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
}

// 로그아웃
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('로그아웃 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
        console.error('비밀번호 재설정 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// 비밀번호 업데이트
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        console.error('비밀번호 변경 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// 현재 로그인한 사용자 (세션 기반 - 더 안정적)
export async function getCurrentUser() {
    // 먼저 세션 확인 (localStorage에서 가져옴)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (session?.user) {
        return session.user;
    }

    // 세션이 없으면 getUser 시도
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

// 현재 세션
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
}

// 코치 프로필 조회
export async function getCoachProfile(userId: string): Promise<CoachProfile | null> {
    const { data, error } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('프로필 조회 오류:', error);
        return null;
    }

    return data;
}

// 코치 프로필 업데이트
export async function updateCoachProfile(userId: string, updates: Partial<CoachProfile>) {
    const { data, error } = await supabase
        .from('coach_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('프로필 업데이트 오류:', error);
        return { success: false, error: error.message };
    }

    return { success: true, profile: data };
}

// 프로필 이미지 업로드
export async function uploadProfileImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('coach-profiles')
        .upload(fileName, file, {
            upsert: true
        });

    if (uploadError) {
        console.error('이미지 업로드 오류:', uploadError);
        return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from('coach-profiles')
        .getPublicUrl(fileName);

    // 프로필에 URL 저장
    await updateCoachProfile(userId, { profile_image_url: publicUrl });

    return { success: true, url: publicUrl };
}

// 계정 탈퇴 (모든 데이터 삭제)
export async function deleteAccount() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // 관련 데이터 삭제 (순서 중요: 외래키 제약 고려)
        // 1. 발송한 카드 삭제
        await supabase.from('sent_cards').delete().eq('coach_id', user.id);

        // 2. 고객 삭제
        await supabase.from('clients').delete().eq('coach_id', user.id);

        // 3. 코치 프로필 삭제
        await supabase.from('coach_profiles').delete().eq('id', user.id);

        // 4. Supabase Auth 세션 삭제 (실제 계정 삭제는 별도 처리 필요)
        await supabase.auth.signOut();

        return { success: true };
    } catch (error) {
        console.error('계정 삭제 오류:', error);
        return { success: false, error: 'Failed to delete account' };
    }
}
