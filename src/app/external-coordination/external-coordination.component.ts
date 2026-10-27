import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
import { ApiRequest, ApiOffer } from '../api/api.service';

export interface CoordinationNote {
  id: string | number;
  author: string;
  authorRole: string;
  time: string;
  text: string;
}

export interface ApiCoordinationData {
  requestId: string | null;
  offerId: string | null;
  selectedStatus: string;
  notes: CoordinationNote[];
  updatedAt: string | null;
}

@Component({
  selector: 'app-external-coordination',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './external-coordination.component.html',
  styleUrl: './external-coordination.component.scss'
})
export class ExternalPartnerCoordinationComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  requestId = '';
  offerId = '';

  selectedStatus = 'Awaiting DSWD Confirmation';
  loading = true;
  savingStatus = false;
  savingNote = false;
  errorMessage = '';

  request: ApiRequest | null = null;
  offer: ApiOffer | null = null;

  statuses = [
    'For Coordination',
    'Awaiting DSWD Confirmation',
    'Confirmed by DSWD',
    'Not confirmed by DSWD',
    'For Distribution',
    'Distributed'
  ];

  notes: CoordinationNote[] = [];
  noteDraft = '';

  get canPostNote(): boolean {
    return this.noteDraft.trim().length > 0 && !this.savingNote;
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.requestId = params['requestId'] || '';
      this.offerId = params['offerId'] || '';
      await this.loadPage();
    });
  }

  /* ---------- Loading ---------- */

  private async loadPage(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.request = null;
    this.offer = null;
    this.notes = [];
    this.selectedStatus = 'Awaiting DSWD Confirmation';

    if (!this.requestId) {
      this.errorMessage = 'No request was selected. Go back to Donation Offers and click Coordinate.';
      this.loading = false;
      this.refreshView();
      return;
    }

    const headers = this.buildHeaders();

    // 1. Request details
    try {
      this.request = await firstValueFrom(
        this.http.get<ApiRequest>(`/api/requests/${this.requestId}`, { headers })
      );
    } catch {
      this.request = null;
      this.errorMessage = 'The linked request could not be found. Showing the donation offer details only.';
    }
    // Show the request as soon as it arrives instead of waiting for the last call.
    this.refreshView();

    // 2. Donation offer details
    try {
      const offers = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );

      const matched = offers.find(o => o._id === this.offerId || o.referenceNo === this.offerId);
      if (matched) {
        this.offer = matched;
        // Keep the real database id for saving the coordination record.
        this.offerId = matched._id;
      }

      // When only the request was given, use its first offer.
      if (!this.offer && !this.offerId) {
        this.offer = offers.find(o =>
          o.requestId === this.coordinationRequestId() ||
          o.requestReferenceNo === this.requestId
        ) ?? null;
        if (this.offer) {
          this.offerId = this.offer._id;
        }
      }
    } catch {
      this.offer = null;
    }
    this.refreshView();

    // 3. Saved coordination record (status + notes)
    await this.loadCoordination();
    this.loading = false;
    this.refreshView();
  }

  private async loadCoordination(): Promise<void> {
    if (!this.requestId) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<ApiCoordinationData>(this.coordinationUrl(), { headers: this.buildHeaders() })
      );

      if (data) {
        this.selectedStatus = data.selectedStatus || this.selectedStatus;
        this.notes = (data.notes || []).map(note => this.toNote(note));
      }
    } catch {
      this.errorMessage = 'Could not load the saved coordination record from the database.';
    }

    this.refreshView();
  }

  /* ---------- Status ---------- */

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  async saveStatus(): Promise<void> {
    if (!this.requestId || this.savingStatus) {
      return;
    }

    this.savingStatus = true;
    try {
      const saved = await this.saveCoordination(this.notes);
      this.selectedStatus = saved.selectedStatus || this.selectedStatus;
      this.notes = (saved.notes || []).map(note => this.toNote(note));
      this.errorMessage = '';
      this.notifications.success(`Coordination status saved as ${this.selectedStatus}.`);
    } catch (error) {
      this.notifications.error(this.errorText(error, 'Could not save the coordination status.'));
    } finally {
      this.savingStatus = false;
      this.refreshView();
    }
  }

  /* ---------- Notes ---------- */

  async addNote(): Promise<void> {
    const text = this.noteDraft.trim();

    if (!text || this.savingNote) {
      return;
    }
    if (!this.requestId) {
      this.notifications.error('There is no coordination record to save this note to.');
      return;
    }

    const newNote: CoordinationNote = {
      id: `n_${Date.now()}`,
      author: this.authorName(),
      authorRole: 'Administrator',
      time: new Date().toISOString(),
      text
    };

    this.savingNote = true;
    try {
      const saved = await this.saveCoordination([...this.notes, newNote]);
      this.notes = (saved.notes || []).map(note => this.toNote(note));
      this.noteDraft = '';
      this.errorMessage = '';
      this.notifications.success('Administrator note saved.');
    } catch (error) {
      this.notifications.error(this.errorText(error, 'Could not save the note.'));
    } finally {
      this.savingNote = false;
      this.refreshView();
    }
  }

  async removeNote(id: string | number): Promise<void> {
    if (!this.requestId) {
      return;
    }

    const remaining = this.notes.filter(note => note.id !== id);

    try {
      const saved = await this.saveCoordination(remaining);
      this.notes = (saved.notes || []).map(note => this.toNote(note));
      this.notifications.info('Note removed.');
    } catch (error) {
      this.notifications.error(this.errorText(error, 'Could not remove the note.'));
    }

    this.refreshView();
  }

  /* ---------- Helpers ---------- */

  private coordinationUrl(): string {
    return this.offerId
      ? `/api/coordination/${this.coordinationRequestId()}/${this.offerId}`
      : `/api/coordination/${this.coordinationRequestId()}`;
  }

  // The route can carry the friendly BL-... reference, but the coordination
  // API stores real database ids.
  private coordinationRequestId(): string {
    return this.request?.id || this.requestId;
  }

  get requestDisplayId(): string {
    return this.request?.referenceNo || this.requestId;
  }

  get offerDisplayId(): string {
    return this.offer?.referenceNo || this.offerId || 'N/A';
  }

  // The backend stores only the file name, so the browser loads it from /uploads.
  imageUrl(filename: string): string {
    if (!filename) {
      return '';
    }
    return filename.startsWith('http') ? filename : '/uploads/' + filename;
  }

  private async saveCoordination(notes: CoordinationNote[]): Promise<ApiCoordinationData> {
    const saved = await firstValueFrom(
      this.http.put<ApiCoordinationData>(this.coordinationUrl(), {
        selectedStatus: this.selectedStatus,
        notes
      }, { headers: this.buildHeaders() })
    );

    // The backend saved a real notification; reload so the bell shows it.
    void this.notifications.loadInbox(true);
    return saved;
  }

  private buildHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` });
  }

  private authorName(): string {
    return this.auth.currentUser()?.fullName || 'App Admin';
  }

  private toNote(raw: Partial<CoordinationNote>): CoordinationNote {
    return {
      id: raw.id ?? `n_${Date.now()}`,
      author: raw.author || 'App Admin',
      authorRole: raw.authorRole || 'Administrator',
      time: this.formatTime(raw.time),
      text: raw.text || ''
    };
  }

  private formatTime(value: string | undefined): string {
    if (!value) {
      return 'Just now';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  private errorText(error: any, fallback: string): string {
    return error?.error?.error ?? error?.message ?? fallback;
  }

  backToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }

  // This app runs without zone.js, so Angular does not know data arrived.
  // Mark this page for a re-render so the new data appears right away.
  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
