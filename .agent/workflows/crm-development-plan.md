# 강점 코칭 CRM 시스템 - 종합 개발 문서

## 프로젝트 개요

**제품명**: StrengthsNavigator Pro  
**목적**: 강점 기반 코치를 위한 올인원 고객관리 및 코칭 플랫폼  
**타겟**: Gallup 인증 강점 코치, 기업 코치, 독립 코치

---

## 1. 핵심 모듈 (5개)

### Module 1: 고객 관리 (Client Management) 🎯

**핵심 기능:**
- 고객 프로필 생성/관리
- 강점 정보 저장 (Top 5 + All 34)
- 고객 상태 관리 (신규/활성/휴면/종료)
- 코칭 목표 설정 및 추적
- 다음 연락일 알림
- 생일/기념일 자동 알림

**주요 화면:**
```
1. 고객 목록 (리스트뷰/카드뷰)
   - 필터: 상태, 강점, 코칭타입
   - 정렬: 이름, 등록일, 마지막 연락
   - 검색: 이름, 회사, 강점

2. 고객 상세 페이지
   - 기본정보 + 강점 프로필
   - 세션 히스토리 타임라인
   - 빠른 액션 (카드 발송, 세션 기록, 노트)
   - 진행 상황 차트

3. 고객 등록/수정 폼
   - 다단계 폼 (기본정보 → 강점 → 목표)
   - 드래그앤드롭 파일 업로드
```

**DB 테이블:** `clients`

---

### Module 2: 세션 관리 (Session Tracking) 📝

**핵심 기능:**
- 코칭 세션 기록
- 논의한 강점 태깅
- 인사이트 & 액션 플랜 작성
- 세션별 만족도 평가
- 진행 상황 시각화
- 세션 템플릿 (1:1, 그룹, 워크숍)

**주요 화면:**
```
1. 세션 기록 폼
   - 클라이언트 선택
   - 세션 타입 (1:1/전화/온라인)
   - 논의 강점 선택 (멀티셀렉트)
   - 인사이트 & 액션 플랜 (리치 텍스트)
   - 만족도 & 평가

2. 세션 히스토리
   - 타임라인 뷰
   - 강점별 필터링
   - 액션 완료 체크리스트

3. 세션 분석 대시보드
   - 월별 세션 수
   - 자주 다룬 강점 Top 10
   - 평균 만족도
```

**DB 테이블:** `sessions`

---

### Module 3: 강점 카드 시스템 (Strength Cards) ✨

**핵심 기능:**
- 맞춤형 강점 카드 생성
- 여러 템플릿 & 스타일
- 고객에게 발송 (링크 공유)
- 카드 오픈/답장 추적
- 카드 라이브러리 (내가 보낸 카드)
- 자동 발송 스케줄링

**주요 화면:**
```
1. 카드 생성 페이지
   - 클라이언트 선택
   - 강점 선택
   - 템플릿 선택
   - 메시지 작성 (AI 제안 기능)
   - 실시간 미리보기

2. 카드 대시보드
   - 발송한 카드 목록
   - 오픈율/응답률 통계
   - 답장 관리

3. 템플릿 라이브러리
   - 기본 템플릿
   - 커스텀 템플릿
   - 커뮤니티 템플릿
```

**DB 테이블:** `sent_cards` (기존) + `card_templates` (신규)

---

### Module 4: 프로그램 관리 (Programs & Workshops) 👥

**핵심 기능:**
- 그룹 코칭 프로그램 생성
- 워크숍 일정 관리
- 참가자 등록/출석 체크
- 커리큘럼 관리
- 피드백 수집
- 참가비 관리

**주요 화면:**
```
1. 프로그램 목록
   - 진행중/예정/완료
   - 타입별 필터 (워크숍/그룹코칭/세미나)

2. 프로그램 상세
   - 기본 정보
   - 참가자 목록
   - 출석 현황
   - 피드백 요약

3. 프로그램 생성/수정
   - 일정, 장소, 정원
   - 커리큘럼 빌더
   - 참가자 추가 (기존 고객 or 신규)
```

