/** crypto.randomUUID 사용, 미지원 환경(구형 브라우저)만 폴백. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
