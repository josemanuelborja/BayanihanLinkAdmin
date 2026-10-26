import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';
import { ApiRequest } from '../api/api.service';
import { AuthService } from '../auth/auth.service';

export interface CoordinationNote {
  id: number;
  author: string;
  role: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-dswd-coordination',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './dswd-coordination.component.html',
  styleUrl: './dswd-coordination.component.scss'
})
export class DswdCoordinationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  requestId = '';
  offerId = '';
  request: ApiRequest | null = null;

  selectedStatus = 'Submitted for Verification';

  statuses = [
    'For Coordination',
    'Submitted for Verification',
    'Verified',
    'For Distribution',
    'Distributed'
  ];

  notes: CoordinationNote[] = [];

  noteDraft = '';
  private nextNoteId = 1;

  get canPostNote(): boolean {
    return this.noteDraft.trim().length > 0;
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      if (params['requestId']) {
        this.requestId = params['requestId'];
        await this.loadRequest(params['requestId']);
      }
      if (params['offerId']) {
        this.offerId = params['offerId'];
      }
    });
  }

  private async loadRequest(id: string): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const res = await firstValueFrom(
        this.http.get<ApiRequest>(`/api/requests/${id}`, { headers })
      );
      if (res) {
        this.request = res;
      }
    } catch {
      this.request = null;
    }
  }

  addNote(): void {
    const text = this.noteDraft.trim();
    if (!text) return;

    this.notes = [
      ...this.notes,
      {
        id: this.nextNoteId++,
        author: 'Admin User',
        role: 'Administrator',
        time: 'Just now',
        text
      }
    ];

    this.noteDraft = '';
    this.notifications.success('Note added to coordination case');
  }

  removeNote(id: number): void {
    this.notes = this.notes.filter(note => note.id !== id);
    this.notifications.info('Note removed');
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  saveStatus(): void {
    this.notifications.success(`Status updated to ${this.selectedStatus}`);
  }

  backToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }
}
