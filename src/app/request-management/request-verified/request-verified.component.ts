import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../../notification/notification-bell.component';

@Component({
  selector: 'app-request-verified',
  standalone: true,
  imports: [NotificationBellComponent, AdminSidebarComponent],
  templateUrl: './request-verified.component.html',
  styleUrl: './request-verified.component.scss'
})
export class RequestVerifiedComponent {

  requestId = 'BL-000301';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = params['id'];
      }
    });
  }

  proceedToCoordination(): void {
    this.router.navigate([
      '/dswd-coordination',
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