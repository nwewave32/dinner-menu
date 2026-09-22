import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddVideoForm } from "@/components/video/AddVideoForm";
import { ToastProvider } from "@/components/ui/Toast";
import { addVideo } from "@/lib/storage/repository";

const VALID_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubOEmbedSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          title: "우주에 관한 다큐",
          author_name: "BBC",
          thumbnail_url: "https://i.ytimg.com/vi/x/hqdefault.jpg",
        }),
        { status: 200 },
      ),
    ),
  );
}

function renderForm() {
  const handleAdd = vi.fn((youtubeVideoId: string, metadata) =>
    addVideo(youtubeVideoId, metadata),
  );
  render(
    <ToastProvider>
      <AddVideoForm onAdd={handleAdd} />
    </ToastProvider>,
  );
  return { handleAdd };
}

describe("AddVideoForm", () => {
  it("정상 URL을 입력하면 영상이 추가되고 토스트가 뜬다", async () => {
    stubOEmbedSuccess();
    const user = userEvent.setup();
    const { handleAdd } = renderForm();

    await user.type(screen.getByLabelText("YouTube URL"), VALID_URL);
    await user.click(screen.getByRole("button", { name: "영상 추가" }));

    expect(handleAdd).toHaveBeenCalledWith("dQw4w9WgXcQ", {
      title: "우주에 관한 다큐",
      channel: "BBC",
      thumbnailUrl: "https://i.ytimg.com/vi/x/hqdefault.jpg",
    });
    expect(await screen.findByText("후보 목록에 추가했어요")).toBeInTheDocument();
    // 성공 후 입력창 초기화
    expect(screen.getByLabelText("YouTube URL")).toHaveValue("");
  });

  it("빈 입력은 에러 메시지를 보여주고 fetch하지 않는다", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "영상 추가" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "YouTube URL을 입력해 주세요.",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("잘못된 URL은 검증 에러를 보여준다", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText("YouTube URL"),
      "https://vimeo.com/1234",
    );
    await user.click(screen.getByRole("button", { name: "영상 추가" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "올바른 YouTube 영상 주소가 아니에요",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("oEmbed 실패(비공개/삭제)를 사용자 메시지로 보여준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("YouTube URL"), VALID_URL);
    await user.click(screen.getByRole("button", { name: "영상 추가" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "영상 정보를 가져올 수 없어요",
    );
  });

  it("중복 영상은 추가되지 않고 안내한다", async () => {
    stubOEmbedSuccess();
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByLabelText("YouTube URL");
    await user.type(input, VALID_URL);
    await user.click(screen.getByRole("button", { name: "영상 추가" }));
    await screen.findByText("후보 목록에 추가했어요");

    await user.type(input, VALID_URL);
    await user.click(screen.getByRole("button", { name: "영상 추가" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "이미 후보 목록에 있는 영상이에요.",
    );
  });
});
