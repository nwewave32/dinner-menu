/**
 * YouTube IFrame Player API 로더 + 최소 타입 정의.
 * 공식 임베드 플레이어만 사용한다 (PRD 12장).
 */

export const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/** onError 코드 중 임베드가 차단된 경우 */
export const EMBED_BLOCKED_ERROR_CODES = new Set([101, 150]);

export interface YTPlayer {
  destroy(): void;
  getPlayerState(): number;
}

export interface YTStateChangeEvent {
  target: YTPlayer;
  data: number;
}

export interface YTErrorEvent {
  target: YTPlayer;
  data: number;
}

export interface YTPlayerOptions {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    rel?: 0 | 1;
    playsinline?: 0 | 1;
    modestbranding?: 1;
    autoplay?: 0 | 1;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: YTStateChangeEvent) => void;
    onError?: (event: YTErrorEvent) => void;
  };
}

export interface YTNamespace {
  Player: new (element: HTMLElement | string, options: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace & { loaded?: number };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const LOAD_TIMEOUT_MS = 10_000;

let apiPromise: Promise<YTNamespace> | null = null;

/** IFrame API 스크립트를 한 번만 로드하고 window.YT를 반환한다. */
export function loadIframeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IFrame API는 브라우저에서만 로드할 수 있습니다."));
      return;
    }

    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const timeout = window.setTimeout(() => {
      apiPromise = null;
      reject(new Error("YouTube 플레이어 로드가 시간 초과되었습니다."));
    }, LOAD_TIMEOUT_MS);

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      previousCallback?.();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        apiPromise = null;
        reject(new Error("YouTube 플레이어를 초기화하지 못했습니다."));
      }
    };

    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = IFRAME_API_SRC;
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        apiPromise = null;
        reject(new Error("YouTube 플레이어 스크립트를 불러오지 못했습니다."));
      };
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}
