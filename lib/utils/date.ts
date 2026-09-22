/** 로컬 타임존 기준 "YYYY-MM-DD" 문자열. 오늘의 영상 롤오버 판정에 사용한다. */
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
