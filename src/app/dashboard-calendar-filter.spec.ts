import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DSWD_ATTENTION_REQUESTS } from './dswd-admin/dswd-request.data';

describe('dashboard calendar filter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('admin shows every request until a range is chosen', () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance;

    expect(cmp.filteredRequests.length).toBe(cmp.requests.length);
    expect(cmp.hasFilter).toBe(false);
  });

  it('admin narrows to the selected range, including both ends', () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance;

    cmp.dateRange = [new Date(2026, 8, 14), new Date(2026, 8, 16)];

    expect(cmp.filteredRequests.map(r => r.id)).toEqual([
      'BL-000302',
      'BL-000301',
      'BL-000298',
      'BL-000295'
    ]);
    expect(cmp.hasFilter).toBe(true);
  });

  it('admin can bound only one side of the range', () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance;

    cmp.dateRange = [new Date(2026, 8, 15)];

    expect(cmp.filteredRequests.map(r => r.id)).toEqual([
      'BL-000302',
      'BL-000301',
      'BL-000298'
    ]);
  });

  it('admin clears back to the full list', () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance;

    cmp.dateRange = [new Date(2026, 8, 16)];
    expect(cmp.filteredRequests.length).toBeLessThan(cmp.requests.length);

    cmp.clearFilter();

    expect(cmp.filteredRequests.length).toBe(cmp.requests.length);
    expect(cmp.hasFilter).toBe(false);
  });

  it('admin keeps the shared row count when unfiltered', () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance;

    expect(cmp.requests.length).toBe(5);
  });

  it('DSWD dashboard filters on its display dates', () => {
    const cmp = TestBed.createComponent(DswdDashboardComponent).componentInstance;

    expect(cmp.filteredRequests.length).toBe(DSWD_ATTENTION_REQUESTS.length);

    cmp.dateRange = [new Date(2026, 8, 14)];

    expect(cmp.filteredRequests.map(r => r.id)).toEqual([
      'BL-000234',
      'BL-000302',
      'BL-000280'
    ]);
    expect(cmp.hasFilter).toBe(true);
  });

  it('DSWD "Review All" respects the active filter', () => {
    const cmp = TestBed.createComponent(DswdDashboardComponent).componentInstance;
    const review = vi.spyOn(cmp, 'reviewRequest');

    // Only BL-000220 sits on Sep 12, so Review All should target that row.
    cmp.dateRange = [new Date(2026, 8, 12), new Date(2026, 8, 12)];

    cmp.reviewAll();

    expect(review).toHaveBeenCalledWith('BL-000220');
  });
});
