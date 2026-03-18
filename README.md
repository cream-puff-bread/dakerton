# Dakerton — 해커톤 플랫폼

해커톤 탐색, 팀 빌딩, 제출, 리더보드를 한 곳에서.

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (반응형 + 다크모드)
- localStorage (시드 데이터 자동 로드)

## 실행 방법

### 로컬 개발

```bash
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

http://localhost:3000 에서 확인하세요.

### Vercel 배포

1. GitHub Push
2. Vercel → Import Project → Deploy

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 |
| `/hackathons` | 해커톤 목록 (상태/태그 필터) |
| `/hackathons/:slug` | 해커톤 상세 (7개 섹션) |
| `/camp` | 팀 모집 (CRUD + 필터) |
| `/rankings` | 글로벌 랭킹 (기간 필터) |
