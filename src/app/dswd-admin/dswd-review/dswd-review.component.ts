import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiOffer, ApiRequest } from '../../api/api.service';
import { DswdAuthService } from '../dswd-auth.service';
import { DswdNotificationBellComponent } from '../dswd-notification-bell.component';
import { DswdSidebarComponent } from '../dswd-sidebar.component';
import { DswdValidationCase, ValidationOutcome, buildDswdCases } from '../dswd-request.data';

@Component({
  selector: 'app-dswd-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DswdSidebarComponent, DswdNotificationBellComponent],
  templateUrl: './dswd-review.component.html',
  styleUrl: './dswd-review.component.scss'
})
export class DswdReviewComponent implements OnInit {
  request?: DswdValidationCase;
  disasterEligibility: ValidationOutcome = 'Pending';
  requestedItemsAssessment: ValidationOutcome = 'Pending';
  donatedItemsAssessment: ValidationOutcome = 'Pending';
  suggestedDestination = '';
  note = '';
  loading = true;
  saving = false;
  errorMessage = '';
  readonly outcomes: ValidationOutcome[] = ['Pending', 'Confirmed', 'Not confirmed'];

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(DswdAuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      void this.loadCase(params.get('id'));
    });
  }

  private async loadCase(id: string | null): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    if (!id) {
      this.request = undefined;
      this.errorMessage = 'No donation offer was selected.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` });
      const [offers, requests] = await Promise.all([
        firstValueFrom(this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })),
        firstValueFrom(this.http.get<ApiRequest[]>('/api/requests'))
      ]);

      const found = buildDswdCases(offers, requests).find(
        item => item.id === id || item.offerId === id || item.offerRawId === id
      );

      if (!found) {
        this.request = undefined;
        this.errorMessage = 'This donation offer could not be found in the database.';
      } else {
        this.request = found;
        this.disasterEligibility = found.disasterEligibility;
        this.requestedItemsAssessment = found.requestedItemsAssessment;
        this.donatedItemsAssessment = found.donatedItemsAssessment;
        this.suggestedDestination = found.suggestedDestination;
        this.note = found.notes;
      }
    } catch {
      this.request = undefined;
      this.errorMessage = 'Could not load this donation offer from the database.';
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  get canSave(): boolean {
    if (!this.request || this.donatedItemsAssessment === 'Pending') return false;
    return this.request.donationType === 'Open donation'
      ? !!this.suggestedDestination.trim()
      : this.disasterEligibility !== 'Pending' && this.requestedItemsAssessment !== 'Pending';
  }

  async saveAssessment(): Promise<void> {
    if (!this.request || !this.canSave || this.saving) return;

    const isOpen = this.request.donationType === 'Open donation';
    this.saving = true;

    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` });
      await firstValueFrom(
        this.http.put(`/api/offers/${this.request.offerRawId}/dswd-assessment`, {
          disasterEligibility: isOpen ? '' : this.disasterEligibility,
          requestedItemsAssessment: isOpen ? '' : this.requestedItemsAssessment,
          donatedItemsAssessment: this.donatedItemsAssessment,
          suggestedDestination: this.suggestedDestination.trim(),
          notes: this.note.trim()
        }, { headers })
      );

      this.router.navigate(['/dswd/dashboard']);
    } catch {
      this.errorMessage = 'Could not save the assessment. Please try again.';
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/dswd/dashboard']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
