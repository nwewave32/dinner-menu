"use client";

import { Button } from "@/components/ui/Button";

interface CompletionScreenProps {
  onDone: () => void;
}

/**
 * 종료 화면 (PRD 6.6).
 * 다음 영상 / 추천 / 검색 등 탐색 요소를 일절 제공하지 않는다.
 */
export function CompletionScreen({ onDone }: CompletionScreenProps) {
  return (
    <div className="animate-fade-up flex min-h-[60dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <span aria-hidden className="text-5xl">
        🌙
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink-100">
          오늘의 영상이 끝났습니다
        </h1>
        <p className="text-lg font-medium text-ember-400">오늘은 여기까지.</p>
        <p className="mt-2 leading-relaxed text-ink-500">
          폰을 내려놓고
          <br />
          저녁을 계속 즐겨보세요.
        </p>
      </div>
      <Button size="lg" onClick={onDone} className="min-w-40">
        완료
      </Button>
    </div>
  );
}
