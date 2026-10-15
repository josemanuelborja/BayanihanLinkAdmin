// BayanihanLink — shared date helpers for the dashboard calendar filters.
//
// Request dates are stored as display strings such as "Sep 16, 2026", while
// the <input type="date"> controls produce ISO strings ("2026-09-16"). Both
// are normalised to ISO here so a range check is a plain string comparison.
// Doing it this way avoids the timezone drift you get from Date.parse() on
// a bare "yyyy-mm-dd", which is parsed as UTC and can shift the day.

const MONTHS: Readonly<Record<string, string>> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12'
};

/** Normalises "Sep 16, 2026" (or an already-ISO value) to "2026-09-16". */
export function toIsoDate(value: string): string {
  const trimmed = (value || '').trim();

  const display = /^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})$/.exec(trimmed);

  if (display) {
    const month = MONTHS[display[1].toLowerCase()];

    if (month) {
      return `${display[3]}-${month}-${display[2].padStart(2, '0')}`;
    }
  }

  return trimmed;
}

/**
 * True when `date` falls inside the inclusive [from, to] range. An empty
 * bound means "no limit on that side", so an untouched filter matches all.
 */
export function inDateRange(date: string, from: string, to: string): boolean {
  const iso = toIsoDate(date);

  if (from && iso < from) {
    return false;
  }

  if (to && iso > to) {
    return false;
  }

  return true;
}

/** Formats a Date as a local "yyyy-mm-dd", avoiding the UTC shift of toISOString(). */
export function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
