"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompletionScreen } from "@/components/player/CompletionScreen";
import {
  YouTubePlayer,
  type PlayerErrorKind,
} from "@/components/player/YouTubePlayer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/lib/constants";
import { useToday } from "@/hooks/useToday";
import {
  completeSession,
  markTodayCompleted,
  startSession,
} from "@/lib/storage/repository";

const PLAYER_ERROR_MESSAGES: Record<PlayerErrorKind, string> = {
  embed_blocked:
    "이 영상은 소유자가 외부 재생을 막아두어 여기서 볼 수 없어요. 후보 목록에서 다른 영상을 골라주세요.",
  unavailable: "영상을 재생할 수 없어요. 삭제되었거나 비공개일 수 있어요.",
  load_failed: "플레이어를 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.",
};

type WatchPhase = "watching" | "completed";

/**
 * 재생 화면 — 영상과 종료 화면만 존재한다.
 * 내비게이션/추천/검색 등 탐색 요소는 의도적으로 없다 (PRD 10장).
 */
export default function WatchPage() {
  const router = useRouter();
  const { selection, video, isLoaded, isCompleted } = useToday();
  const [phase, setPhase] = useState<WatchPhase>("watching");
  const [playerError, setPlayerError] = useState<PlayerErrorKind | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const sessionIdRef = useRef<string | null>(null);

  function handleReady() {
    // 세션은 플레이어가 준비된 시점에 1회만 기록한다.
    if (sessionIdRef.current === null && video !== null) {
      sessionIdRef.current = startSession(video.id).id;
    }
  }

  function handleEnded() {
    if (sessionIdRef.current !== null) {
      completeSession(sessionIdRef.current);
    }
    markTodayCompleted();
    setPhase("completed");
  }

  function handleDone() {
    router.push(ROUTES.home);
  }

  if (!isLoaded) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="mt-4 h-6 w-2/3" />
      </main>
    );
  }

  if (selection === null || video === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <EmptyState
          icon="🌙"
          title="오늘 볼 영상이 없어요"
          description="먼저 오늘의 영상을 골라주세요."
          action={
            <Link
              href={ROUTES.home}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ember-500 px-6 text-sm font-semibold text-night-950 transition-colors hover:bg-ember-400"
            >
              홈으로
            </Link>
          }
        />
      </main>
    );
  }

  // 이미 완료한 날 재진입하거나 방금 ENDED가 발생한 경우 → 종료 화면
  if (phase === "completed" || isCompleted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <CompletionScreen onDone={handleDone} />
      </main>
    );
  }

  if (playerError !== null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <EmptyState
          icon="😔"
          title="재생에 문제가 생겼어요"
          description={PLAYER_ERROR_MESSAGES[playerError]}
          action={
            <div className="flex gap-3">
              {playerError === "load_failed" && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPlayerError(null);
                    setRetryKey((k) => k + 1);
                  }}
                >
                  다시 시도
                </Button>
              )}
              <Link
                href={ROUTES.home}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ember-500 px-5 text-sm font-semibold text-night-950 transition-colors hover:bg-ember-400"
              >
                홈으로
              </Link>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-4 px-5 py-6">
      <YouTubePlayer
        key={retryKey}
        youtubeVideoId={video.youtubeVideoId}
        onReady={handleReady}
        onEnded={handleEnded}
        onError={setPlayerError}
      />
      <div className="px-1">
        <h1 className="text-lg font-semibold leading-snug text-ink-100">
          {video.title}
        </h1>
        <p className="mt-0.5 text-sm text-ink-500">{video.channel}</p>
      </div>
    </main>
  );
}
