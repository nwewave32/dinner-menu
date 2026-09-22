"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Video } from "@/lib/storage/schema";

interface VideoCardProps {
  video: Video;
  isToday: boolean;
  onSelectToday: (videoId: string) => void;
  onRemove: (videoId: string) => void;
}

export function VideoCard({
  video,
  isToday,
  onSelectToday,
  onRemove,
}: VideoCardProps) {
  return (
    <Card className="animate-fade-up overflow-hidden">
      <div className="relative aspect-video w-full bg-night-700">
        {/* oEmbed 썸네일은 원격 최적화가 불필요해 img를 그대로 사용 (정적 배포 유지) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
        {isToday && (
          <span className="absolute left-3 top-3 rounded-full bg-ember-500 px-3 py-1 text-xs font-bold text-night-950">
            오늘의 영상
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink-100">
          {video.title}
        </h3>
        <p className="text-sm text-ink-500">{video.channel}</p>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant={isToday ? "secondary" : "primary"}
            className="flex-1"
            disabled={isToday}
            onClick={() => onSelectToday(video.id)}
          >
            {isToday ? "오늘 볼 영상이에요" : "오늘 보기"}
          </Button>
          <Button
            variant="danger"
            aria-label={`${video.title} 삭제`}
            onClick={() => onRemove(video.id)}
          >
            삭제
          </Button>
        </div>
      </div>
    </Card>
  );
}
