import { beforeEach, describe, expect, it } from "vitest";
import {
  addVideo,
  completeSession,
  getTodaySelection,
  listSessions,
  listVideos,
  markTodayCompleted,
  removeVideo,
  selectToday,
  startSession,
} from "@/lib/storage/repository";
import type { VideoMetadata } from "@/lib/youtube/oembed";

const META: VideoMetadata = {
  title: "우주에 관한 다큐",
  channel: "BBC",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("videos", () => {
  it("영상을 추가하고 목록에서 조회한다", () => {
    const result = addVideo("dQw4w9WgXcQ", META);
    expect(result.ok).toBe(true);
    const videos = listVideos();
    expect(videos).toHaveLength(1);
    expect(videos[0]?.title).toBe(META.title);
    expect(videos[0]?.durationSeconds).toBeNull();
    expect(videos[0]?.tags).toEqual([]);
  });

  it("같은 YouTube 영상은 중복 추가되지 않는다", () => {
    addVideo("dQw4w9WgXcQ", META);
    const second = addVideo("dQw4w9WgXcQ", META);
    expect(second).toEqual({ ok: false, error: "duplicate" });
    expect(listVideos()).toHaveLength(1);
  });

  it("영상을 삭제한다", () => {
    const added = addVideo("dQw4w9WgXcQ", META);
    if (!added.ok) throw new Error("추가 실패");
    removeVideo(added.video.id);
    expect(listVideos()).toHaveLength(0);
  });

  it("오늘의 영상으로 선택된 영상을 삭제하면 선택도 해제된다", () => {
    const added = addVideo("dQw4w9WgXcQ", META);
    if (!added.ok) throw new Error("추가 실패");
    selectToday(added.video.id);
    removeVideo(added.video.id);
    expect(getTodaySelection()).toBeNull();
  });

  it("저장 데이터가 손상되어도 빈 목록으로 복구한다", () => {
    window.localStorage.setItem("dinnertube:videos", "{not json!!");
    expect(listVideos()).toEqual([]);
    window.localStorage.setItem(
      "dinnertube:videos",
      JSON.stringify([{ id: 1, wrong: "shape" }]),
    );
    expect(listVideos()).toEqual([]);
  });
});

describe("today selection", () => {
  it("데이터가 없으면 null을 반환한다", () => {
    expect(getTodaySelection()).toBeNull();
  });

  it("오늘 선택한 영상을 반환한다", () => {
    const now = new Date("2026-09-22T18:00:00");
    selectToday("video-1", now);
    const selection = getTodaySelection(now);
    expect(selection?.videoId).toBe("video-1");
    expect(selection?.completedAt).toBeNull();
  });

  it("날짜가 바뀌면 어제의 선택은 자동으로 폐기된다", () => {
    selectToday("video-1", new Date("2026-09-22T20:00:00"));
    const nextDay = new Date("2026-09-23T08:00:00");
    expect(getTodaySelection(nextDay)).toBeNull();
    // 폐기 후 저장소에서도 제거되었는지 확인
    expect(window.localStorage.getItem("dinnertube:today")).toBeNull();
  });

  it("완료 처리하면 completedAt이 기록된다", () => {
    const now = new Date("2026-09-22T19:00:00");
    selectToday("video-1", now);
    markTodayCompleted(now);
    expect(getTodaySelection(now)?.completedAt).not.toBeNull();
  });

  it("선택이 없을 때 완료 처리는 아무 일도 하지 않는다", () => {
    expect(() => markTodayCompleted()).not.toThrow();
    expect(getTodaySelection()).toBeNull();
  });
});

describe("viewing sessions", () => {
  it("세션을 시작하면 미완료 상태로 기록된다", () => {
    const session = startSession("video-1");
    expect(session.completed).toBe(false);
    expect(session.completedAt).toBeNull();
    expect(listSessions()).toHaveLength(1);
  });

  it("세션을 완료하면 completed=true가 된다", () => {
    const session = startSession("video-1");
    completeSession(session.id);
    const stored = listSessions().find((s) => s.id === session.id);
    expect(stored?.completed).toBe(true);
    expect(stored?.completedAt).not.toBeNull();
  });

  it("중간 이탈 세션은 미완료로 남는다", () => {
    startSession("video-1");
    // completeSession을 호출하지 않음 = 중간 이탈
    const sessions = listSessions();
    expect(sessions[0]?.completed).toBe(false);
  });
});
