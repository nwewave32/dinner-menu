"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { TodayHero } from "@/components/video/TodayHero";
import { ROUTES } from "@/lib/constants";
import { useToday } from "@/hooks/useToday";

/** 홈 — 앱 진입 시 첫 화면. 오늘의 영상 1개만 제시한다. */
export default function HomePage() {
  const { selection, video, isLoaded, isCompleted } = useToday();

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        {!isLoaded ? (
          <div className="flex flex-col items-center gap-5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="aspect-video w-full rounded-card" />
            <Skeleton className="h-13 w-64 rounded-full" />
          </div>
        ) : selection === null || video === null ? (
          <EmptyState
            icon="🌙"
            title="오늘 볼 영상이 아직 없어요"
            description="저녁 후보 목록에서 오늘 저녁에 볼 영상 하나를 골라두세요."
            action={
              <Link
                href={ROUTES.queue}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-ember-500 px-6 text-sm font-semibold text-night-950 transition-colors hover:bg-ember-400"
              >
                저녁 후보 보러 가기
              </Link>
            }
          />
        ) : isCompleted ? (
          <EmptyState
            icon="🌙"
            title="오늘은 여기까지"
            description="오늘의 영상을 끝까지 봤어요. 내일 저녁에 다시 만나요."
          />
        ) : (
          <TodayHero video={video} />
        )}
      </main>
    </div>
  );
}
