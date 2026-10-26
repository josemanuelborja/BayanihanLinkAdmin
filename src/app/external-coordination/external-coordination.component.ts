import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { ApiRequest } from '../api/api.service';

export interface CoordinationNote {
  id: string | number;
  author: string;
  authorRole: string;
  time: string;
  text: string;
}

export interface ApiCoordinationData {
  requestId: string;
  offerId: string;
  selectedStatus: string;
  notes: CoordinationNote[];
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

  requestId = 'BL-000234';
  offerId = 'DO-000089';
  selectedStatus = 'Awaiting DSWD Confirmation';
  loading = false;

  statuses = [
    'For Coordination',
    'Awaiting DSWD Confirmation',
    'Confirmed by DSWD',
    'Not confirmed by DSWD',
    'For Distribution',
    'Distributed'
  ];

  notes: CoordinationNote[] = [
    {
      id: 1,
      author: 'Admin User',
      authorRole: 'App Admin',
      time: 'Sep 16, 2026',
      text: 'No external confirmation recorded yet. The App Admin must contact DSWD outside BayanihanLink to confirm disaster eligibility and donation suitability.'
    }
  ];

  noteDraft = '';
  private nextNoteId = 2;

  get canPostNote(): boolean {
    return this.noteDraft.trim().length > 0;
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      if (params['requestId']) {
        this.requestId = params['requestId'];
      }

      if (params['offerId']) {
        this.offerId = params['offerId'];
      }

      await this.loadCoordinationData();
    });
  }

  private async loadCoordinationData(): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const url = this.offerId
        ? `/api/coordination/${this.requestId}/${this.offerId}`
        : `/api/coordination/${this.requestId}`;

      const res = await firstValueFrom(
        this.http.get<ApiCoordinationData>(url, { headers })
      );

      if (res) {
        if (res.selectedStatus) {
          this.selectedStatus = res.selectedStatus;
        }
        if (res.notes && res.notes.length > 0) {
          this.notes = res.notes;
        }
      }
    } catch {
      // Fallback to default state if backend endpoint is unavailable
    }
  }

  async addNote(): Promise<void> {
    const text = this.noteDraft.trim();

    if (!text) {
      return;
    }

    const newNote: CoordinationNote = {
      id: 'n_' + Date.now(),
      author: 'App Admin',
      authorRole: 'App Admin',
      time: 'Just now',
      text
    };

    const updatedNotes = [...this.notes, newNote];

    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const url = this.offerId
        ? `/api/coordination/${this.requestId}/${this.offerId}`
        : `/api/coordination/${this.requestId}`;

      await firstValueFrom(
        this.http.put(url, {
          requestId: this.requestId,
          offerId: this.offerId,
          selectedStatus: this.selectedStatus,
          notes: updatedNotes
        }, { headers })
      );
    } catch {
      // Proceed even if backend sync fails
    }

    this.notes = updatedNotes;
    this.noteDraft = '';
    this.notifications.success('External coordination note recorded');
  }

  async removeNote(id: string | number): Promise<void> {
    const updatedNotes = this.notes.filter(note => note.id !== id);

    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const url = this.offerId
        ? `/api/coordination/${this.requestId}/${this.offerId}`
        : `/api/coordination/${this.requestId}`;

      await firstValueFrom(
        this.http.put(url, {
          requestId: this.requestId,
          offerId: this.offerId,
          selectedStatus: this.selectedStatus,
          notes: updatedNotes
        }, { headers })
      );
    } catch {
      // Proceed even if backend sync fails
    }

    this.notes = updatedNotes;
    this.notifications.info('Note removed');
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  async saveStatus(): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const url = this.offerId
        ? `/api/coordination/${this.requestId}/${this.offerId}`
        : `/api/coordination/${this.requestId}`;

      await firstValueFrom(
        this.http.put(url, {
          requestId: this.requestId,
          offerId: this.offerId,
          selectedStatus: this.selectedStatus,
          notes: this.notes
        }, { headers })
      );
    } catch {
      // Proceed even if backend sync fails
    }

    this.notifications.success(`Coordination status recorded as ${this.selectedStatus}`);
  }

  backToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }

}
