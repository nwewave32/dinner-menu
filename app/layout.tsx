import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — 오늘은 하나만`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "저녁 식사 중 미리 골라둔 YouTube 영상 하나만 보고 끝내는 개인용 영상 큐.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