**DB 테이블:** `programs`, `participants`

---

### Module 5: 인사이트 & 분석 (Analytics & Insights) 📊

**핵심 기능:**
- 코칭 성과 대시보드
- 고객 강점 분포 분석
- 세션 효과 측정
- 수익 추적 (매출, 갱신율)
- 스마트 알림 (팔로우업 필요)
- AI 기반 추천 (다음 액션)

**주요 화면:**
```
1. 메인 대시보드
   - KPI 카드 (총 고객, 활성 고객, 월간 세션, MRR)
   - 최근 활동 타임라인
   - 액션 필요 알림
   - 이번 주 일정

2. 강점 인사이트
   - 내 고객 강점 분포 (도넛 차트)
   - 강점별 세션 횟수
   - 강점 조합 분석

3. 비즈니스 분석
   - 월별 매출 추이
   - 고객 획득/이탈 추이
   - 프로그램별 수익
   - 갱신율 & LTV
```

**DB 테이블:** 기존 테이블 집계 + `analytics_cache` (성능)

---

## 2. 데이터베이스 스키마 (ERD)

### 확장된 스키마

```sql
-- 사용자 (코치)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    profile_image TEXT,
    brand_name TEXT DEFAULT 'StrengthsNavigator',
    tagline TEXT,
    bio TEXT,
    phone TEXT,
    website TEXT,
    instagram TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 클라이언트 (확장)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 기본 정보
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    company TEXT,
    position TEXT,
    profile_image TEXT,
    
    -- 상태 & 분류
    status TEXT DEFAULT 'active', -- active, paused, completed, archived
    coaching_types TEXT[], -- individual, group, workshop
    source TEXT, -- referral, website, event, etc
    
    -- 강점 정보
    top_strengths TEXT[5], -- Top 5 강점
    all_strengths JSONB, -- 전체 34개 강점 점수
    strength_domains TEXT[], -- 4 domains
    
    -- 코칭 정보
    coaching_goal TEXT,
    start_date DATE,
    end_date DATE,
    total_sessions INTEGER DEFAULT 0,
    
    -- 재무
    payment_amount DECIMAL(10,2),
    payment_status TEXT, -- paid, pending, overdue
    
    -- 관리
    next_contact_date DATE,
    birthday DATE,
    notes TEXT,
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 세션 기록
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    session_date TIMESTAMPTZ NOT NULL,
    session_number INTEGER,
    session_type TEXT, -- individual, group, phone, online
    duration INTEGER, -- minutes
    
    main_topic TEXT,
    discussed_strengths TEXT[],
    
    client_insights TEXT,
    coach_observations TEXT,
    action_plan TEXT,
    action_completed BOOLEAN DEFAULT false,
    
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    notes TEXT,
    attachments JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로그램/워크숍
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    type TEXT, -- workshop, group_coaching, seminar
    description TEXT,
    
    start_datetime TIMESTAMPTZ,
    end_datetime TIMESTAMPTZ,
    location TEXT,
    online_link TEXT,
    
    capacity INTEGER,
    current_participants INTEGER DEFAULT 0,
    fee DECIMAL(10,2),
    
    curriculum JSONB, -- 커리큘럼 구조
    materials JSONB, -- 자료 링크
    
    status TEXT DEFAULT 'planned', -- planned, ongoing, completed, cancelled
    feedback_summary TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로그램 참가자
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- 비고객 참가자
    name TEXT,
    email TEXT,
    phone TEXT,
    
    attendance JSONB, -- 출석 기록
    feedback TEXT,
    satisfaction_rating INTEGER,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 발송 카드 (기존 확장)
CREATE TABLE sent_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    client_name TEXT NOT NULL,
    template_id UUID, -- 나중에 템플릿 시스템
    
    season TEXT,
    situation TEXT,
    strength TEXT,
    situation_text TEXT,
    coach_message TEXT,
    
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    open_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 카드 답장
CREATE TABLE card_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES sent_cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    recipient_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 강점 마스터 데이터
CREATE TABLE strengths_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ko TEXT NOT NULL,
    name_en TEXT NOT NULL,
    domain TEXT NOT NULL, -- executing, influencing, relationship, strategic
    description_ko TEXT,
    description_en TEXT,
    emoji TEXT,
    order_num INTEGER
);

-- 알림/리마인더
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    type TEXT, -- followup, birthday, payment, session
    title TEXT,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    snoozed_until TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 템플릿 (카드/세션/등)
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    type TEXT, -- card, session_note, email
    name TEXT NOT NULL,
    content TEXT,
    is_public BOOLEAN DEFAULT false,
    use_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ERD 관계도

```
users (1) ──< (N) clients
      (1) ──< (N) programs
      (1) ──< (N) sent_cards
      (1) ──< (N) templates

