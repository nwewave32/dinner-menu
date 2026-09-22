import { z } from "zod";

/** LocalStorage에 저장되는 모든 데이터의 zod 스키마. 읽을 때 항상 검증한다. */

export const videoSchema = z.object({
  id: z.string().min(1),
  youtubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string(),
  thumbnailUrl: z.string(),
  channel: z.string(),
  /** v0.1에서는 항상 null (길이 미표시 결정). 스키마만 P1 대비로 유지. */
  durationSeconds: z.number().int().positive().nullable(),
  addedAt: z.string(),
  tags: z.array(z.string()),
});

export const todaySelectionSchema = z.object({
  videoId: z.string().min(1),
  /** 로컬 기준 "YYYY-MM-DD". 날짜가 바뀌면 선택이 자동으로 초기화된다. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** 오늘의 영상을 끝까지 본 시각. null이면 아직 미완료. */
  completedAt: z.string().nullable(),
});

export const viewingSessionSchema = z.object({
  id: z.string().min(1),
  videoId: z.string().min(1),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  completed: z.boolean(),
});

export const videoListSchema = z.array(videoSchema);
export const sessionListSchema = z.array(viewingSessionSchema);

export type Video = z.infer<typeof videoSchema>;
export type TodaySelection = z.infer<typeof todaySelectionSchema>;
export type ViewingSession = z.infer<typeof viewingSessionSchema>;
