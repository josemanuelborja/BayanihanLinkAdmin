import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../../notification/notification-bell.component';
import { NotificationService } from '../../notification/notification.service';
import {
  DSWD_STATUSES,
  DswdRequest,
  DswdStatus,
  DswdStatusBadge,
  findDswdRequest,
  priorityClass,
  statusBadge
} from '../dswd-request.data';

@Component({
  selector: 'app-dswd-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationBellComponent],
  templateUrl: './dswd-review.component.html',
  styleUrl: './dswd-review.component.scss'
})
export class DswdReviewComponent {

  /**
   * Undefined only before the route params arrive; unknown ids are turned
   * away by dswdRequestExistsGuard before this component is built.
   */
  request?: DswdRequest;

  status: DswdStatus = 'Submitted for Verification';

  readonly statuses = DSWD_STATUSES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.route.paramMap.subscribe(params => {
      const found = findDswdRequest(params.get('id'));

      if (!found) return;

      this.request = found;
      this.status = found.status;
    });
  }

  /** Kept for the sidebar link, which points back at the open request. */
  get requestId(): string {
    return this.request?.id ?? '';
  }

  priorityClass(priority: DswdRequest['priority']): string {
    return priorityClass(priority);
  }

  statusBadge(status: DswdStatus): DswdStatusBadge {
    return statusBadge(status);
  }

  updateStatus(): void {
    if (!this.request) return;

    // Written back to the shared record so the dashboard table and the
    // status tracker show the new stage until the page is reloaded.
    this.request.status = this.status;
    this.notifications.success(
      `Request #${this.request.id} updated to ${this.status}.`
    );

    // Also filed in the bell inbox, so the change is still there after the
    // toast fades.
    this.notifications.notify({
      type: 'success',
      category: 'request',
      title: `Status updated · ${this.status}`,
      message:
        `#${this.request.id} · ${this.request.disasterType} · ` +
        `${this.request.item} · ${this.request.location}`
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/dswd/dashboard']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}