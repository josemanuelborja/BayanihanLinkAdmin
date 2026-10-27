import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { ApiService } from '../api/api.service';

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
  private readonly cdr = inject(ChangeDetectorRef);

  tracking: TrackingItem[] = [];
  stageCounts: number[] = [0, 0, 0, 0, 0, 0];
  loading = true;

  stages = [
    'Submitted',
    'DSWD Confirmed',
    'Assistance Offered',
    'External DSWD Review',
    'Distributed',
    'Completed'
  ];

  async ngOnInit(): Promise<void> {
    // Load the real requests from the database.
    const requests = await this.api.getRequests();

    this.tracking = requests.map(request => ({
      id: request.referenceNo ? '#' + request.referenceNo : '#' + request.id,
      name: request.requesterName || request.userId,
      priority: request.urgency,
      disaster: `${request.disasterType} · ${request.itemNeeded}`,
      location: request.location || 'Location not specified',
      current: Math.min(Math.max(request.currentTimelineStep || 1, 1), this.stages.length)
    }));

    // Count how many requests are in each stage.
    this.stageCounts = this.stages.map(
      (_stage, index) => this.tracking.filter(item => item.current === index + 1).length
    );

    this.loading = false;
    this.cdr.markForCheck();
  }
}
