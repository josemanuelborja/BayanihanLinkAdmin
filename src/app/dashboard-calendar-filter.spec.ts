import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { DashboardComponent } from './dashboard/dashboard.component';

const ADMIN_REQUEST_FIXTURES = [
  { id: 'BL-000302', requester: 'Ana', disaster: 'Typhoon', category: 'Food', location: 'CDO', priority: 'CRITICAL' as const, status: 'Pending' as const, date: '2026-09-16' },
  { id: 'BL-000301', requester: 'Juan', disaster: 'Flood', category: 'Water', location: 'Iligan', priority: 'URGENT' as const, status: 'Pending' as const, date: '2026-09-16' },
  { id: 'BL-000298', requester: 'Rosa', disaster: 'Fire', category: 'Clothing', location: 'Davao', priority: 'NORMAL' as const, status: 'Verified' as const, date: '2026-09-15' },
  { id: 'BL-000295', requester: 'Pedro', disaster: 'Typhoon', category: 'Medicine', location: 'Butuan', priority: 'URGENT' as const, status: 'Assisted' as const, date: '2026-09-14' },
  { id: 'BL-000290', requester: 'Maria', disaster: 'Earthquake', category: 'Blankets', location: 'Surigao', priority: 'NORMAL' as const, status: 'Completed' as const, date: '2026-09-12' }
];

function adminDashboard() {
  const component = TestBed.createComponent(DashboardComponent).componentInstance;
  (component as any).requests = ADMIN_REQUEST_FIXTURES;
  return component;
}

describe('dashboard calendar filter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('admin shows every request until a range is chosen', () => {
    const cmp = adminDashboard();

    expect(cmp.filteredRequests.length).toBe(cmp.requests.length);
    expect(cmp.hasFilter).toBe(false);
  });

  it('admin narrows to the selected range, including both ends', () => {
    const cmp = adminDashboard();

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
    const cmp = adminDashboard();

    cmp.dateRange = [new Date(2026, 8, 15)];

    expect(cmp.filteredRequests.map(r => r.id)).toEqual([
      'BL-000302',
      'BL-000301',
      'BL-000298'
    ]);
  });

  it('admin clears back to the full list', () => {
    const cmp = adminDashboard();

    cmp.dateRange = [new Date(2026, 8, 16)];
    expect(cmp.filteredRequests.length).toBeLessThan(cmp.requests.length);

    cmp.clearFilter();

    expect(cmp.filteredRequests.length).toBe(cmp.requests.length);
    expect(cmp.hasFilter).toBe(false);
  });

  it('admin keeps the shared row count when unfiltered', () => {
    const cmp = adminDashboard();

    expect(cmp.requests.length).toBe(5);
  });

});
