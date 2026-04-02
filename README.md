# DAKERTON — 해커톤 플랫폼

> **"긴급 인수인계 해커톤: 명세서만 보고 구현하라"** 대회 참가작  
> 팀 **슈크림빵** | 2026.03 ~ 04

해커톤 탐색 · 팀 빌딩 · 제출 · 리더보드를 한 곳에서 관리하는 웹 플랫폼입니다.  
제공된 기능 명세서와 예시 JSON 데이터를 기반으로, 바이브 코딩을 활용해 완성한 서비스입니다.

---

## 배포 / 저장소

| 항목 | 링크 |
|------|------|
| **Vercel 배포** | [https://dakerton.vercel.app](https://dakerton.vercel.app) |
| **GitHub** | [https://github.com/cream-puff-bread/dakerton](https://github.com/cream-puff-bread/dakerton) |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | **Next.js 16** (App Router) · React 19 · TypeScript 5 |
| 스타일링 | **Tailwind CSS 4** (반응형 + 다크 모드) |
| 애니메이션 | **Framer Motion** (페이지 전환, 3D 캐러셀, 탭, 카운트업) |
| 아이콘 | **Lucide React** |
| 데이터 | **localStorage** 기반 (시드 데이터 자동 초기화, 버전 관리) |
| 폰트 | **Pretendard Variable** (CDN) |
| 배포 | **Vercel** (자동 배포) |
| 컨테이너 | **Docker** multi-stage 빌드 (Node 20 Alpine, standalone) |

---

## 실행 방법

### 로컬 개발

```bash
npm install
npm run dev
```

### Docker

```bash
docker compose up --build -d
```

http://localhost:3000 에서 확인합니다.

> **외부 API / DB 없음** — 심사자가 별도 키 없이 모든 기능을 확인할 수 있습니다.

---

## 데모 계정

| 이메일 | 비밀번호 | 닉네임 |
|--------|----------|--------|
| `demo@dakerton.com` | `demo1234` | alpha_dev |
| `guest@dakerton.com` | `guest1234` | hyunjin_ml |

---

## 주요 기능

### 1. 메인 페이지 (`/`)
- 풀스크린 **배경 영상 히어로** 섹션 + 그래디언트 오버레이
- **3D 캐러셀** (자동 회전 5초, perspective 회전 + translateX)
- **CountUp 통계** 애니메이션 (해커톤 150+, 참가자 3,200+, 팀 800+, 총 상금 ₩5억+)
- CTA 카드 3종 (해커톤 탐색 / 팀 빌딩 / 랭킹)
- 해커톤 **실시간 검색 바** → `/hackathons?q=` URL 연동

### 2. 해커톤 목록 (`/hackathons`)
- **상태 필터** (전체 / 진행중 / 예정 / 종료)
- **태그 필터** (동적 추출, 다중 토글)
- **텍스트 검색** (제목 + 태그, 대소문자 무시)
- URL 파라미터 연동 (`?q=`, `?status=`)
- 카드 그리드: 상태 뱃지 · 태그 · 기간 · 참가자 수 표시

### 3. 해커톤 상세 (`/hackathons/[slug]`)
8개 탭 구성 (Framer Motion layoutId 탭 애니메이션):

| 탭 | 주요 내용 |
|----|-----------|
| **개요** | 대회 요약, 팀 정책 (솔로 허용 여부, 최대 인원), 참가 현황 |
| **안내** | 공지사항 목록, 규정/FAQ 외부 링크 |
| **평가** | 평가 지표, 가중치 브레이크다운 (애니메이션 바), 제출 제한 |
| **일정** | 타임라인 UI (원형 마커 + 연결선), 다음 마일스톤 카운트다운 |
| **상금** | 등수별 상금 카드, 총 상금 합산 |
| **팀** | 해커톤별 팀 목록, 역할 선택 지원 모달, 초대 수락/거절 |
| **제출** | 솔루션 제출 폼 (메모 + 파일), **기한 초과 시 자동 비활성화** |
| **리더보드** | 순위 테이블, 투표 기반 점수 브레이크다운 (참가자 30% / 심사위원 70%) |

- 마일스톤 진행률 프로그레스 바
- 종료 대회 알림 배너
- 팀 가입 시 인원 초과 검증 (동적 maxTeamSize)

### 4. 팀 찾기 — Camp (`/camp`)
- **스마트 팀 매칭** ✨: 로그인 사용자의 선호 포지션 기반 추천 팀 자동 표시
- 팀 모집글 **CRUD** (작성 / 수정 / 삭제)
- 포지션 필터 · 해커톤별 필터 · 텍스트 검색
- 지원 플로우: 역할 선택 → 지원 → pending → 수락/거절
- 중복 지원 방지, 자기 팀 지원 차단, 미로그인 차단
- URL 파라미터 연동 (`?hackathon=`)

### 5. 랭킹 (`/rankings`)
- **Top 3 포디움** (메달 + 높이 차등 디자인)
- 전체 순위 테이블 (순위 · 닉네임 · 포인트 · 참가 횟수 · 뱃지)
- **기간 필터** (전체 / 30일 / 7일)
- 닉네임 검색

### 6. 인증 시스템
- **회원가입**: 이메일, 닉네임, 비밀번호 (6자 이상), 선호 포지션 다중 선택
- **로그인 / 로그아웃**: localStorage 기반, `auth-change` 이벤트로 크로스 컴포넌트 동기화
- **프로필**: 닉네임 · 바이오 · 포지션 편집, 제출 기록, 글로벌 랭킹 확인
- **팀 관리**: 내 팀 목록 · 멤버 관리 · 지원 수락/거절 · 가입 팀 · 대기 중 지원

### 7. 공통 UI/UX
- **다크 모드**: 시스템 설정 감지 + 수동 토글 (localStorage 영속)
- **반응형 디자인**: 모바일 → 태블릿 → 데스크탑 (Tailwind breakpoints)
- **Navbar**: 스크롤 시 글래스모피즘 (backdrop-blur), 모바일 햄버거 메뉴
- **토스트 알림**: 성공 / 에러 / 정보 (3초 자동 사라짐)
- **빈 상태 UI**: 데이터 없음 시 안내 메시지 + 아이콘
- **로딩 상태**: 스피너 컴포넌트
- **404 페이지**: 커스텀 Not Found 페이지

---

## 데이터 구조

localStorage에 시드 데이터가 자동으로 초기화됩니다 (seed_version 기반 갱신).

| 키 | 타입 | 설명 |
|----|------|------|
| `hackathons` | `Hackathon[]` | 해커톤 목록 (3개) |
| `hackathon_details` | `HackathonDetail[]` | 해커톤 상세 (8 섹션) |
| `teams` | `Team[]` | 팀 모집 목록 |
| `leaderboards` | `Leaderboard[]` | 해커톤별 리더보드 |
| `rankings` | `RankingEntry[]` | 글로벌 유저 랭킹 |
| `users` | `User[]` | 가입 유저 목록 |
| `team_applications` | `TeamApplication[]` | 팀 지원 내역 |
| `submissions` | `Submission[]` | 제출물 (사용자 생성) |
| `invitations` | `Invitation[]` | 초대 (사용자 생성) |
| `$current_user` | `User \| null` | 현재 로그인 사용자 |

---

## 확장 기능 (팀 고유)

- **스마트 팀 매칭**: 사용자 프로필 기반 추천 알고리즘
- **3D 캐러셀**: perspective + rotateY 기반 슬라이드 트랜지션
- **다이나믹 카운트다운**: 해커톤 마일스톤별 실시간 타이머 (24시간 미만 시 빨간색 강조)
- **점수 브레이크다운 시각화**: 투표 기반 점수의 참가자/심사위원 가중치 분리 표시
- **팀 인원 동적 관리**: 해커톤 설정의 maxTeamSize 반영
- **시드 데이터 버전 관리**: seed_version으로 데이터 마이그레이션 자동화

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 메인 (히어로 + 캐러셀 + 통계)
│   ├── layout.tsx                  # 루트 레이아웃 (Pretendard, 메타데이터)
│   ├── globals.css                 # 테마 변수 + 커스텀 CSS
│   ├── not-found.tsx               # 404 페이지
│   ├── auth/login/page.tsx         # 로그인
│   ├── auth/signup/page.tsx        # 회원가입
│   ├── profile/page.tsx            # 프로필 + 팀 관리
│   ├── hackathons/page.tsx         # 해커톤 목록 (필터 + 검색)
│   ├── hackathons/[slug]/page.tsx  # 해커톤 상세 (8탭)
│   ├── camp/page.tsx               # 팀 찾기 (스마트 매칭)
│   └── rankings/page.tsx           # 글로벌 랭킹
├── components/
│   ├── ClientShell.tsx             # 테마 토글 + 시드 초기화 + Provider
│   ├── Navbar.tsx                  # 반응형 네비게이션 (글래스모피즘)
│   ├── Toast.tsx                   # 토스트 알림 시스템
│   ├── CountUp.tsx                 # 숫자 카운트업 애니메이션
│   ├── UI.tsx                      # Loading, Empty, Error, StatusBadge, Tag, Countdown, ProgressBar
│   └── ui/badge.tsx                # shadcn-style 뱃지 컴포넌트
├── hooks/
│   ├── useAuth.ts                  # 인증 (로그인/가입/프로필/로그아웃)
│   └── useLocalStorage.ts          # localStorage 읽기/쓰기 + 이벤트 동기화
├── lib/
│   ├── types.ts                    # TypeScript 타입 정의
│   └── utils.ts                    # cn() 유틸리티
└── data/
    └── seed.ts                     # 시드 데이터 (해커톤, 팀, 유저, 랭킹)
```

---

## 팀

**슈크림빵**

---

## 라이선스

MIT
