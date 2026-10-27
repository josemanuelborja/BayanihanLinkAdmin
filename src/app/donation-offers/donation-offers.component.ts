import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { AuthService } from '../auth/auth.service';
import { ApiOffer } from '../api/api.service';

interface DonationItem {
  id: string;
  rawId: string;
  requestRawId: string;
  donor: string;
  contact: string;
  request: string;
  item: string;
  quantity: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-donation-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './donation-offers.component.html',
  styleUrl: './donation-offers.component.scss'
})
export class DonationOffersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  search = '';
  filter = 'All';
  donations: DonationItem[] = [];
  loading = true;

  totalOffers = 0;
  pendingCount = 0;
  coordinatingCount = 0;
  verificationCount = 0;
  distributedCount = 0;
  completedCount = 0;

  async ngOnInit(): Promise<void> {
    await this.loadOffers();
  }

  private async loadOffers(): Promise<void> {
    this.loading = true;
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const raw = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );

      this.donations = raw.map(o => this.toDisplay(o));
      this.totalOffers = raw.length;
      this.pendingCount = raw.filter(o => o.status === 'PENDING').length;
      this.coordinatingCount = raw.filter(o => o.status === 'ACCEPTED').length;
      this.verificationCount = 0;
      this.distributedCount = 0;
      this.completedCount = raw.filter(o => o.status === 'COMPLETED').length;
    } catch {
      this.donations = [];
      this.totalOffers = 0;
      this.pendingCount = 0;
      this.coordinatingCount = 0;
      this.verificationCount = 0;
      this.distributedCount = 0;
      this.completedCount = 0;
    }
    this.loading = false;
    this.refreshView();
  }

  private toDisplay(o: ApiOffer): DonationItem {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending Coordination',
      ACCEPTED: 'Coordinating',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed'
    };
    return {
      id: '#' + (o.referenceNo || o._id),
      rawId: o._id,
      requestRawId: o.requestId,
      donor: o.donorName || o.donorId,
      contact: 'N/A',
      request: '#' + (o.requestReferenceNo || o.requestId),
      item: o.requestItem || o.unit || 'Relief Goods',
      quantity: o.quantityOffered,
      status: statusMap[o.status] ?? o.status,
      date: new Date(o.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    };
  }

  get filteredDonations(): DonationItem[] {
    const term = this.search.trim().toLowerCase();

    return this.donations.filter(item => {
      const searchMatch =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.donor.toLowerCase().includes(term) ||
        item.request.toLowerCase().includes(term) ||
        item.item.toLowerCase().includes(term);

      const filterMatch =
        this.filter === 'All' || item.status === this.filter;

      return searchMatch && filterMatch;
    });
  }

  statusLabel(status: string): string {
    return status;
  }

  setFilter(filter: string): void {
    this.filter = filter;
  }

  coordinate(item: DonationItem): void {
    if (!item.requestRawId) {
      return;
    }

    this.router.navigate([
      '/external-coordination',
      item.requestRawId,
      item.rawId
    ]);
  }

  // This app runs without zone.js, so Angular does not know data arrived.
  // Mark this page for a re-render so the new data appears right away.
  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
