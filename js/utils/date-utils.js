/** Date helpers use local calendar dates for unlock dates and display. */
export function isDateReached(isoDate, now = new Date()) {
  if (!isoDate) return true;
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return true;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parsed <= today;
}

export function formatDate(isoDate, options = {}) {
  if (!isoDate) return "";
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric", month: "short", day: "numeric", ...options,
  }).format(parsed);
}