clients (1) ──< (N) sessions
        (1) ──< (N) sent_cards
        (1) ──< (N) participants
        (1) ──< (N) reminders

programs (1) ──< (N) participants

sent_cards (1) ──< (N) card_replies

strengths_master - Reference 테이블
```

---

## 3. UI/UX 가이드라인

### 디자인 시스템

**컬러 팔레트:**
```css
/* Primary */
--gold-400: #F4D03F;
--gold-500: #D4AF37;
--gold-600: #B8962C;

/* Background */
--ocean-900: #0A2540;
--ocean-800: #1E3A5F;
--ocean-700: #2C4F7C;

/* Accent */
--blue-400: #60A5FA;
--green-400: #4ADE80;
--red-400: #F87171;

/* Neutral */
--white: #FFFFFF;
--gray-100: #F3F4F6;
--gray-600: #4B5563;
```

**타이포그래피:**
```css
/* 헤딩 */
H1: 48px/56px, Bold, Pretendard
H2: 36px/44px, Bold, Pretendard
H3: 24px/32px, SemiBold, Pretendard
H4: 20px/28px, SemiBold, Pretendard

/* 본문 */
Body-Large: 18px/28px, Regular, Pretendard
Body: 16px/24px, Regular, Pretendard
Body-Small: 14px/20px, Regular, Pretendard
Caption: 12px/16px, Regular, Pretendard
```

**컴포넌트 스타일:**
- Glass morphism (반투명 카드)
- Rounded corners (12px-24px)
- Soft shadows
- Smooth animations (300ms ease)
- 반응형 Grid/Flexbox

### 화면 구성

**레이아웃:**
```
┌─────────────────────────────────────┐
│  Sidebar │    Main Content Area    │
│  (240px) │                          │
│          │  ┌──────────────────┐   │
│  ├ 대시보드 │  │    Header        │   │
│  ├ 고객관리 │  └──────────────────┘   │
│  ├ 세션기록 │                          │
│  ├ 카드발송 │  ┌──────────────────┐   │
│  ├ 프로그램 │  │                  │   │
│  ├ 분석     │  │   Content        │   │
│  └ 설정    │  │                  │   │
│          │  └──────────────────┘   │
└─────────────────────────────────────┘
```

**주요 페이지 구성:**

1. **대시보드**
   - KPI 카드 4개 (그리드)
   - 최근 활동 피드 (왼쪽)
   - 알림/액션 (오른쪽)

2. **고객 목록**
   - 필터/검색 (상단)
   - 테이블 or 카드뷰 (토글)
   - 페이지네이션

3. **고객 상세**
   - 헤더 (이름, 강점, 빠른액션)
   - 탭 (개요/세션/카드/노트)
   - 타임라인 (활동 기록)

---

## 4. 개발 우선순위

### MVP (2-3개월)

**Phase 1: 핵심 CRM** 
```
Week 1-2: 프로젝트 셋업
- Next.js + Supabase 환경
- 인증 시스템 (Supabase Auth)
- 기본 레이아웃 & 네비게이션

Week 3-4: 고객 관리
- ✅ 고객 CRUD
- ✅ 강점 정보 저장
- ✅ 고객 목록/검색/필터

Week 5-6: 세션 기록
- ✅ 세션 CRUD
- ✅ 타임라인 뷰
- ✅ 간단한 분석

