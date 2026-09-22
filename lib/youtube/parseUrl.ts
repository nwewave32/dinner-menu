/**
 * YouTube URL에서 11자리 Video ID를 추출한다.
 * 지원 형식:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/shorts/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/live/VIDEO_ID
 *  - https://m.youtube.com/... (모바일 도메인)
 *  - 프로토콜 생략(youtube.com/...) 입력
 */

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

const PATH_PREFIXES = ["/shorts/", "/embed/", "/live/", "/v/"] as const;

export function isValidVideoId(value: string): boolean {
  return VIDEO_ID_PATTERN.test(value);
}

/** 성공 시 Video ID, 실패 시 null. 예외를 던지지 않는다. */
export function parseYouTubeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // 프로토콜이 생략된 입력을 한 번 더 시도한다.
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();

  if (SHORT_HOSTS.has(host)) {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return isValidVideoId(id) ? id : null;
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v") ?? "";
    return isValidVideoId(id) ? id : null;
  }

  for (const prefix of PATH_PREFIXES) {
    if (url.pathname.startsWith(prefix)) {
      const id = url.pathname.slice(prefix.length).split("/")[0] ?? "";
      return isValidVideoId(id) ? id : null;
    }
  }

  return null;
}
