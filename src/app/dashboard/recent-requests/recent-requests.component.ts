import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';

import { dateToIso, inDateRange } from '../../date-filter.util';

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

const DASHBOARD_REQUESTS: readonly DashboardRequest[] = [
  {
    id: 'BL-000302',
    requester: 'Ana Reyes',
    disaster: 'Typhoon',
    category: 'Food',
    location: 'CDO City',
    priority: 'CRITICAL',
    status: 'Pending',
    date: 'Sep 16, 2026'
  },
  {
    id: 'BL-000301',
    requester: 'Juan Dela Cruz',
    disaster: 'Flood',
    category: 'Water',
    location: 'Iligan City',
    priority: 'URGENT',
    status: 'Pending',
    date: 'Sep 16, 2026'
  },
  {
    id: 'BL-000298',
    requester: 'Rosa Gomez',
    disaster: 'Fire',
    category: 'Clothing',
    location: 'Davao City',
    priority: 'NORMAL',
    status: 'Verified',
    date: 'Sep 15, 2026'
  },
  {
    id: 'BL-000295',
    requester: 'Pedro Santos',
    disaster: 'Typhoon',
    category: 'Medicine',
    location: 'Butuan City',
    priority: 'URGENT',
    status: 'Assisted',
    date: 'Sep 14, 2026'
  },
  {
    id: 'BL-000290',
    requester: 'Maria Lopez',
    disaster: 'Earthquake',
    category: 'Blankets',
    location: 'Surigao del Norte',
    priority: 'NORMAL',
    status: 'Completed',
    date: 'Sep 12, 2026'
  }
];

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
export class RecentRequestsComponent {
  private readonly router = inject(Router);

  readonly requests: readonly DashboardRequest[] = DASHBOARD_REQUESTS;
  searchTerm = '';

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

  reviewRequest(id: string): void {
    this.router.navigate(['/request-review', id.replace(/^#/, '')]);
  }
}
