import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { ApiService, ApiRequest } from '../api/api.service';

interface TrackingItem {
  id: string;
  name: string;
  priority: string;
  disaster: string;
  location: string;
  current: number;
}

@Component({
  selector: 'app-status-monitoring',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './status-monitoring.component.html',
  styleUrl: './status-monitoring.component.scss'
})
export class StatusMonitoringComponent implements OnInit {
  private readonly api = inject(ApiService);

  tracking: TrackingItem[] = [];
  loading = true;

  stageCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  stages = [
    'Submitted',
    'Verified',
    'Assistance Offered',
    "Gov't Verification",
    'Distributed',
    'Completed'
  ];

  async ngOnInit(): Promise<void> {
    const requests = await this.api.getRequests();

    this.tracking = requests.map(r => this.toTracking(r));

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const r of requests) {
      const step = r.currentTimelineStep ?? 1;
      if (step >= 1 && step <= 6) {
        counts[step] = (counts[step] ?? 0) + 1;
      }
    }
    this.stageCounts = counts;
    this.loading = false;
  }

  private toTracking(r: ApiRequest): TrackingItem {
    return {
      id: '#' + r.id,
      name: r.userId,
      priority: r.urgency,
      disaster: r.disasterType + ' · ' + r.category,
      location: r.location,
      current: r.currentTimelineStep ?? 1
    };
  }
}
