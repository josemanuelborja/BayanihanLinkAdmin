import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../../notification/notification-bell.component';
import { DSWD_ATTENTION_REQUESTS } from '../dswd-request.data';

@Component({
  selector: 'app-dswd-status',
  standalone: true,
  imports: [RouterLink, NotificationBellComponent],
  templateUrl: './dswd-status.component.html',
  styleUrl: './dswd-status.component.scss'
})
export class DswdStatusComponent {

  /** Request the sidebar's "Request Review" link opens. */
  readonly reviewId = DSWD_ATTENTION_REQUESTS[0].id;

  /** System-wide count, shown on the sidebar badge. */
  readonly requestsForAttention = 15;

  constructor(private router: Router) {}

  review(id: string): void {
    this.router.navigate(['/dswd/review', id]);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}