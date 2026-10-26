import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ApiOffer } from '../../api/api.service';

export interface DonationOffer {
  id: string;
  rawId: string;
  donor: string;
  type: string;
  item: string;
  quantity: string;
  location: string;
  date: string;
  status: string;
  requestId: string;
}

@Component({
  selector: 'app-recent-donation-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recent-donation-offers.component.html',
  styleUrl: './recent-donation-offers.component.scss'
})
export class RecentDonationOffersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  recentOffers: DonationOffer[] = [];
  searchTerm = '';
  loading = true;

  async ngOnInit(): Promise<void> {
    await this.loadRecentOffers();
  }

  private async loadRecentOffers(): Promise<void> {
    this.loading = true;
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const raw = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );

      this.recentOffers = raw.map(o => this.toDisplay(o));
    } catch {
      this.recentOffers = [];
    }
    this.loading = false;
  }

  private toDisplay(o: ApiOffer): DonationOffer {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending',
      ACCEPTED: 'Coordinating',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed'
    };
    return {
      id: '#' + o._id.slice(-8),
      rawId: o._id,
      donor: o.donorId,
      type: 'In-kind',
      item: o.unit || 'Relief Goods',
      quantity: o.quantityOffered,
      location: 'N/A',
      date: new Date(o.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: statusMap[o.status] ?? o.status,
      requestId: o.requestId
    };
  }

  get filteredOffers(): DonationOffer[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.recentOffers;

    return this.recentOffers.filter((offer) => {
      const values = [
        offer.id,
        offer.donor,
        offer.type,
        offer.item,
        offer.quantity,
        offer.location,
        offer.date,
        offer.status
      ].join(' ').toLowerCase();

      return values.includes(term);
    });
  }

  statusClass(status: string): string {
    return 'offer-status-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  reviewOffer(offerId: string): void {
    const offer = this.recentOffers.find((item) => item.id === offerId || item.rawId === offerId);

    if (!offer) {
      return;
    }

    this.router.navigate([
      '/dswd-coordination',
      offer.requestId.replace(/^#/, ''),
      offer.rawId
    ]);
  }
}
