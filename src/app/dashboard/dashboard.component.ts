import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { dateToIso, inDateRange } from '../date-filter.util';
import { DonationOffersOverviewComponent } from './donation-offers-overview/donation-offers-overview.component';
import { RequestsByPriorityComponent } from './requests-by-priority/requests-by-priority.component';
import { RequestsByStatusComponent } from './requests-by-status/requests-by-status.component';
import { RequestsByDisasterTypeComponent } from './requests-by-disaster-type/requests-by-disaster-type.component';
import { RecentRequestsComponent } from './recent-requests/recent-requests.component';
import { RecentDonationOffersComponent } from './recent-donation-offers/recent-donation-offers.component';

export interface DashboardRequest {
  id: string;
  requester: string;
  disaster: string;
  category: string;
  location: string;
  priority: 'CRITICAL' | 'URGENT' | 'NORMAL';
  status: 'Pending' | 'Verified' | 'Assisted' | 'Completed';
  /** Display date, e.g. "Sep 16, 2026". Parsed by the calendar filter. */
  date: string;
}

const DASHBOARD_REQUESTS: readonly DashboardRequest[] = [
  {
    id: 'BL-000302',
    requester: 'Ana Reyes',
    disaster: 'Typhoon',
    category: 'Food',
    location: 'CDO City',
    priority: 'CRITICAL',
    status: 'Pending',
    date: 'Sep 16, 2026'
  },
  {
    id: 'BL-000301',
    requester: 'Juan Dela Cruz',
    disaster: 'Flood',
    category: 'Water',
    location: 'Iligan City',
    priority: 'URGENT',
    status: 'Pending',
    date: 'Sep 16, 2026'
  },
  {
    id: 'BL-000298',
    requester: 'Rosa Gomez',
    disaster: 'Fire',
    category: 'Clothing',
    location: 'Davao City',
    priority: 'NORMAL',
    status: 'Verified',
    date: 'Sep 15, 2026'
  },
  {
    id: 'BL-000295',
    requester: 'Pedro Santos',
    disaster: 'Typhoon',
    category: 'Medicine',
    location: 'Butuan City',
    priority: 'URGENT',
    status: 'Assisted',
    date: 'Sep 14, 2026'
  },
  {
    id: 'BL-000290',
    requester: 'Maria Lopez',
    disaster: 'Earthquake',
    category: 'Blankets',
    location: 'Surigao del Norte',
    priority: 'NORMAL',
    status: 'Completed',
    date: 'Sep 12, 2026'
  }
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    AdminSidebarComponent,
    AdminUserBadgeComponent,
    NotificationBellComponent,
    RequestsByStatusComponent,
    RequestsByPriorityComponent,
    RequestsByDisasterTypeComponent,
    DonationOffersOverviewComponent,
    RecentRequestsComponent,
    RecentDonationOffersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly router = inject(Router);

  readonly requests: readonly DashboardRequest[] = DASHBOARD_REQUESTS;

  /** Calendar filter, as picked in the PrimeNG range datepicker. */
  dateRange: Date[] | null = null;

  constructor() {}

  /** Requests inside the selected date range (all of them by default). */
  get filteredRequests(): readonly DashboardRequest[] {
    const from = this.dateRange?.[0] ? dateToIso(this.dateRange[0]) : '';
    const to = this.dateRange?.[1] ? dateToIso(this.dateRange[1]) : '';

    return this.requests.filter(request =>
      inDateRange(request.date, from, to)
    );
  }

  get hasFilter(): boolean {
    return !!this.dateRange && this.dateRange.length > 0;
  }

  clearFilter(): void {
    this.dateRange = null;
  }

  priorityClass(priority: DashboardRequest['priority']): string {
    return 'priority-' + priority.toLowerCase();
  }

  statusClass(status: DashboardRequest['status']): string {
    return 'status-' + status.toLowerCase();
  }

  reviewRequest(id: string): void {
    this.router.navigate([
      '/request-review',
      id.replace(/^#/, '')
    ]);
  }
}
