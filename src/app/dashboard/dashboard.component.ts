import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { ApiOffer, ApiRequest, ApiService } from '../api/api.service';
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

export interface DashboardStats {
  totalRequests: number;
  pendingValidation: number;
  criticalRequests: number;
  activeAssistance: number;
  completed: number;
  donationOffers: number;
}

const EMPTY_STATS: DashboardStats = {
  totalRequests: 0,
  pendingValidation: 0,
  criticalRequests: 0,
  activeAssistance: 0,
  completed: 0,
  donationOffers: 0
};

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
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  requests: DashboardRequest[] = [];
  stats: DashboardStats = { ...EMPTY_STATS };
  loading = true;

  /** Calendar filter, as picked in the PrimeNG range datepicker. */
  dateRange: Date[] | null = null;

  async ngOnInit(): Promise<void> {
    // Keep rows that a test (or a parent) already supplied.
    if (this.requests.length === 0) {
      await this.loadDashboard();
    }
  }

  private async loadDashboard(): Promise<void> {
    this.loading = true;

    try {
      const [requests, offers] = await Promise.all([
        this.api.getRequests(),
        this.api.getAllOffers()
      ]);

      this.requests = requests.map(request => this.toRequestRow(request));
      this.stats = this.buildStats(requests, offers);
    } catch {
      this.requests = [];
      this.stats = { ...EMPTY_STATS };
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  private toRequestRow(request: ApiRequest): DashboardRequest {
    const statusMap: Record<string, DashboardRequest['status']> = {
      PENDING: 'Pending',
      VERIFIED: 'Verified',
      ASSISTED: 'Assisted',
      COMPLETED: 'Completed'
    };

    return {
      id: request.referenceNo || request.id,
      requester: request.requesterName || request.userId,
      disaster: request.disasterType,
      category: request.category,
      location: request.location,
      priority: request.urgency,
      status: statusMap[request.status] ?? 'Pending',
      date: new Date(request.dateSubmitted).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };
  }

  private buildStats(requests: ApiRequest[], offers: ApiOffer[]): DashboardStats {
    return {
      totalRequests: requests.length,
      pendingValidation: requests.filter(request => request.status === 'PENDING').length,
      criticalRequests: requests.filter(request => request.urgency === 'CRITICAL').length,
      activeAssistance: requests.filter(
        request => request.status === 'VERIFIED' || request.status === 'ASSISTED'
      ).length,
      completed: requests.filter(request => request.status === 'COMPLETED').length,
      donationOffers: offers.length
    };
  }

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