Week 7-8: 통합 & 테스트
- ✅ 버그 수정
- ✅ 성능 최적화
- ✅ 베타 테스트
```

**출시 기준:**
- 고객 100명 관리 가능
- 세션 기록 & 조회
- 모바일 반응형

---

### Phase 2: 강화 (2개월)

```
Week 9-10: 카드 시스템 통합
- ✅ 기존 카드 시스템 통합
- ✅ 클라이언트 페이지에서 직접 발송
- ✅ 카드 히스토리

Week 11-12: 프로그램 관리
- ✅ 프로그램/워크숍 CRUD
- ✅ 참가자 관리
- ✅ 출석 체크

Week 13-14: 스마트 알림
- ✅ 팔로우업 알림
- ✅ 생일/기념일
- ✅ 액션 추천

Week 15-16: 개선 & 안정화
- ✅ 사용자 피드백 반영
- ✅ UX 개선
```

**출시 기준:**
- 카드 + CRM 완전 통합
- 자동화 알림
- 프로그램 관리

---

### Phase 3: 고급 기능 (2-3개월)

```
Week 17-20: 인사이트 & 분석
- ✅ 종합 대시보드
- ✅ 강점 분석
- ✅ 비즈니스 메트릭
- ✅ 리포트 생성

Week 21-24: 고급 기능
- ✅ 템플릿 시스템
- ✅ 일정 관리 (캘린더)
- ✅ 이메일 통합
- ✅ 파일 관리

Week 25-28: AI 기능
- ✅ AI 세션 노트 요약
- ✅ AI 액션 플랜 제안
- ✅ AI 카드 메시지 생성
```

**출시 기준:**
- 완전한 코칭 플랫폼
- AI 지원
- 엔터프라이즈 준비

---

## 5. AI 개발 프롬프트

### 프롬프트 템플릿

#### 기능 개발 프롬프트
```
"강점 코칭 CRM 시스템을 개발 중입니다.

기술 스택:
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Supabase (PostgreSQL, Auth, Storage)  
- Styling: Framer Motion, Glassmorphism

DB 스키마:
[위의 스키마 붙여넣기]

개발할 기능:
[구체적인 기능 설명]

요구사항:
1. TypeScript 타입 안전성
2. Supabase RLS 적용
3. 반응형 디자인
4. 에러 처리
5. 로딩 상태

위 요구사항에 맞춰 [기능명] 컴포넌트/API를 만들어주세요."
```

#### UI 컴포넌트 프롬프트
```
"강점 코칭 CRM의 [컴포넌트명]을 만들어주세요.

디자인 시스템:
- 컬러: Gold(#D4AF37), Ocean(#0A2540)
- 스타일: Glassmorphism
- 폰트: Pretendard
- 간격: 4px 단위

기능:
[구체적인 기능]

예시 레이아웃:
[ASCII 아트 or 설명]

TailwindCSS + Framer Motion으로 구현해주세요."
```

#### DB 쿼리 프롬프트
```
"Supabase PostgreSQL 쿼리를 작성해주세요.

테이블 구조:
[관련 테이블 스키마]

필요한 쿼리:
[구체적인 요구사항]

조건:
- RLS 정책 고려
- 성능 최적화 (인덱스 활용)
- TypeScript 타입 포함
- 에러 처리

Supabase JS SDK 문법으로 작성해주세요."
```

---

## 6. 다음 단계 (Action Plan)

### 즉시 (이번 주)
```
□ 현재 StrengthsNavigator 안정화
  - 카드 저장 (coach_id 추가)
  - 프로필 연동 완료
  
□ CRM 프로젝트 계획 확정
  - DB 스키마 최종 검토
  - UI 와이어프레임 스케치
```

### 단기 (1개월)
```
□ MVP 개발 시작
  - 고객 관리 모듈
  - 세션 기록 모듈
  
□ 베타 테스터 모집
  - 코치 3-5명
```

### 중기 (3개월)
```
□ MVP 완성 & 론칭
□ 유료화 준비
```

---

이 문서가 당신의 비전을 현실로 만드는 로드맵입니다! 🚀
