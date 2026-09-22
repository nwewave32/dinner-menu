import { z } from "zod";
import {
  sessionListSchema,
  todaySelectionSchema,
  videoListSchema,
  type TodaySelection,
  type Video,
  type ViewingSession,
} from "./schema";
import type { VideoMetadata } from "@/lib/youtube/oembed";
import { toLocalDateString } from "@/lib/utils/date";
import { createId } from "@/lib/utils/id";

/**
 * LocalStorage 접근을 한 곳으로 모은 repository 계층.
 * - 읽기: zod로 검증하고, 손상된 데이터는 기본값으로 대체한다.
 * - 향후 서버 전환 시 이 파일만 교체하면 된다.
 */

const STORAGE_KEYS = {
  videos: "dinnertube:videos",
  today: "dinnertube:today",
  sessions: "dinnertube:sessions",
} as const;

function readValidated<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간 초과 등 — v0.1에서는 조용히 무시 (데이터 규모가 작다)
  }
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

// ─── Videos ──────────────────────────────────────────────

export function listVideos(): Video[] {
  return readValidated(STORAGE_KEYS.videos, videoListSchema, []);
}

export function findVideo(videoId: string): Video | null {
  return listVideos().find((v) => v.id === videoId) ?? null;
}

export type AddVideoResult =
  | { ok: true; video: Video }
  | { ok: false; error: "duplicate" };

export function addVideo(
  youtubeVideoId: string,
  metadata: VideoMetadata,
): AddVideoResult {
  const videos = listVideos();
  if (videos.some((v) => v.youtubeVideoId === youtubeVideoId)) {
    return { ok: false, error: "duplicate" };
  }
  const video: Video = {
    id: createId(),
    youtubeVideoId,
    title: metadata.title,
    thumbnailUrl: metadata.thumbnailUrl,
    channel: metadata.channel,
    durationSeconds: null,
    addedAt: new Date().toISOString(),
    tags: [],
  };
  write(STORAGE_KEYS.videos, [video, ...videos]);
  return { ok: true, video };
}

export function removeVideo(videoId: string): void {
  const videos = listVideos().filter((v) => v.id !== videoId);
  write(STORAGE_KEYS.videos, videos);
  // 오늘의 영상으로 선택돼 있었다면 선택도 해제한다.
  const today = getTodaySelection();
  if (today?.videoId === videoId) {
    clearTodaySelection();
  }
}

// ─── Today selection ─────────────────────────────────────

/** 오늘 날짜의 선택만 반환한다. 지난 날짜의 선택은 자동 폐기. */
export function getTodaySelection(now: Date = new Date()): TodaySelection | null {
  const stored = readValidated<TodaySelection | null>(
    STORAGE_KEYS.today,
    todaySelectionSchema,
    null,
  );
  if (stored === null) return null;
  if (stored.date !== toLocalDateString(now)) {
    remove(STORAGE_KEYS.today);
    return null;
  }
  return stored;
}

export function selectToday(videoId: string, now: Date = new Date()): TodaySelection {
  const selection: TodaySelection = {
    videoId,
    date: toLocalDateString(now),
    completedAt: null,
  };
  write(STORAGE_KEYS.today, selection);
  return selection;
}

export function markTodayCompleted(now: Date = new Date()): void {
  const current = getTodaySelection(now);
  if (current === null) return;
  write(STORAGE_KEYS.today, { ...current, completedAt: now.toISOString() });
}

export function clearTodaySelection(): void {
  remove(STORAGE_KEYS.today);
}

// ─── Viewing sessions ────────────────────────────────────

export function listSessions(): ViewingSession[] {
  return readValidated(STORAGE_KEYS.sessions, sessionListSchema, []);
}

export function startSession(videoId: string): ViewingSession {
  const session: ViewingSession = {
    id: createId(),
    videoId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    completed: false,
  };
  write(STORAGE_KEYS.sessions, [...listSessions(), session]);
  return session;
}

export function completeSession(sessionId: string): void {
  const sessions = listSessions().map((s) =>
    s.id === sessionId
      ? { ...s, completed: true, completedAt: new Date().toISOString() }
      : s,
  );
  write(STORAGE_KEYS.sessions, sessions);
}
