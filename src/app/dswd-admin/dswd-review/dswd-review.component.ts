import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

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
  imports: [CommonModule, FormsModule, ButtonModule, RouterLink, NotificationBellComponent],
  templateUrl: './dswd-review.component.html',
  styleUrl: './dswd-review.component.scss'
})
export class DswdReviewComponent {

  request: DswdRequest | undefined;
  requestId = 'BL-000301';
  selectedStatus: DswdStatus = 'Submitted for Verification';
  status: DswdStatus = 'Submitted for Verification';
  statuses = DSWD_STATUSES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.requestId = id;
        this.request = findDswdRequest(id);
        if (this.request) {
          this.selectedStatus = this.request.status;
          this.status = this.request.status;
        }
      }
    });
  }

  selectStatus(status: DswdStatus): void {
    this.selectedStatus = status;
    this.status = status;
  }

  saveStatus(): void {
    if (this.request) {
      this.request.status = this.selectedStatus;
    }
    this.notifications.success('Status updated successfully');
    this.router.navigate(['/dswd/dashboard']);
  }

  updateStatus(): void {
    this.saveStatus();
  }

  backToDashboard(): void {
    this.router.navigate(['/dswd/dashboard']);
  }

  priorityClass(priority: DswdRequest['priority']): string {
    return priorityClass(priority);
  }

  statusBadge(status: DswdStatus): DswdStatusBadge {
    return statusBadge(status);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
