import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { ApiService, ApiRequest, ApiOffer } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { DonationOffersOverviewComponent } from './donation-offers-overview/donation-offers-overview.component';
import { RequestsByPriorityComponent } from './requests-by-priority/requests-by-priority.component';
import { RequestsByStatusComponent } from './requests-by-status/requests-by-status.component';
import { RequestsByDisasterTypeComponent } from './requests-by-disaster-type/requests-by-disaster-type.component';
import { RecentRequestsComponent } from './recent-requests/recent-requests.component';
import { RecentDonationOffersComponent } from './recent-donation-offers/recent-donation-offers.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebarComponent,
    AdminUserBadgeComponent,
    NotificationBellComponent,
    RequestsByStatusComponent,
    RequestsByPriorityComponent,
    RequestsByDisasterTypeComponent,
    DonationOffersOverviewComponent,
    RecentRequestsComponent,
    RecentDonationOffersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  totalRequests = 0;
  pendingCount = 0;
  criticalCount = 0;
  assistedCount = 0;
  completedCount = 0;
  totalOffers = 0;

  async ngOnInit(): Promise<void> {
    await this.loadStats();
  }

  private async loadStats(): Promise<void> {
    try {
      const requests = await this.api.getRequests();
      this.totalRequests = requests.length;
      this.pendingCount = requests.filter(r => r.status === 'PENDING').length;
      this.criticalCount = requests.filter(r => r.urgency === 'CRITICAL').length;
      this.assistedCount = requests.filter(r => r.status === 'ASSISTED').length;
      this.completedCount = requests.filter(r => r.status === 'COMPLETED').length;

      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const offers = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );
      this.totalOffers = offers.length;
    } catch {
      this.totalRequests = 0;
      this.pendingCount = 0;
      this.criticalCount = 0;
      this.assistedCount = 0;
      this.completedCount = 0;
      this.totalOffers = 0;
    }
  }
}
