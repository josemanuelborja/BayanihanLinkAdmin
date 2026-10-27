import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';

import { ApiRequest, ApiService } from '../../api/api.service';

export interface DashboardRequest {
  id: string;
  requester: string;
  disaster: string;
  category: string;
  location: string;
  priority: 'CRITICAL' | 'URGENT' | 'NORMAL';
  status: 'Pending' | 'Verified' | 'Assisted' | 'Completed';
  date: string;
}

@Component({
  selector: 'app-recent-requests',
  standalone: true,
  imports: [
    FormsModule,
    DatePickerModule,
    RouterLink
  ],
  templateUrl: './recent-requests.component.html',
  styleUrl: './recent-requests.component.scss'
})
export class RecentRequestsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  requests: DashboardRequest[] = [];
  searchTerm = '';

  async ngOnInit(): Promise<void> {
    // Keep rows that a test (or a parent) already supplied.
    if (this.requests.length === 0) {
      await this.loadRequests();
    }
  }

  private async loadRequests(): Promise<void> {
    const rows = await this.api.getRequests();
    this.requests = rows.slice(0, 5).map(request => this.toDisplay(request));
    this.cdr.markForCheck();
  }

  private toDisplay(request: ApiRequest): DashboardRequest {
    const statusMap: Record<string, DashboardRequest['status']> = {
      PENDING: 'Pending',
      VERIFIED: 'Verified',
      ASSISTED: 'Assisted',
      COMPLETED: 'Completed'
    };

    return {
      id: request.referenceNo || request.id,
      requester: request.requesterName || request.userId,
      disaster: request.disasterType,
      category: request.category,
      location: request.location,
      priority: request.urgency,
      status: statusMap[request.status] ?? 'Pending',
      date: new Date(request.dateSubmitted).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };
  }

  get filteredRequests(): readonly DashboardRequest[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.requests.filter((request) => {
      if (!term) {
        return true;
      }

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

  priorityClass(priority: DashboardRequest['priority']): string {
    return 'priority-' + priority.toLowerCase();
  }

  statusClass(status: DashboardRequest['status']): string {
    return 'status-' + status.toLowerCase();
  }

  statusLabel(status: DashboardRequest['status']): string {
    return status === 'Verified' ? 'DSWD confirmed' : status;
  }

  reviewRequest(id: string): void {
    this.router.navigate(['/request-review', id.replace(/^#/, '')]);
  }
}
