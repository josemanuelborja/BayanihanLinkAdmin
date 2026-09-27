import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../notification/notification-bell.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NotificationBellComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private router: Router) {}

  logout(): void {
    this.router.navigate(['/login']);
  }

  reviewRequest(id: string): void {
    this.router.navigate([
      '/request-review',
      id.replace(/^#/, '')
    ]);
  }
}