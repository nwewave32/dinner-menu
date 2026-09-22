import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WatchPage from "@/app/watch/page";
import {
  addVideo,
  getTodaySelection,
  listSessions,
  selectToday,
} from "@/lib/storage/repository";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// 실제 IFrame API 대신, ready/ENDED/에러를 버튼으로 트리거할 수 있는 목 플레이어
vi.mock("@/components/player/YouTubePlayer", () => ({
  YouTubePlayer: ({
    onReady,
    onEnded,
    onError,
  }: {
    onReady?: () => void;
    onEnded: () => void;
    onError: (kind: "embed_blocked") => void;
  }) => (
    <div data-testid="mock-player">
      <button onClick={() => onReady?.()}>mock-ready</button>
      <button onClick={() => onEnded()}>mock-ended</button>
      <button onClick={() => onError("embed_blocked")}>mock-error</button>
    </div>
  ),
}));

function seedTodayVideo(): string {
  const added = addVideo("dQw4w9WgXcQ", {
    title: "우주에 관한 다큐",
    channel: "BBC",
    thumbnailUrl: "https://i.ytimg.com/vi/x/hqdefault.jpg",
  });
  if (!added.ok) throw new Error("시드 실패");
  selectToday(added.video.id);
  return added.video.id;
}

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockClear();
});

describe("재생 화면", () => {
  it("오늘의 영상이 없으면 홈 유도 빈 상태를 보여준다", async () => {
    render(<WatchPage />);
    expect(
      await screen.findByText("오늘 볼 영상이 없어요"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("mock-player")).not.toBeInTheDocument();
  });

  it("오늘의 영상이 있으면 플레이어와 제목을 보여준다", async () => {
    seedTodayVideo();
    render(<WatchPage />);
    expect(await screen.findByTestId("mock-player")).toBeInTheDocument();
    expect(screen.getByText("우주에 관한 다큐")).toBeInTheDocument();
  });

  it("ENDED가 발생하면 종료 화면으로 전환되고 완료가 기록된다", async () => {
    const videoId = seedTodayVideo();
    const user = userEvent.setup();
    render(<WatchPage />);

    await user.click(await screen.findByText("mock-ready"));
    await user.click(screen.getByText("mock-ended"));

    // 종료 화면: 탐색 요소 없이 완료 버튼만
    expect(
      await screen.findByText("오늘의 영상이 끝났습니다"),
    ).toBeInTheDocument();
    expect(screen.getByText("오늘은 여기까지.")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-player")).not.toBeInTheDocument();

    // 저장소 검증: 오늘 완료 + 세션 완료
    expect(getTodaySelection()?.completedAt).not.toBeNull();
    const session = listSessions().find((s) => s.videoId === videoId);
    expect(session?.completed).toBe(true);
  });

  it("완료 버튼을 누르면 홈으로 이동한다", async () => {
    seedTodayVideo();
    const user = userEvent.setup();
    render(<WatchPage />);

    await user.click(await screen.findByText("mock-ready"));
    await user.click(screen.getByText("mock-ended"));
    await user.click(await screen.findByRole("button", { name: "완료" }));

    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("이미 완료한 날 재진입하면 플레이어 대신 종료 화면을 보여준다", async () => {
    seedTodayVideo();
    const user = userEvent.setup();
    const first = render(<WatchPage />);
    await user.click(await screen.findByText("mock-ready"));
    await user.click(screen.getByText("mock-ended"));
    first.unmount();

    render(<WatchPage />);
    expect(
      await screen.findByText("오늘의 영상이 끝났습니다"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("mock-player")).not.toBeInTheDocument();
  });

  it("임베드가 차단된 영상은 에러 상태를 보여준다", async () => {
    seedTodayVideo();
    const user = userEvent.setup();
    render(<WatchPage />);

    await user.click(await screen.findByText("mock-error"));

    expect(
      await screen.findByText("재생에 문제가 생겼어요"),
    ).toBeInTheDocument();
    expect(screen.getByText(/외부 재생을 막아두어/)).toBeInTheDocument();
  });

  it("중간 이탈 시 세션은 미완료로 남는다", async () => {
    const videoId = seedTodayVideo();
    const user = userEvent.setup();
    const view = render(<WatchPage />);

    await user.click(await screen.findByText("mock-ready"));
    view.unmount(); // ENDED 없이 이탈

    const session = listSessions().find((s) => s.videoId === videoId);
    expect(session?.completed).toBe(false);
    expect(getTodaySelection()?.completedAt).toBeNull();
  });
});
