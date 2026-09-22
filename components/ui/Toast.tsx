"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TOAST_DURATION_MS } from "@/lib/constants";

type ToastTone = "default" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const showToast = useCallback((message: string, tone: ToastTone = "default") => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-fade-up max-w-sm rounded-full px-5 py-3 text-sm font-medium shadow-lg ${
              toast.tone === "error"
                ? "bg-danger-500 text-white"
                : "bg-ink-100 text-night-950"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
