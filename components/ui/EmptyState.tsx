import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-3 px-6 py-16 text-center">
      {icon && (
        <span aria-hidden className="text-4xl">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold text-ink-100">{title}</h2>
      {description && (
        <p className="max-w-xs text-sm leading-relaxed text-ink-500">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
