"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVideo,
  listVideos,
  removeVideo,
  type AddVideoResult,
} from "@/lib/storage/repository";
import type { Video } from "@/lib/storage/schema";
import type { VideoMetadata } from "@/lib/youtube/oembed";

/** 후보 목록 상태. LocalStorage는 클라이언트에서만 읽으므로 hydration 후 로드한다. */
export function useQueue() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setVideos(listVideos());
    setIsLoaded(true);
  }, []);

  const add = useCallback(
    (youtubeVideoId: string, metadata: VideoMetadata): AddVideoResult => {
      const result = addVideo(youtubeVideoId, metadata);
      if (result.ok) {
        setVideos(listVideos());
      }
      return result;
    },
    [],
  );

  const remove = useCallback((videoId: string) => {
    removeVideo(videoId);
    setVideos(listVideos());
  }, []);

  return { videos, isLoaded, add, remove };
}
