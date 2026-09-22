"use client";

import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { VideoCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { AddVideoForm } from "@/components/video/AddVideoForm";
import { VideoCard } from "@/components/video/VideoCard";
import { useQueue } from "@/hooks/useQueue";
import { useToday } from "@/hooks/useToday";

/** 저녁 후보 목록 — 영상 추가, 관리, 오늘 볼 영상 선택. */
export default function QueuePage() {
  const { videos, isLoaded, add, remove } = useQueue();
  const today = useToday();
  const { showToast } = useToast();

  function handleSelectToday(videoId: string) {
    today.select(videoId);
    showToast("오늘의 영상으로 골라뒀어요 🌙");
  }

  function handleRemove(videoId: string) {
    remove(videoId);
    // 삭제한 영상이 오늘의 영상이었다면 repository가 선택을 해제하므로 상태만 새로고침
    today.refresh();
    showToast("후보 목록에서 뺐어요");
  }

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8">
        <section aria-label="영상 추가">
          <h1 className="mb-3 text-xl font-bold text-ink-100">저녁 후보</h1>
          <AddVideoForm onAdd={add} />
        </section>

        <section aria-label="후보 목록" className="flex flex-col gap-4">
          {!isLoaded ? (
            <>
              <VideoCardSkeleton />
              <VideoCardSkeleton />
            </>
          ) : videos.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="아직 저장한 영상이 없어요"
              description="YouTube에서 보고 싶은 영상을 발견하면 링크를 복사해 위에 붙여넣어 보세요."
            />
          ) : (
            <ul className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
              {videos.map((video) => (
                <li key={video.id}>
                  <VideoCard
                    video={video}
                    isToday={today.selection?.videoId === video.id}
                    onSelectToday={handleSelectToday}
                    onRemove={handleRemove}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
