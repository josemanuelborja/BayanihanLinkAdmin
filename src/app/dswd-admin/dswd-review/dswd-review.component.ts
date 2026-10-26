import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { DSWD_VALIDATION_CASES, DswdValidationCase, ValidationOutcome } from '../dswd-request.data';
import { DswdSidebarComponent } from '../dswd-sidebar.component';
import { DswdNotificationBellComponent } from '../dswd-notification-bell.component';

@Component({
  selector: 'app-dswd-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DswdSidebarComponent, DswdNotificationBellComponent],
  templateUrl: './dswd-review.component.html',
  styleUrl: './dswd-review.component.scss'
})
export class DswdReviewComponent {
  request?: DswdValidationCase;
  disasterEligibility: ValidationOutcome = 'Pending';
  requestedItemsAssessment: ValidationOutcome = 'Pending';
  donatedItemsAssessment: ValidationOutcome = 'Pending';
  suggestedDestination = '';
  note = '';
  readonly outcomes: ValidationOutcome[] = ['Pending', 'Confirmed', 'Not confirmed'];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      this.request = DSWD_VALIDATION_CASES.find(item => item.id === params.get('id'));
      if (this.request) {
        this.disasterEligibility = this.request.disasterEligibility;
        this.requestedItemsAssessment = this.request.requestedItemsAssessment;
        this.donatedItemsAssessment = this.request.donatedItemsAssessment;
        this.suggestedDestination = this.request.suggestedDestination;
      }
    });
  }

  get canSave(): boolean {
    if (!this.request || this.donatedItemsAssessment === 'Pending') return false;
    return this.request.donationType === 'Open donation'
      ? !!this.suggestedDestination.trim()
      : this.disasterEligibility !== 'Pending' && this.requestedItemsAssessment !== 'Pending';
  }

  saveAssessment(): void {
    if (!this.request || !this.canSave) return;
    this.request.disasterEligibility = this.disasterEligibility;
    this.request.requestedItemsAssessment = this.requestedItemsAssessment;
    this.request.donatedItemsAssessment = this.donatedItemsAssessment;
    this.request.suggestedDestination = this.suggestedDestination.trim();
    if (this.note.trim()) this.request.notes = this.note.trim();
    this.router.navigate(['/dswd/dashboard']);
  }

  backToDashboard(): void { this.router.navigate(['/dswd/dashboard']); }
  logout(): void { sessionStorage.removeItem('bayanihanlink-dswd-demo-session'); this.router.navigate(['/login']); }
}
