"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { parseYouTubeUrl } from "@/lib/youtube/parseUrl";
import {
  fetchVideoMetadata,
  OEMBED_ERROR_MESSAGES,
} from "@/lib/youtube/oembed";
import type { AddVideoResult } from "@/lib/storage/repository";
import type { VideoMetadata } from "@/lib/youtube/oembed";

interface AddVideoFormProps {
  onAdd: (youtubeVideoId: string, metadata: VideoMetadata) => AddVideoResult;
}

export function AddVideoForm({ onAdd }: AddVideoFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (url.trim().length === 0) {
      setError("YouTube URL을 입력해 주세요.");
      return;
    }

    const youtubeVideoId = parseYouTubeUrl(url);
    if (youtubeVideoId === null) {
      setError("올바른 YouTube 영상 주소가 아니에요. 다시 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);
    const metadata = await fetchVideoMetadata(youtubeVideoId);
    setIsSubmitting(false);

    if (!metadata.ok) {
      setError(OEMBED_ERROR_MESSAGES[metadata.error]);
      return;
    }

    const result = onAdd(youtubeVideoId, metadata.data);
    if (!result.ok) {
      setError("이미 후보 목록에 있는 영상이에요.");
      return;
    }

    setUrl("");
    showToast("후보 목록에 추가했어요");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <Input
          label="YouTube URL"
          hideLabel
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          errorMessage={error}
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>
      <Button type="submit" loading={isSubmitting} className="sm:min-w-28">
        영상 추가
      </Button>
    </form>
  );
}
