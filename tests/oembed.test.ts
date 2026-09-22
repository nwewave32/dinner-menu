import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchVideoMetadata } from "@/lib/youtube/oembed";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("fetchVideoMetadata", () => {
  it("정상 응답에서 제목/채널/썸네일을 반환한다", async () => {
    stubFetch(async () =>
      new Response(
        JSON.stringify({
          title: "우주에 관한 다큐",
          author_name: "BBC",
          thumbnail_url: "https://i.ytimg.com/vi/x/hqdefault.jpg",
          provider_name: "YouTube",
        }),
        { status: 200 },
      ),
    );
    const result = await fetchVideoMetadata("dQw4w9WgXcQ");
    expect(result).toEqual({
      ok: true,
      data: {
        title: "우주에 관한 다큐",
        channel: "BBC",
        thumbnailUrl: "https://i.ytimg.com/vi/x/hqdefault.jpg",
      },
    });
  });

  it("404(삭제/비공개 영상)는 not_found를 반환한다", async () => {
    stubFetch(async () => new Response("Not Found", { status: 404 }));
    const result = await fetchVideoMetadata("gone12345678".slice(0, 11));
    expect(result).toEqual({ ok: false, error: "not_found" });
  });

  it("네트워크 실패는 network를 반환한다", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    const result = await fetchVideoMetadata("dQw4w9WgXcQ");
    expect(result).toEqual({ ok: false, error: "network" });
  });

  it("응답 형식이 다르면 invalid_response를 반환한다", async () => {
    stubFetch(async () =>
      new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
    );
    const result = await fetchVideoMetadata("dQw4w9WgXcQ");
    expect(result).toEqual({ ok: false, error: "invalid_response" });
  });

  it("JSON이 아닌 응답도 invalid_response로 처리한다", async () => {
    stubFetch(async () => new Response("<html>oops</html>", { status: 200 }));
    const result = await fetchVideoMetadata("dQw4w9WgXcQ");
    expect(result).toEqual({ ok: false, error: "invalid_response" });
  });
});
