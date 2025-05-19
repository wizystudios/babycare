
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function calculateDuration(startTime: Date, endTime?: Date): number {
  if (!endTime) return 0;
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function getRelativeTimeLabel(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return formatDateShort(date);
  }
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return formatDateShort(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

export function getAgeInMonths(birthDate: Date): number {
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
}

export function getAgeDisplay(birthDate: Date): string {
  const months = getAgeInMonths(birthDate);
  if (months < 1) {
    // Calculate days
    const oneDay = 24 * 60 * 60 * 1000;
    const days = Math.round(Math.abs((new Date().getTime() - birthDate.getTime()) / oneDay));
    return `${days} days`;
  } else if (months < 24) {
    return `${months} months`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} years`;
    }
    return `${years}y ${remainingMonths}m`;
  }
}
