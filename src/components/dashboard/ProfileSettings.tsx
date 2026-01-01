'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getCoachProfile, updateCoachProfile, uploadProfileImage } from '@/lib/auth';
import { useLanguage } from '@/hooks/useLanguage';

export default function ProfileSettings() {
    const { lang } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [profile, setProfile] = useState({
        name: '',
        nickname: '',
        brand_name: '',
        tagline: '',
        title: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        youtube: '',
        profile_image_url: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;

            setUserId(user.id);
            const profileData = await getCoachProfile(user.id);

            if (profileData) {
                setProfile({
                    name: profileData.name || '',
                    nickname: profileData.nickname || '',
                    brand_name: profileData.brand_name || 'StrengthsNavigator',
                    tagline: profileData.tagline || (lang === 'en' ? 'Strengths Coaching Platform' : '강점 코칭 플랫폼'),
                    title: profileData.title || 'Strengths Coach',
                    description: profileData.description || '',
                    contact_email: profileData.contact_email || '',
                    contact_phone: profileData.contact_phone || '',
                    website: profileData.website || '',
                    instagram: profileData.instagram || '',
                    facebook: profileData.facebook || '',
                    linkedin: profileData.linkedin || '',
                    youtube: profileData.youtube || '',
                    profile_image_url: profileData.profile_image_url || ''
                });
            }
        } catch (error) {
            console.error('프로필 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setSaving(true);
        try {
            const result = await updateCoachProfile(userId, profile);
            if (result.success) {
                alert(lang === 'en' ? '✅ Profile saved!' : '✅ 프로필이 저장되었습니다!');
            } else {
                alert((lang === 'en' ? '❌ Save failed: ' : '❌ 저장 실패: ') + result.error);
            }
        } catch (error) {
            alert(lang === 'en' ? '❌ Error while saving.' : '❌ 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        // 파일 크기 체크 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert(lang === 'en' ? 'Image must be 5MB or less.' : '이미지 크기는 5MB 이하여야 합니다.');
            return;
        }

        setSaving(true);
        try {
            const result = await uploadProfileImage(userId, file);
            if (result.success && result.url) {
                setProfile({ ...profile, profile_image_url: result.url });
                alert(lang === 'en' ? '✅ Image uploaded!' : '✅ 이미지가 업로드되었습니다!');
            } else {
                alert((lang === 'en' ? '❌ Upload failed: ' : '❌ 업로드 실패: ') + result.error);
            }
        } catch (error) {
            alert(lang === 'en' ? '❌ Error during upload.' : '❌ 업로드 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-white/60">{lang === 'en' ? 'Loading...' : '로딩 중...'}</div>;
    }

    return (
        <div className="glass rounded-2xl p-6 max-w-4xl">
            <h3 className="text-lg font-bold text-white mb-6">
                👤 {lang === 'en' ? 'Edit Profile' : '프로필 편집'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
                {/* 프로필 이미지 */}
                <div>
                    <label className="block text-white/80 text-sm mb-2">
                        {lang === 'en' ? 'Profile Image' : '프로필 이미지'}
                    </label>
                    <div className="flex items-center gap-4">
                        {profile.profile_image_url ? (
                            <img
                                src={profile.profile_image_url}
                                alt={lang === 'en' ? 'Profile' : '프로필'}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gold-400/30"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                                <span className="text-white/40 text-2xl">👤</span>
                            </div>
                        )}
                        <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors">
                            {lang === 'en' ? '📁 Choose File' : '📁 파일 선택'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-white/40 text-xs mt-1">
                        {lang === 'en' ? 'Recommended: Square, max 5MB' : '권장: 정사각형, 최대 5MB'}
                    </p>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">
                            {lang === 'en' ? 'Name' : '이름'}
                        </label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 text-sm mb-2">
                            {lang === 'en' ? 'Nickname (for cards)' : '닉네임 (카드 표시용)'}
                        </label>
                        <input
                            type="text"
                            value={profile.nickname}
                            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                            placeholder={lang === 'en' ? 'Uses name if empty' : '미입력 시 이름 사용'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">
                            {lang === 'en' ? 'Brand Name' : '상호명/브랜드'}
                        </label>
                        <input
                            type="text"
                            value={profile.brand_name}
                            onChange={(e) => setProfile({ ...profile, brand_name: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-white/80 text-sm mb-2">
                        {lang === 'en' ? 'Title/Credentials (multiple lines)' : '직함/자격증 (여러 줄 입력 가능)'}
                    </label>
                    <textarea
                        value={profile.title}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                        placeholder={lang === 'en'
                            ? "e.g., Certified Strengths Coach\nICF Certified Coach"
                            : "예: 인증 강점 코치\nICF 인증 코치\n기업 전문 강점 코칭"}
                    />
                </div>

                <div>
                    <label className="block text-white/80 text-sm mb-2">
                        {lang === 'en' ? 'Tagline (multiple lines)' : '대표 문구 (여러 줄 입력 가능)'}
                    </label>
                    <textarea
                        value={profile.tagline}
                        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                        placeholder={lang === 'en'
                            ? "e.g., Discover your strengths"
                            : "예: 성공하는 나를 경험하는 새로운 방식\n당신의 강점을 발견하세요"}
                    />
                </div>

                <div>
                    <label className="block text-white/80 text-sm mb-2">
                        {lang === 'en' ? 'Introduction' : '소개글'}
                    </label>
                    <textarea
                        value={profile.description}
                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                        placeholder={lang === 'en'
                            ? "Write about your coaching services..."
                            : "강점 코칭에 대한 소개를 입력하세요..."}
                    />
                </div>

                {/* 연락처 정보 */}
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-medium mb-4">
                        📞 {lang === 'en' ? 'Contact Information' : '연락처 정보'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">
                                {lang === 'en' ? 'Email' : '이메일'}
                            </label>
                            <input
                                type="email"
                                value={profile.contact_email}
                                onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                placeholder="info@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-white/80 text-sm mb-2">
                                {lang === 'en' ? 'Phone' : '전화번호'}
                            </label>
                            <input
                                type="tel"
                                value={profile.contact_phone}
                                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                placeholder="010-1234-5678"
                            />
                        </div>
                    </div>
                </div>

                {/* SNS & 웹사이트 */}
                <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-medium mb-4">
                        🌐 {lang === 'en' ? 'SNS & Website' : 'SNS & 웹사이트'}
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">
                                {lang === 'en' ? 'Website' : '홈페이지'}
                            </label>
                            <input
                                type="url"
                                value={profile.website}
                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-white/80 text-sm mb-2">Instagram</label>
                                <input
                                    type="url"
                                    value={profile.instagram}
                                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-2">Facebook</label>
                                <input
                                    type="url"
                                    value={profile.facebook}
                                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-2">LinkedIn</label>
                                <input
                                    type="url"
                                    value={profile.linkedin}
                                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-white/80 text-sm mb-2">YouTube</label>
                                <input
                                    type="url"
                                    value={profile.youtube}
                                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                                    placeholder="https://youtube.com/@..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gold-500 text-ocean-900 rounded-xl font-medium hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                    {saving
                        ? (lang === 'en' ? 'Saving...' : '저장 중...')
                        : (lang === 'en' ? '💾 Save Profile' : '💾 프로필 저장')}
                </button>
            </form>
        </div>
    );
}
