import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

export type DonationOfferStatus =
  | 'Pending'
  | 'Coordinating'
  | 'Verification'
  | 'Verified'
  | 'Distributed'
  | 'Completed';

export interface DonationOffer {
  id: string;
  donor: string;
  type: string;
  item: string;
  quantity: string;
  location: string;
  date: string;
  status: DonationOfferStatus;
  requestId: string;
}

const RECENT_DONATION_OFFERS: readonly DonationOffer[] = [
  {
    id: 'DO-000089',
    donor: 'Ramon Garcia',
    type: 'In-kind',
    item: 'Drinking Water (1L)',
    quantity: '30 bottles',
    location: 'Tondo, Manila',
    date: 'Sep 16, 2026',
    status: 'Pending',
    requestId: 'BL-000234'
  },
  {
    id: 'DO-000085',
    donor: 'Liza Cruz',
    type: 'Food Relief',
    item: 'Rice (5kg sacks)',
    quantity: '10 sacks',
    location: 'Cebu City',
    date: 'Sep 15, 2026',
    status: 'Coordinating',
    requestId: 'BL-000241'
  },
  {
    id: 'DO-000079',
    donor: 'Mike Santos',
    type: 'Essential Goods',
    item: 'Blankets',
    quantity: '25 pieces',
    location: 'Davao City',
    date: 'Sep 14, 2026',
    status: 'Verification',
    requestId: 'BL-000220'
  },
  {
    id: 'DO-000071',
    donor: 'Grace Lee',
    type: 'Medical Supply',
    item: 'Medicine Kit (First Aid)',
    quantity: '15 kits',
    location: 'Baguio City',
    date: 'Sep 10, 2026',
    status: 'Verified',
    requestId: 'BL-000189'
  }
];

@Component({
  selector: 'app-recent-donation-offers',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './recent-donation-offers.component.html',
  styleUrl: './recent-donation-offers.component.scss'
})
export class RecentDonationOffersComponent {
  private readonly router = inject(Router);

  readonly recentOffers: readonly DonationOffer[] = RECENT_DONATION_OFFERS;
  searchTerm = '';

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

  reviewOffer(offerId: string): void {
    const offer = this.recentOffers.find((item) => item.id === offerId);

    if (!offer) {
      return;
    }

    this.router.navigate([
      '/dswd-coordination',
      offer.requestId.replace(/^#/, ''),
      offer.id.replace(/^#/, '')
    ]);
  }
}
