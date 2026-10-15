import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

import { NotificationBellComponent } from '../../notification/notification-bell.component';
import { dateToIso, inDateRange } from '../../date-filter.util';
import {
  DSWD_ATTENTION_REQUESTS,
  DswdRequest,
  DswdStatus,
  DswdStatusBadge,
  priorityClass,
  statusBadge
} from '../dswd-request.data';

@Component({
  selector: 'app-dswd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    Button,
    RouterLink,
    NotificationBellComponent
  ],
  templateUrl: './dswd-dashboard.component.html',
  styleUrl: './dswd-dashboard.component.scss'
})
export class DswdDashboardComponent {

  readonly requests: readonly DswdRequest[] = DSWD_ATTENTION_REQUESTS;

  /** System-wide count, shown on the stat card and the sidebar badge. */
  readonly requestsForAttention = 15;

  /** Calendar filter, as picked in the PrimeNG range datepicker. */
  dateRange: Date[] | null = null;

  constructor(private router: Router) {}

  /** Requests inside the selected date range (all of them by default). */
  get filteredRequests(): readonly DswdRequest[] {
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

  priorityClass(priority: DswdRequest['priority']): string {
    return priorityClass(priority);
  }

  statusBadge(status: DswdStatus): DswdStatusBadge {
    return statusBadge(status);
  }

  reviewRequest(id: string): void {
    this.router.navigate(['/dswd/review', id]);
  }

  /** Opens the review page for the highest-priority request still waiting. */
  reviewAll(): void {
    const next = this.filteredRequests[0];

    if (next) {
      this.reviewRequest(next.id);
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
