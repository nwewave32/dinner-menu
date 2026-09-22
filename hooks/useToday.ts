"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearTodaySelection,
  findVideo,
  getTodaySelection,
  selectToday,
} from "@/lib/storage/repository";
import type { TodaySelection, Video } from "@/lib/storage/schema";

interface TodayState {
  selection: TodaySelection | null;
  video: Video | null;
}

/** 오늘의 영상 상태. 날짜 롤오버는 repository가 처리한다. */
export function useToday() {
  const [state, setState] = useState<TodayState>({ selection: null, video: null });
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    const selection = getTodaySelection();
    setState({
      selection,
      video: selection ? findVideo(selection.videoId) : null,
    });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const select = useCallback(
    (videoId: string) => {
      selectToday(videoId);
      refresh();
    },
    [refresh],
  );

  const clear = useCallback(() => {
    clearTodaySelection();
    refresh();
  }, [refresh]);

  return {
    selection: state.selection,
    video: state.video,
    isLoaded,
    isCompleted: state.selection?.completedAt != null,
    select,
    clear,
    refresh,
  };
}
