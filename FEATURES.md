# DAKERTON 플랫폼 — 구현 기능 소개

> **브랜치:** `feat/full-platform-implementation`
> **기술 스택:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Framer Motion · TypeScript 5
> **데이터:** localStorage 기반 (백엔드/DB 없음) · 시드 데이터 자동 초기화
> **배포:** Docker (standalone) · Vercel 호환

---

## 1. 메인 페이지 (`/`)

| 기능 | 설명 |
|------|------|
| **히어로 섹션** | 배경 영상(`dakerton.mp4`) + 오버레이 그라데이션 + "시작하기" CTA |
| **3D 카로셀** | 3장 슬라이드 자동 회전 (4초), 좌·우 클릭/버튼으로 수동 전환, perspective 3D 효과 |
| **통계 카운터** | 해커톤 150+, 참가자 3,200+, 팀 800+, 총 상금 ₩5억+ (교차앵터 IntersectionObserver 애니메이션) |
| **Feature 카드** | 해커톤 보러가기 / 팀 찾기 / 랭킹 보기 — hover 시 "자세히 보기" 표시 |
| **검색 바** | 해커톤 이름 검색 → `/hackathons?q=검색어` 이동 |
| **푸터** | © 2026 DAKERTON |

---

## 2. 해커톤 목록 (`/hackathons`)

