import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';
import { ApiService, ApiRequest } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface RequestItem {
  id: string;
  requester: string;
  disaster: string;
  category: string;
  quantity: string;
  location: string;
  priority: string;
  status: string;
  date: string;
  rawId: string;
}

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './request-management.component.html',
  styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent implements OnInit {

  search = '';
  statusFilter = 'All';
  priorityFilter = 'All';
  requests: RequestItem[] = [];
  loading = true;

  constructor(
    private router: Router,
    private notifications: NotificationService,
    private api: ApiService,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadRequests();
  }

  private async loadRequests(): Promise<void> {
    this.loading = true;
    try {
      const raw = await this.api.getRequests();
      this.requests = raw.map(r => this.toDisplay(r));
    } catch {
      this.requests = [];
    } finally {
      this.loading = false;
      this.refreshView();
    }
  }

  private toDisplay(r: ApiRequest): RequestItem {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending', VERIFIED: 'Verified', ASSISTED: 'Assisted', COMPLETED: 'Completed'
    };
    return {
      id: r.referenceNo ? '#' + r.referenceNo : '#' + r.id,
      rawId: r.id,
      requester: r.requesterName || r.userId,
      disaster: r.disasterType,
      category: r.category,
      quantity: `${r.quantity} ${r.unit}`,
      location: r.location,
      priority: r.urgency,
      status: statusMap[r.status] ?? r.status,
      date: new Date(r.dateSubmitted).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    };
  }

  get filteredRequests(): RequestItem[] {
    return this.requests.filter(request => {
      const term = this.search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        request.id.toLowerCase().includes(term) ||
        request.requester.toLowerCase().includes(term) ||
        request.disaster.toLowerCase().includes(term) ||
        request.category.toLowerCase().includes(term) ||
        request.location.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'All' ||
        request.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' ||
        request.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  statusLabel(status: string): string {
    return status;
  }

  setStatus(status: string): void {
    this.statusFilter = status;
  }

  setPriority(priority: string): void {
    this.priorityFilter = priority;
  }

  review(id: string): void {
    this.router.navigate(['/request-review', id.replace(/^#/, '')]);
  }

  async verify(id: string): Promise<void> {
    const rawId = id.replace(/^#/, '');
    const token = this.auth.authToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    try {
      await firstValueFrom(
        this.http.patch(`/api/requests/${rawId}/status`, { status: 'VERIFIED', currentTimelineStep: 2 }, { headers })
      );
      this.notifications.success(`${id} has been verified.`);
      await this.loadRequests();
    } catch (err: any) {
      this.notifications.error(err?.error?.error ?? 'Could not verify request.');
      this.refreshView();
    }
  }

  // This app runs without zone.js, so Angular does not know data arrived.
  // Mark this page for a re-render so the new data appears right away.
  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
