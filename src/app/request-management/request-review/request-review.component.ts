import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../../notification/notification-bell.component';
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'app-request-review',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationBellComponent, AdminSidebarComponent],
  templateUrl: './request-review.component.html',
  styleUrl: './request-review.component.scss'
})
export class RequestReviewComponent {

  requestId = 'BL-000301';

  priority = 'URGENT';
  status = 'Pending';

  statuses = [
    'Pending',
    'Verified',
    'Assisted',
    'Completed'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = params['id'];
      }
    });
  }

  verifyRequest(): void {
    this.router.navigate([
      '/request-verified',
      this.requestId
    ]);
  }

  rejectRequest(): void {
    this.notifications.error(`Request #${this.requestId} has been rejected.`);
    this.router.navigate(['/request-management']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}