| 기능 | 설명 |
|------|------|
| **상태 필터** | 전체 / 진행중 / 예정 / 종료 — 버튼 토글 |
| **태그 필터** | 해커톤의 모든 태그를 자동 추출하여 클릭 필터 (예: #LLM, #VibeCoding) |
| **텍스트 검색** | 제목 + 태그 동시 검색, URL `?q=` 파라미터 연동 |
| **카드 그리드** | 2열 레이아웃, 상태 뱃지(진행중/예정/종료), 태그, 기간, 참가자 수 표시 |

---

## 3. 해커톤 상세 (`/hackathons/[slug]`)

8개 탭으로 구성된 상세 페이지:

| 탭 | 주요 내용 |
|----|----------|
| **개요** | 대회 소개, 팀 정책(최대 인원, 개인 참가 가능 여부), 참가 현황(참가자·팀·제출물 수) |
| **안내** | 공지사항 목록, 규칙/FAQ 외부 링크 |
| **평가** | 평가 지표 설명, 점수 가중치 시각화(프로그레스 바), 실행/제출 제한 |
| **일정** | 마일스톤 타임라인 (완료/진행/예정 시각적 구분), 카운트다운 표시 |
| **상금** | 1·2·3등 상금 카드 + 총 상금 합계 |
| **팀** | 해당 해커톤의 등록 팀 목록, 초대 보내기, 받은 초대 수락/거절, 인원 초과 모달 |
| **제출** | 가이드 표시, 단계별 제출 항목(`submissionItems`), 제출 폼(타입 선택/URL/메모), 제출 내역 |
| **리더보드** | 순위 테이블(점수, 참가자/심사위원 점수 분리, 아티팩트 링크) |

**추가 기능:**
- 제출 기한 지나면 자동으로 "제출 기간 종료" 경고 표시 + 폼 비활성화
- 종료된 해커톤은 상단에 "이 해커톤은 종료되었습니다" 안내
- 진행률 프로그레스 바 (완료 마일스톤 / 전체 마일스톤)

---

## 4. 팀 찾기 — Camp (`/camp`)

| 기능 | 설명 |
|------|------|
| **팀 모집글 목록** | 팀명, 소개, 모집 포지션 뱃지, 모집중/완료 상태, 연결 해커톤 링크 |
| **모집글 작성/수정** | 팀명, 소개, 포지션 선택(토글), 해커톤 연결, 연락 링크 |
| **포지션 필터** | Frontend / Backend / Designer / ML Engineer / PM / DevOps |
| **텍스트 검색** | 팀명 + 소개 동시 검색 |
| **해커톤별 필터** | URL `?hackathon=slug` 파라미터로 해커톤별 팀만 표시 |
| **스마트 팀 매칭 (E-02)** | 로그인 사용자의 `preferredPositions`와 팀의 `lookingFor`를 매칭하여 "나에게 맞는 팀 추천" 상단 표시 (최대 3팀) |
| **동적 인원 표시** | 해커톤 상세의 `maxTeamSize` 기반 (하드코딩 `/5` 제거) |
| **지원하기** | 버튼 클릭 시 팀 인원 +1 반영, 모집 마감 팀 비활성화 |
| **모집 상태 토글** | 모집중 ↔ 완료 전환 |

---

## 5. 랭킹 (`/rankings`)

| 기능 | 설명 |
|------|------|
| **Top 3 포디움** | 1·2·3위 카드 (포인트, 참가 횟수), 크라운 아이콘 |
| **전체 순위 테이블** | 순위, 닉네임, 포인트, 참가 횟수 |
| **기간 필터** | 전체 / 이번 달 / 이번 주 |
| **닉네임 검색** | 실시간 필터링 |

---

## 6. 인증 시스템

### 6-1. 로그인 (`/auth/login`)
- 이메일 + 비밀번호 폼
- 에러 메시지 표시 (잘못된 이메일/비밀번호)
- 데모 계정 안내: `demo@dakerton.com` / `demo1234`
- 로그인 성공 시 메인 페이지 이동

### 6-2. 회원가입 (`/auth/signup`)
- 이메일, 닉네임, 비밀번호, 비밀번호 확인
- 선호 포지션 선택 (6종 — 팀 매칭에 활용)
- 중복 이메일/닉네임 검증
- 가입 성공 시 자동 로그인 + 메인 페이지 이동

### 6-3. 프로필 (`/profile`)
- 닉네임, 자기소개, 선호 포지션 편집
- 나의 랭킹 표시 (순위, 포인트, 참가 횟수)
- 나의 제출 이력
- 로그아웃 버튼

### 6-4. 인증 상태 반영
- **Navbar**: 로그인 시 닉네임 + 프로필 링크 표시, 미로그인 시 "로그인" 버튼
- **모바일 메뉴**: 동일하게 로그인 상태 반영
- **localStorage + CustomEvent** 기반 크로스 컴포넌트 동기화

---

## 7. 공통 UI/UX

| 기능 | 설명 |
|------|------|
| **다크 모드** | 시스템 설정 자동 감지 + 수동 토글 (우하단 플로팅 버튼), localStorage 저장 |
| **반응형 디자인** | 모바일 ↔ 데스크톱 완전 대응 (Navbar 햄버거 메뉴, 그리드 변환 등) |
| **토스트 알림** | success / error / info 3종, 3초 자동 소멸 |
| **로딩 상태** | 스피너 컴포넌트 (데이터 로드 전 표시) |
| **빈 상태** | "검색 결과가 없습니다" 등 빈 데이터 피드백 |
| **카운트다운** | 마일스톤까지 남은 시간 실시간 표시 (일/시/분/초) |
| **프로그레스 바** | 애니메이션 진행률 바 |
| **페이지 애니메이션** | Framer Motion 기반 진입/탭 전환/카드 stagger 효과 |
| **404 페이지** | 커스텀 Not Found 페이지 |

---

## 8. 데이터 구조

모든 데이터는 **localStorage**에 저장됩니다. 최초 접속 시 시드 데이터가 자동 초기화됩니다.

| 키 | 타입 | 설명 |
|----|------|------|
| `hackathons` | `Hackathon[]` | 해커톤 3건 (Aimers 8기, 월간 바이브코딩, 긴급 인수인계) |
| `hackathon_details` | `HackathonDetail[]` | 해커톤별 상세 (8개 섹션) |
| `teams` | `Team[]` | 팀 4건 |
| `leaderboards` | `Leaderboard[]` | 리더보드 2건 (점수, 아티팩트) |
| `rankings` | `RankingEntry[]` | 글로벌 랭킹 8건 |
| `submissions` | `Submission[]` | 제출물 (사용자가 추가) |
| `invitations` | `Invitation[]` | 팀 초대 (사용자가 추가) |
| `users` | `User[]` | 사용자 (demo, guest + 가입 사용자) |
| `current_user` | `User` | 현재 로그인 사용자 |
| `theme` | `string` | 다크/라이트 모드 설정 |

---

## 9. 배포

### Docker
```bash
docker compose up --build -d
# http://localhost:3000
```

- Multi-stage 빌드 (deps → builder → runner)
- Node 20 Alpine 기반
- Next.js standalone 출력
- 포트: 3000

### Vercel
```bash
vercel deploy
```
- `next.config.ts`에 `output: "standalone"` 설정 완료

---

## 10. 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 메인 (히어로 + 캐로셀 + 통계 + CTA)
│   ├── layout.tsx                  # 루트 레이아웃 (메타데이터, 폰트)
│   ├── not-found.tsx               # 404
│   ├── globals.css                 # Tailwind 테마, 커스텀 CSS
│   ├── auth/login/page.tsx         # 로그인
│   ├── auth/signup/page.tsx        # 회원가입
│   ├── profile/page.tsx            # 프로필
│   ├── hackathons/page.tsx         # 해커톤 목록
│   ├── hackathons/[slug]/page.tsx  # 해커톤 상세 (8탭)
│   ├── camp/page.tsx               # 팀 찾기
│   └── rankings/page.tsx           # 랭킹
├── components/
│   ├── ClientShell.tsx             # 루트 클라이언트 래퍼 (시드 초기화, 테마, 토스트)
│   ├── Navbar.tsx                  # 네비게이션 바
│   ├── CountUp.tsx                 # 숫자 애니메이션
│   ├── Toast.tsx                   # 토스트 알림 시스템
│   ├── UI.tsx                      # Loading, Empty, Countdown, ProgressBar 등
│   └── ui/badge.tsx                # CVA 기반 뱃지
├── hooks/
│   ├── useLocalStorage.ts          # localStorage 훅 + 시드 데이터 초기화
│   └── useAuth.ts                  # 인증 훅 (login/signup/logout/updateProfile)
├── lib/
│   ├── types.ts                    # TypeScript 타입 정의 (13개 인터페이스)
│   └── utils.ts                    # cn() 유틸리티 (clsx + tailwind-merge)
└── data/
    └── seed.ts                     # 시드 데이터 (해커톤, 팀, 리더보드, 랭킹, 유저)
```

---

## 11. 데모 계정

| 이메일 | 비밀번호 | 닉네임 | 선호 포지션 |
|--------|----------|--------|------------|
| `demo@dakerton.com` | `demo1234` | alpha_dev | Frontend, Backend |
| `guest@dakerton.com` | `guest1234` | code_ninja | ML Engineer, Backend |
