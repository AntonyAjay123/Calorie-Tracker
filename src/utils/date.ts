function formatYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return formatYMD(new Date());
}

export function addDays(dateString: string, delta: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return formatYMD(new Date(year, month - 1, day + delta));
}

export function isToday(dateString: string): boolean {
  return dateString === todayDateString();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateLabel(dateString: string): string {
  if (isToday(dateString)) return 'Today';
  if (dateString === addDays(todayDateString(), -1)) return 'Yesterday';

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
