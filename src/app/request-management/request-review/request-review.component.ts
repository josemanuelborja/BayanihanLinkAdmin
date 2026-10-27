import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../../notification/notification-bell.component';
import { NotificationService } from '../../notification/notification.service';
import { ApiService, ApiRequest } from '../../api/api.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-request-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, NotificationBellComponent, AdminSidebarComponent],
  templateUrl: './request-review.component.html',
  styleUrl: './request-review.component.scss'
})
export class RequestReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  requestId = '';
  request: ApiRequest | null = null;
  loading = true;
  errorMessage = '';

  priority = 'NORMAL';
  status = 'Pending';
  adminNotes = '';

  statuses = [
    'Pending',
    'Verified',
    'Assisted',
    'Completed'
  ];

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      const id = params['id'] || '';

      if (!id) {
        this.loading = false;
        this.errorMessage = 'No request was selected.';
        this.refreshView();
        return;
      }

      this.requestId = id;
      await this.loadRequest(id);
    });
  }

  private async loadRequest(id: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.request = null;

    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const res = await firstValueFrom(
        this.http.get<ApiRequest>(`/api/requests/${id}`, { headers })
      );

      this.request = res;
      this.priority = res.urgency ?? 'NORMAL';

      const map: Record<string, string> = {
        PENDING: 'Pending', VERIFIED: 'Verified', ASSISTED: 'Assisted', COMPLETED: 'Completed'
      };
      this.status = map[res.status] ?? 'Pending';
    } catch (error) {
      this.request = null;
      this.errorMessage = this.errorText(error, 'This request could not be loaded.');
    } finally {
      this.loading = false;
      this.refreshView();
    }
  }

  private errorText(error: any, fallback: string): string {
    return error?.error?.error ?? error?.message ?? fallback;
  }

  // The backend stores only the file name, so the browser loads it from /uploads.
  imageUrl(filename: string): string {
    if (!filename) {
      return '';
    }
    return filename.startsWith('http') ? filename : '/uploads/' + filename;
  }

  async verifyRequest(): Promise<void> {
    const token = this.auth.authToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING', 'Verified': 'VERIFIED', 'Assisted': 'ASSISTED', 'Completed': 'COMPLETED'
    };
    const backendStatus = statusMap[this.status] ?? 'VERIFIED';

    let saved = false;
    try {
      await firstValueFrom(
        this.http.patch(`/api/requests/${this.requestId}/status`, {
          status: backendStatus,
          urgency: this.priority,
          currentTimelineStep: backendStatus === 'VERIFIED' ? 3 : 2
        }, { headers })
      );
      saved = true;
    } catch (err: any) {
      this.notifications.error(this.errorText(err, 'Failed to update request.'));
    }

    // Only say "verified" when the database actually accepted the change.
    if (saved) {
      this.notifications.success(`Request #${this.requestId} has been verified and updated.`);
      // Reload the bell so the new Admin activity shows up right away.
      void this.notifications.loadInbox(true);
    }

    this.router.navigate(['/request-review-recorded', this.requestId]);
  }

  async rejectRequest(): Promise<void> {
    const token = this.auth.authToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      await firstValueFrom(
        this.http.patch(`/api/requests/${this.requestId}/status`, {
          status: 'PENDING',
          urgency: this.priority
        }, { headers })
      );
      this.notifications.info(`Request #${this.requestId} has been reset to Pending.`);
    } catch (err: any) {
      this.notifications.error(this.errorText(err, 'Failed to reject request.'));
    }

    this.router.navigate(['/request-management']);
  }

  saveReview(): void {
    void this.verifyRequest();
  }

  backToRequests(): void {
    this.router.navigate(['/request-management']);
  }

  // This app runs without zone.js, so Angular does not know data arrived.
  // Mark this page for a re-render so the new data appears right away.
  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
