"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.home, label: "오늘" },
  { href: ROUTES.queue, label: "저녁 후보" },
] as const;

/**
 * 홈/후보 목록에서만 쓰는 상단 헤더.
 * 재생 화면(/watch)에는 의도적으로 내비게이션을 두지 않는다 (PRD 10장).
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pb-2 pt-6">
      <Link
        href={ROUTES.home}
        className="rounded-lg text-lg font-bold tracking-tight text-ink-100"
      >
        <span aria-hidden className="mr-1.5">
          🌙
        </span>
        {APP_NAME}
      </Link>
      <nav aria-label="주요 메뉴" className="flex gap-1 rounded-full bg-night-800 p-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-night-600 text-ink-100"
                  : "text-ink-500 hover:text-ink-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
