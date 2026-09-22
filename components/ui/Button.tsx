import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ember-500 text-night-950 font-semibold hover:bg-ember-400 active:bg-ember-600",
  secondary:
    "bg-night-700 text-ink-100 border border-night-600 hover:bg-night-600",
  ghost: "bg-transparent text-ink-300 hover:bg-night-700 hover:text-ink-100",
  danger: "bg-transparent text-danger-400 hover:bg-danger-500/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-13 px-6 text-base",
};

/** 터치 타깃 44px 이상을 보장하는 공통 버튼. */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
