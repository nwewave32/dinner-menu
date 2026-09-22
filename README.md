# 🌙 DinnerTube

> 오늘은 하나만. 영상이 끝나면, 저녁으로 돌아갑니다.

YouTube의 재미있는 콘텐츠는 즐기되, 무한 추천 구조에는 빠지지 않도록 도와주는 개인용 영상 큐 앱입니다. 미리 골라둔 영상 하나를 보고 나면 추천도, 다음 영상도 없이 **"끝"** 화면만 보여줍니다.

## ✨ 주요 기능

- **영상 추가** — YouTube URL을 붙여넣으면 제목·썸네일·채널을 가져와 저녁 후보 목록에 저장
- **오늘의 영상** — 후보 중 하나를 골라두면 앱을 열자마자 그 영상 하나만 보입니다
- **재생 & 끝** — 공식 YouTube 플레이어로 재생하고, 영상이 끝나면 종료 화면으로 전환
- **탐색 요소 없음** — 다음 영상, 추천, 검색, Shorts 없음. 오늘은 여기까지.

## 🚀 시작하기

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

```bash
npm test           # 테스트 실행
npm run typecheck  # 타입 검사
npm run build      # 프로덕션 빌드
```

## 🛠 기술 스택

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **YouTube IFrame Player API** + **oEmbed** — API 키 불필요
- **LocalStorage** — 서버·로그인 없음
- **Vitest** + Testing Library

## 📁 구조

```
app/          # 화면 — /(오늘의 영상), /watch(재생·종료), /queue(저녁 후보)
components/   # ui(디자인 시스템) / video / player / layout
lib/          # YouTube 연동, LocalStorage repository
hooks/        # useQueue, useToday
tests/        # unit · integration 테스트
```

## 📄 License

MIT
