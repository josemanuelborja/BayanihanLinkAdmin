import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../../notification/notification-bell.component';
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
  imports: [CommonModule, RouterLink, NotificationBellComponent],
  templateUrl: './dswd-dashboard.component.html',
  styleUrl: './dswd-dashboard.component.scss'
})
export class DswdDashboardComponent {

  readonly requests: readonly DswdRequest[] = DSWD_ATTENTION_REQUESTS;

  /** System-wide count, shown on the stat card and the sidebar badge. */
  readonly requestsForAttention = 15;

  constructor(private router: Router) {}

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
    const next = this.requests[0];

    if (next) {
      this.reviewRequest(next.id);
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}