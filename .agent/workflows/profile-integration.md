---
description: 프로필 연동 및 링크 단축 작업
---

# 남은 작업 목록

## 1. 링크 길이 줄이기 (우선순위: 높음)

### 문제:
- 현재 카드 링크가 길게 생성됨
- DB 저장 시 짧은 링크(`/c/{id}`)로 생성되어야 하는데 실패

### 원인:
- `sent_cards` 테이블에 `coach_id` 필수이지만 전달 안 됨
- Row Level Security (RLS) 때문에 저장 실패

### 해결 방법:

#### Step 1: `saveSentCard` 함수 수정
파일: `/src/lib/supabase.ts` (Line 163)

현재 사용자의 coach_id를 가져와서 카드 저장 시 포함:

```typescript
export async function saveSentCard(card: Partial<SentCard>): Promise<SentCard | null> {
    if (!supabase) {
        console.log('📝 로컬 모드: 카드 저장 시뮬레이션', card);
        return { id: 'local-' + Date.now(), ...card } as SentCard;
    }

    // 현재 사용자 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('로그인 필요');
        return null;
    }

    const { data, error } = await supabase
        .from('sent_cards')
        .insert([{
            ...card,
            coach_id: user.id  // coach_id 추가!
        }])
        .select()
        .single();

    if (error) {
        console.error('카드 저장 오류:', error);
        return null;
    }
    return data;
}
```

#### Step 2: 카드 생성 페이지 확인
파일: `/src/app/create/page.tsx`

`saveSentCard` 호출 부분이 제대로 작동하는지 확인

---

## 2. 프로필 정보 카드 연동 (우선순위: 높음)

### 목표:
- 카드에 상호명 (brand_name) 표시
- 카드에 닉네임 또는 이름 (nickname || name) 표시

### 작업 파일:
1. `/src/app/c/[id]/page.tsx` - 공유 카드 페이지
2. `/src/app/create/page.tsx` - 카드 생성 미리보기

### 구현 방법:

#### Step 1: 프로필 정보 가져오는 함수 추가
파일: `/src/lib/supabase.ts`

```typescript
// 첫 번째 코치 프로필 가져오기 (공개용)
export async function getPublicCoachProfile() {
    const { data } = await supabase
        .from('coach_profiles')
        .select('name, nickname, brand_name, title')
        .limit(1)
        .single();
    
    return data;
}
```

#### Step 2: 카드 페이지에서 프로필 로드
파일: `/src/app/c/[id]/page.tsx`

```typescript
const [coachProfile, setCoachProfile] = useState({
    name: '',
    nickname: '',
    brand_name: 'StrengthsNavigator'
});

useEffect(() => {
    async function loadProfile() {
        const profile = await getPublicCoachProfile();
        if (profile) {
            setCoachProfile(profile);
        }
    }
    loadProfile();
}, []);
```

#### Step 3: 카드에 표시
카드 상단에 추가:

```tsx
{/* 상단 로고 */}
<div className="text-center mb-4">
    <h1 className="text-lg font-bold text-gold-gradient">
        {coachProfile.brand_name}
    </h1>
    <p className="text-xs text-white/60">강점 네비게이터</p>
</div>

{/* 코치 서명 */}
<div className="text-right mt-4p className="text-sm text-white/80">
    - {coachProfile.nickname || coachProfile.name} 코치
</p>
```

---

## 3. 랜딩 페이지 마무리 (우선순위: 낮음)

### 남은 작업:
- ✅ 로고 중앙 정렬 (완료)
- ❌ 코치 이름 표시
- ❌ 직함 textarea로 변경

### ProfileSettings.tsx 수정:
직함/자격증 필드를 textarea로:

```tsx
<div>
    <label className="block text-white/80 text-sm mb-2">직함/자격증</label>
    <textarea
        value={profile.title}
        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
        rows={2}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
        placeholder="예: Gallup Certified Strengths Coach"
    />
</div>
```

---

## 4. 로그인 유지 수정 (우선순위: 중간)

### 문제:
- 체크박스는 있지만 실제 로그인 유지가 안 됨

### 원인:
- Supabase Auth는 자동으로 세션 유지
- localStorage는 이메일만 저장

### 현재 상태:
- 이메일 자동 입력: ✅ 작동
- 로그인 세션 유지: Supabase가 자동 처리 (브라우저 닫아도 유지됨)

### 결론:
사실상 작동 중! 추가 작업 필요 없음.

---

## 우선순위 순서:

1. **링크 단축** (가장 급함)
2. **카드 프로필 연동** (사용자 경험에 중요)
3. **랜딩 페이지 마무리** (시각적)
4. **로그인 유지** (이미 작동 중)

---

## 테스트 체크리스트:

- [ ] 카드 생성 후 짧은 링크 생성되는지 확인
- [ ] 카드에 상호명 표시되는지 확인
- [ ] 카드에 닉네임 표시되는지 확인
- [ ] 프로필 수정 후 카드에 반영되는지 확인
