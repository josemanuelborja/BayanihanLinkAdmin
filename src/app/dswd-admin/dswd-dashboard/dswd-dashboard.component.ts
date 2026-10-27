import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiOffer, ApiRequest } from '../../api/api.service';
import { DswdAuthService } from '../dswd-auth.service';
import { DswdNotificationBellComponent } from '../dswd-notification-bell.component';
import { DswdSidebarComponent } from '../dswd-sidebar.component';
import { DswdValidationCase, buildDswdCases } from '../dswd-request.data';

@Component({
  selector: 'app-dswd-dashboard',
  standalone: true,
  imports: [CommonModule, DswdSidebarComponent, DswdNotificationBellComponent],
  templateUrl: './dswd-dashboard.component.html',
  styleUrl: './dswd-dashboard.component.scss'
})
export class DswdDashboardComponent implements OnInit {
  cases: DswdValidationCase[] = [];
  loading = true;
  errorMessage = '';

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(DswdAuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.loadCases();
  }

  private async loadCases(): Promise<void> {
    this.loading = true;

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` });
      const [offers, requests] = await Promise.all([
        firstValueFrom(this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })),
        firstValueFrom(this.http.get<ApiRequest[]>('/api/requests'))
      ]);

      this.cases = buildDswdCases(offers, requests);
      this.errorMessage = '';
    } catch {
      this.cases = [];
      this.errorMessage = 'Could not load donation offers from the database.';
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  reviewCase(id: string): void {
    this.router.navigate(['/dswd/review', id]);
  }

  priorityClass(value: DswdValidationCase['priority']): string {
    return `priority-${value.toLowerCase()}`;
  }

  decisionSummary(item: DswdValidationCase): string {
    if (
      item.donatedItemsAssessment === 'Not confirmed' ||
      item.requestedItemsAssessment === 'Not confirmed' ||
      item.disasterEligibility === 'Not confirmed'
    ) {
      return 'Needs follow-up';
    }

    const donationChecked = item.donatedItemsAssessment === 'Confirmed';
    const requestChecked = item.donationType === 'Open donation'
      ? !!item.suggestedDestination
      : item.disasterEligibility === 'Confirmed' && item.requestedItemsAssessment === 'Confirmed';

    if (donationChecked && requestChecked) {
      return item.donationType === 'Open donation' ? 'Destination assessed' : 'Request and donation checked';
    }

    return 'Awaiting DSWD review';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
