import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiOffer, ApiService } from '../../api/api.service';

export type DonationOfferStatus =
  | 'Pending'
  | 'Coordinating'
  | 'Verification'
  | 'Verified'
  | 'Distributed'
  | 'Completed'
  | 'Rejected';

export interface DonationOffer {
  id: string;
  rawId: string;
  requestId: string;
  requestRawId: string;
  donor: string;
  type: string;
  item: string;
  quantity: string;
  location: string;
  date: string;
  status: DonationOfferStatus;
}

@Component({
  selector: 'app-recent-donation-offers',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './recent-donation-offers.component.html',
  styleUrl: './recent-donation-offers.component.scss'
})
export class RecentDonationOffersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  recentOffers: DonationOffer[] = [];
  searchTerm = '';

  async ngOnInit(): Promise<void> {
    // Keep rows that a test (or a parent) already supplied.
    if (this.recentOffers.length === 0) {
      await this.loadOffers();
    }
  }

  private async loadOffers(): Promise<void> {
    const rows = await this.api.getAllOffers();
    this.recentOffers = rows.slice(0, 4).map(offer => this.toDisplay(offer));
    this.cdr.markForCheck();
  }

  private toDisplay(offer: ApiOffer): DonationOffer {
    const statusMap: Record<string, DonationOfferStatus> = {
      PENDING: 'Pending',
      ACCEPTED: 'Coordinating',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed'
    };

    return {
      id: offer.referenceNo || offer._id,
      rawId: offer._id,
      requestId: offer.requestReferenceNo || offer.requestId,
      requestRawId: offer.requestId,
      donor: offer.donorName || offer.donorId,
      type: 'In-kind',
      item: offer.requestItem || offer.unit || 'Relief Goods',
      quantity: (offer.quantityOffered + ' ' + (offer.unit || '')).trim(),
      location: offer.requestLocation || 'Not specified',
      date: new Date(offer.createdAt).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      status: statusMap[offer.status] ?? 'Pending'
    };
  }

  get filteredOffers(): readonly DonationOffer[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.recentOffers;
    }

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

  statusClass(status: DonationOfferStatus): string {
    return 'offer-status-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  statusLabel(status: DonationOfferStatus): string {
    if (status === 'Verification') return 'Awaiting DSWD validation';
    if (status === 'Verified') return 'DSWD confirmed';
    return status;
  }

  reviewOffer(offerId: string): void {
    const offer = this.recentOffers.find((item) => item.id === offerId);

    if (!offer) {
      return;
    }

    // The coordination page stores real database ids, so keep them here even
    // though the table shows the friendly DO-... reference.
    this.router.navigate([
      '/external-coordination',
      offer.requestRawId,
      offer.rawId
    ]);
  }
}
