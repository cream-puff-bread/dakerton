# DAKERTON — 해커톤 플랫폼

해커톤 탐색, 팀 빌딩, 제출, 리더보드를 한 곳에서 관리하는 플랫폼입니다.

## 기술 스택

- **Next.js 16** (App Router) · React 19 · TypeScript 5
- **Tailwind CSS 4** (반응형 + 다크 모드)
- **Framer Motion** (페이지/카드/탭 애니메이션)
- **localStorage** 기반 데이터 저장 (시드 데이터 자동 초기화)
- **Docker** multi-stage 빌드 (Node 20 Alpine, standalone)

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

http://localhost:3000 에서 확인하세요.

## 주요 기능

### 메인 (`/`)
- 배경 영상 히어로 섹션 + 3D 카로셀 (자동 회전)
- 통계 카운터 애니메이션 (해커톤 150+, 참가자 3,200+, 팀 800+, 총 상금 ₩5억+)
- 해커톤 검색 바

### 해커톤 (`/hackathons`)
- 상태 필터 (전체 / 진행중 / 예정 / 종료) + 태그 필터 + 텍스트 검색
- URL 파라미터 연동 (`?q=`, `?status=`)

### 해커톤 상세 (`/hackathons/[slug]`)
8개 탭: 개요 · 안내 · 평가 · 일정 · 상금 · 팀 · 제출 · 리더보드

- 제출 기한 자동 관리 (기간 종료 시 폼 비활성화)
- 팀 초대 수락/거절, 인원 초과 검증
- 마일스톤 카운트다운 + 진행률 프로그레스 바

### 팀 찾기 — Camp (`/camp`)
- 팀 모집글 작성/수정/삭제, 포지션 필터, 해커톤별 필터
- **스마트 팀 매칭**: 로그인 사용자의 선호 포지션 기반 팀 추천

### 랭킹 (`/rankings`)
- Top 3 포디움 + 전체 순위 테이블
- 기간 필터 (전체 / 이번 달 / 이번 주)

### 인증
- 로그인 / 회원가입 / 프로필 편집 / 로그아웃
- Navbar 로그인 상태 반영 (데스크톱 + 모바일)

## 데모 계정

| 이메일 | 비밀번호 |
|--------|----------|
| `demo@dakerton.com` | `demo1234` |
| `guest@dakerton.com` | `guest1234` |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                    # 메인 (히어로 + 캐로셀 + 통계)
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── globals.css                 # 테마 + 커스텀 CSS
│   ├── auth/login/page.tsx         # 로그인
│   ├── auth/signup/page.tsx        # 회원가입
│   ├── profile/page.tsx            # 프로필
│   ├── hackathons/page.tsx         # 해커톤 목록
│   ├── hackathons/[slug]/page.tsx  # 해커톤 상세 (8탭)
│   ├── camp/page.tsx               # 팀 찾기
│   └── rankings/page.tsx           # 랭킹
├── components/                     # Navbar, Toast, CountUp, UI 등
├── hooks/                          # useLocalStorage, useAuth
├── lib/                            # types.ts, utils.ts
└── data/seed.ts                    # 시드 데이터
```
