interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-night-700 ${className}`}
    />
  );
}

/** 영상 카드 모양의 스켈레톤 */
export function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-night-700 bg-night-800">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
