import type { HTMLAttributes } from "react";

/** 공통 카드 컨테이너. 배경/테두리/라운딩을 일관되게 유지한다. */
export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-night-700 bg-night-800 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
