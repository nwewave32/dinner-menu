import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** 시각적으로 라벨을 숨기고 스크린리더에만 노출 */
  hideLabel?: boolean;
  errorMessage?: string | null;
}

export function Input({
  label,
  hideLabel = false,
  errorMessage = null,
  className = "",
  id,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hasError = errorMessage !== null && errorMessage.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={hideLabel ? "sr-only" : "text-sm font-medium text-ink-300"}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={`min-h-12 w-full rounded-xl border bg-night-800 px-4 text-base text-ink-100 placeholder:text-ink-500 transition-colors ${
          hasError
            ? "border-danger-400"
            : "border-night-600 hover:border-night-600/80 focus:border-ember-400"
        } ${className}`}
        {...rest}
      />
      {hasError && (
        <p id={errorId} role="alert" className="text-sm text-danger-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
