import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DSWD_VALIDATION_CASES, DswdValidationCase } from '../dswd-request.data';
import { DswdSidebarComponent } from '../dswd-sidebar.component';
import { DswdNotificationBellComponent } from '../dswd-notification-bell.component';
import { DswdAuthService } from '../dswd-auth.service';

@Component({
  selector: 'app-dswd-dashboard',
  standalone: true,
  imports: [CommonModule, DswdSidebarComponent, DswdNotificationBellComponent],
  templateUrl: './dswd-dashboard.component.html',
  styleUrl: './dswd-dashboard.component.scss'
})
export class DswdDashboardComponent {
  readonly cases = DSWD_VALIDATION_CASES;

  constructor(private router: Router) {}

  reviewCase(id: string): void { this.router.navigate(['/dswd/review', id]); }
  priorityClass(value: DswdValidationCase['priority']): string { return `priority-${value.toLowerCase()}`; }
  decisionSummary(item: DswdValidationCase): string {
    if (item.donatedItemsAssessment === 'Not confirmed' || item.requestedItemsAssessment === 'Not confirmed' || item.disasterEligibility === 'Not confirmed') return 'Needs follow-up';
    const donationChecked = item.donatedItemsAssessment === 'Confirmed';
    const requestChecked = item.donationType === 'Open donation'
      ? !!item.suggestedDestination
      : item.disasterEligibility === 'Confirmed' && item.requestedItemsAssessment === 'Confirmed';
    if (donationChecked && requestChecked) return item.donationType === 'Open donation' ? 'Destination assessed' : 'Request and donation checked';
    return 'Awaiting DSWD review';
  }
  logout(): void { 
    const dswdAuth = inject(DswdAuthService);
    dswdAuth.logout();
    this.router.navigate(['/login']); 
  }
}
