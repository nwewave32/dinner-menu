import { z } from "zod";

/**
 * YouTube oEmbed로 영상 메타데이터(제목/채널/썸네일)를 가져온다.
 * API 키가 필요 없고 CORS가 허용되어 있어 클라이언트에서 직접 호출한다.
 * 영상 길이(duration)는 제공하지 않는다 — v0.1 결정 사항.
 */

const OEMBED_ENDPOINT = "https://www.youtube.com/oembed";

const oembedResponseSchema = z.object({
  title: z.string(),
  author_name: z.string(),
  thumbnail_url: z.string().url(),
});

export interface VideoMetadata {
  title: string;
  channel: string;
  thumbnailUrl: string;
}

export type OEmbedError = "not_found" | "network" | "invalid_response";

export type OEmbedResult =
  | { ok: true; data: VideoMetadata }
  | { ok: false; error: OEmbedError };

export const OEMBED_ERROR_MESSAGES: Record<OEmbedError, string> = {
  not_found:
    "영상 정보를 가져올 수 없어요. 비공개이거나 삭제된 영상일 수 있어요.",
  network: "네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
  invalid_response: "영상 정보를 읽는 데 실패했어요. 다시 시도해 주세요.",
};

export async function fetchVideoMetadata(
  youtubeVideoId: string,
): Promise<OEmbedResult> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
  const requestUrl = `${OEMBED_ENDPOINT}?url=${encodeURIComponent(watchUrl)}&format=json`;

  let response: Response;
  try {
    response = await fetch(requestUrl);
  } catch {
    return { ok: false, error: "network" };
  }

  if (!response.ok) {
    // 400/401/404: 비공개, 삭제, 존재하지 않는 영상
    return { ok: false, error: "not_found" };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { ok: false, error: "invalid_response" };
  }

  const parsed = oembedResponseSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "invalid_response" };
  }

  return {
    ok: true,
    data: {
      title: parsed.data.title,
      channel: parsed.data.author_name,
      thumbnailUrl: parsed.data.thumbnail_url,
    },
  };
}
