import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';

import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../../notification/notification-bell.component';

@Component({
  selector: 'app-request-review-recorded',
  standalone: true,
  imports: [Button, NotificationBellComponent, AdminSidebarComponent],
  templateUrl: './request-review-recorded.component.html',
  styleUrl: './request-review-recorded.component.scss'
})
export class RequestReviewRecordedComponent {

  requestId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      this.requestId = params['id'] || '';
    });
  }

  proceedToCoordination(): void {
    if (!this.requestId) {
      this.router.navigate(['/donation-offers']);
      return;
    }

    this.router.navigate([
      '/external-coordination',
      this.requestId
    ]);
  }

  backToRequests(): void {
    this.router.navigate(['/request-management']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
