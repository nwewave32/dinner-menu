import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import type { Video } from "@/lib/storage/schema";

interface TodayHeroProps {
  video: Video;
}

/** 홈 화면의 "오늘의 저녁 영상" 히어로. 재생 진입점 하나만 제공한다. */
export function TodayHero({ video }: TodayHeroProps) {
  return (
    <section
      aria-labelledby="today-heading"
      className="animate-fade-up flex flex-col gap-5"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-ember-400">🌙 오늘의 저녁 영상</p>
        <h1 id="today-heading" className="mt-1 text-xl font-bold text-ink-100">
          오늘은 이 영상 하나입니다
        </h1>
      </div>

      <Card className="overflow-hidden">
        <div className="aspect-video w-full bg-night-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnailUrl}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-1 p-5 text-center">
          <h2 className="text-lg font-semibold leading-snug text-ink-100">
            {video.title}
          </h2>
          <p className="text-sm text-ink-500">{video.channel}</p>
          <Link
            href={ROUTES.watch}
            className="mt-5 inline-flex min-h-13 w-full max-w-xs items-center justify-center rounded-full bg-ember-500 px-6 text-base font-semibold text-night-950 transition-colors hover:bg-ember-400 active:bg-ember-600"
          >
            ▶ 재생
          </Link>
        </div>
      </Card>
    </section>
  );
}
