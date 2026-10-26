import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService, ApiRequest } from '../../api/api.service';

export interface DashboardRequest {
  id: string;
  requester: string;
  disaster: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-recent-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './recent-requests.component.html',
  styleUrl: './recent-requests.component.scss'
})
export class RecentRequestsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  requests: DashboardRequest[] = [];
  searchTerm = '';
  loading = true;

  async ngOnInit(): Promise<void> {
    await this.loadRecentRequests();
  }

  private async loadRecentRequests(): Promise<void> {
    this.loading = true;
    try {
      const raw = await this.api.getRequests();
      this.requests = raw.map(r => this.toDisplay(r));
    } catch {
      this.requests = [];
    }
    this.loading = false;
  }

  private toDisplay(r: ApiRequest): DashboardRequest {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending', VERIFIED: 'Verified', ASSISTED: 'Assisted', COMPLETED: 'Completed'
    };
    return {
      id: r.id,
      requester: r.userId,
      disaster: r.disasterType,
      category: r.category,
      location: r.location,
      priority: r.urgency,
      status: statusMap[r.status] ?? r.status,
      date: new Date(r.dateSubmitted).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    };
  }

  get filteredRequests(): DashboardRequest[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.requests;

    return this.requests.filter((request) => {
      const values = [
        request.id,
        request.requester,
        request.disaster,
        request.category,
        request.location,
        request.priority,
        request.status,
        request.date
      ].join(' ').toLowerCase();

      return values.includes(term);
    });
  }

  priorityClass(priority: string): string {
    return 'priority-' + priority.toLowerCase();
  }

  statusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  reviewRequest(id: string): void {
    this.router.navigate(['/request-review', id.replace(/^#/, '')]);
  }
}
