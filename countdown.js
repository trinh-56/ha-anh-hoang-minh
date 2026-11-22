// Ceremony/reception start: 17/12/2026 11:30, Asia/Ho_Chi_Minh (UTC+7)
export const TARGET = Date.UTC(2026, 11, 17, 4, 30);

export function countdownParts(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
