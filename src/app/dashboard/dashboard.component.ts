import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminSidebarComponent, AdminUserBadgeComponent, RouterLink, NotificationBellComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private router: Router) {}

  reviewRequest(id: string): void {
    this.router.navigate([
      '/request-review',
      id.replace(/^#/, '')
    ]);
  }
}