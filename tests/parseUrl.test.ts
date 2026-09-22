import { describe, expect, it } from "vitest";
import { parseYouTubeUrl } from "@/lib/youtube/parseUrl";

const ID = "dQw4w9WgXcQ";

describe("parseYouTubeUrl", () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`http://www.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abcdef`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/live/${ID}`],
    [`https://www.youtube.com/watch?v=${ID}&t=120s&list=PL123`],
    [`www.youtube.com/watch?v=${ID}`],
    [`youtu.be/${ID}`],
    [`  https://youtu.be/${ID}  `],
  ])("유효한 URL에서 ID 추출: %s", (url) => {
    expect(parseYouTubeUrl(url)).toBe(ID);
  });

  it.each([
    [""],
    ["   "],
    ["not a url"],
    ["https://vimeo.com/12345678"],
    ["https://www.youtube.com/"],
    ["https://www.youtube.com/watch"],
    ["https://www.youtube.com/watch?v="],
    ["https://www.youtube.com/watch?v=tooshort"],
    ["https://www.youtube.com/watch?v=way_too_long_id_123"],
    ["https://youtu.be/"],
    ["https://fake-youtube.com/watch?v=" + ID],
    ["ftp://youtube.com/watch?v=" + ID],
    ["https://www.youtube.com/@somechannel"],
    ["https://www.youtube.com/playlist?list=PL123"],
  ])("잘못된 입력은 null: %s", (url) => {
    expect(parseYouTubeUrl(url)).toBeNull();
  });

  it("예외를 던지지 않는다", () => {
    expect(() => parseYouTubeUrl("::::")).not.toThrow();
  });
});
