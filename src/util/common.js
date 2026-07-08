// 디데이
export function getDday(endDate) {
  if (!endDate) return null;

  const [year, month, day] = endDate.split("-").map(Number);
  const end = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays === 0) return "D-DAY";
  return `D-${diffDays}`;
}

// 2024.02.01 => 2.1
export function formatMonthDay(dateString) {
  if (!dateString) return "";
  const [, month, day] = dateString.split("-").map(Number);
  return `${month}.${day}`;
}
