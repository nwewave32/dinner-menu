"use client";

import { useEffect, useRef } from "react";
import {
  EMBED_BLOCKED_ERROR_CODES,
  loadIframeApi,
  PLAYER_STATE,
  type YTPlayer,
} from "@/lib/youtube/iframe";

export type PlayerErrorKind = "embed_blocked" | "unavailable" | "load_failed";

interface YouTubePlayerProps {
  youtubeVideoId: string;
  onEnded: () => void;
  onError: (kind: PlayerErrorKind) => void;
  /** 플레이어가 준비되어 재생 가능해진 시점 (세션 시작 기록용) */
  onReady?: () => void;
}

/**
 * 공식 YouTube IFrame Player 래퍼.
 * ENDED 상태를 감지해 onEnded를 호출한다. 추천/다음 영상 UI는 없다.
 */
export function YouTubePlayer({
  youtubeVideoId,
  onEnded,
  onError,
  onReady,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // 콜백을 ref로 유지해 플레이어 재생성 없이 항상 최신 콜백을 호출한다.
  const callbacksRef = useRef({ onEnded, onError, onReady });
  callbacksRef.current = { onEnded, onError, onReady };

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (container === null) return;

    const mount = document.createElement("div");
    container.appendChild(mount);

    loadIframeApi()
      .then((yt) => {
        if (cancelled) return;
        playerRef.current = new yt.Player(mount, {
          videoId: youtubeVideoId,
          width: "100%",
          height: "100%",
          playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
          events: {
            onReady: () => callbacksRef.current.onReady?.(),
            onStateChange: (event) => {
              if (event.data === PLAYER_STATE.ENDED) {
                callbacksRef.current.onEnded();
              }
            },
            onError: (event) => {
              callbacksRef.current.onError(
                EMBED_BLOCKED_ERROR_CODES.has(event.data)
                  ? "embed_blocked"
                  : "unavailable",
              );
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacksRef.current.onError("load_failed");
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      container.replaceChildren();
    };
  }, [youtubeVideoId]);

  return (
    <div
      ref={containerRef}
      className="aspect-video w-full overflow-hidden rounded-card bg-night-900 [&_iframe]:size-full"
      aria-label="YouTube 플레이어"
    />
  );
}
