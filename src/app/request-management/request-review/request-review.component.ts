import { Component, OnInit, inject } from '@angular/core';
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

  requestId = '';
  request: ApiRequest | null = null;
  loading = true;

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
      const id = params['id'];
      if (id) {
        this.requestId = id;
        await this.loadRequest(id);
      }
    });
  }

  private async loadRequest(id: string): Promise<void> {
    this.loading = true;
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const res = await firstValueFrom(
        this.http.get<ApiRequest>(`/api/requests/${id}`, { headers })
      );
      this.request = res;
      if (res) {
        this.priority = res.urgency ?? 'NORMAL';
        const map: Record<string, string> = {
          PENDING: 'Pending', VERIFIED: 'Verified', ASSISTED: 'Assisted', COMPLETED: 'Completed'
        };
        this.status = map[res.status] ?? 'Pending';
      }
    } catch {
      this.request = null;
    }
    this.loading = false;
  }

  async verifyRequest(): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const statusMap: Record<string, string> = {
        'Pending': 'PENDING', 'Verified': 'VERIFIED', 'Assisted': 'ASSISTED', 'Completed': 'COMPLETED'
      };
      const backendStatus = statusMap[this.status] ?? 'VERIFIED';

      await firstValueFrom(
        this.http.patch(`/api/requests/${this.requestId}/status`, {
          status: backendStatus,
          urgency: this.priority,
          currentTimelineStep: backendStatus === 'VERIFIED' ? 3 : 2
        }, { headers })
      );

      this.notifications.success(`Request #${this.requestId} has been verified and updated.`);
      this.router.navigate(['/request-verified', this.requestId]);
    } catch (err: any) {
      this.notifications.error(err?.error?.error ?? 'Failed to update request.');
    }
  }

  async rejectRequest(): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      await firstValueFrom(
        this.http.patch(`/api/requests/${this.requestId}/status`, {
          status: 'PENDING',
          urgency: this.priority
        }, { headers })
      );

      this.notifications.error(`Request #${this.requestId} has been rejected/reset.`);
      this.router.navigate(['/request-management']);
    } catch (err: any) {
      this.notifications.error(err?.error?.error ?? 'Failed to reject request.');
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
