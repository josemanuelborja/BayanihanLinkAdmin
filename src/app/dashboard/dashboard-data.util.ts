// Small helpers shared by the dashboard chart services.

export function periodLabel(month: number | null, year: number | null): string {
  if (month === null || year === null) {
    return 'All time';
  }

  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

// The chart filter sends months 1-12, while JavaScript uses 0-11.
export function matchesPeriod(dateValue: string, month: number | null, year: number | null): boolean {
  if (month === null || year === null) {
    return true;
  }

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    return false;
  }

  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

export function monthKey(dateValue: string): string {
  const date = new Date(dateValue);
  return date.getUTCFullYear() + '-' + date.getUTCMonth();
}

export function lastMonthPoints(count: number): Array<{ key: string; date: string }> {
  const now = new Date();
  const points: Array<{ key: string; date: string }> = [];

  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1, 12));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    points.push({
      key: year + '-' + month,
      date: year + '-' + String(month + 1).padStart(2, '0') + '-01T12:00:00.000Z'
    });
  }

  return points;
}
