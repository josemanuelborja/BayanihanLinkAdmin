import { dateToIso, inDateRange, toIsoDate } from './date-filter.util';

describe('date filter helpers', () => {
  it('normalises a display date to ISO', () => {
    expect(toIsoDate('Sep 16, 2026')).toBe('2026-09-16');
    expect(toIsoDate('Sep 6, 2026')).toBe('2026-09-06');
    expect(toIsoDate('Jan 1, 2027')).toBe('2027-01-01');
  });

  it('leaves an already-ISO value alone', () => {
    expect(toIsoDate('2026-09-16')).toBe('2026-09-16');
  });

  it('formats a picked Date as a local ISO day', () => {
    // Month is zero-based; the date must not shift across timezones.
    expect(dateToIso(new Date(2026, 8, 16))).toBe('2026-09-16');
    expect(dateToIso(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('treats an empty bound as no limit', () => {
    expect(inDateRange('Sep 16, 2026', '', '')).toBe(true);
    expect(inDateRange('Sep 16, 2026', '2026-09-01', '')).toBe(true);
    expect(inDateRange('Sep 16, 2026', '', '2026-09-30')).toBe(true);
  });

  it('includes both ends of the range', () => {
    expect(inDateRange('Sep 16, 2026', '2026-09-16', '2026-09-16')).toBe(true);
    expect(inDateRange('Sep 16, 2026', '2026-09-14', '2026-09-16')).toBe(true);
  });

  it('excludes dates outside the range', () => {
    expect(inDateRange('Sep 16, 2026', '2026-09-17', '')).toBe(false);
    expect(inDateRange('Sep 16, 2026', '', '2026-09-15')).toBe(false);
    expect(inDateRange('Sep 12, 2026', '2026-09-14', '2026-09-16')).toBe(false);
  });
});
