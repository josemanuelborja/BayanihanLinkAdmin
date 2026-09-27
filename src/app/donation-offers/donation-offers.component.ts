import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../notification/notification-bell.component';

interface Donation {
  id: string;
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
  imports: [CommonModule, FormsModule, RouterLink, NotificationBellComponent],
  templateUrl: './donation-offers.component.html',
  styleUrl: './donation-offers.component.scss'
})
export class DonationOffersComponent {

  search = '';
  filter = 'All';

  donations: Donation[] = [
    {
      id: '#DO-000089',
      donor: 'Ramon Garcia',
      contact: '+63 917 XXX XXXX',
      request: '#BL-000234',
      item: 'Drinking Water (1L)',
      quantity: '30 bottles',
      status: 'Pending Coordination',
      date: 'Sep 16, 2026'
    },
    {
      id: '#DO-000085',
      donor: 'Liza Cruz',
      contact: '+63 918 XXX XXXX',
      request: '#BL-000241',
      item: 'Rice (5kg sacks)',
      quantity: '10 sacks',
      status: 'Coordinating',
      date: 'Sep 15, 2026'
    },
    {
      id: '#DO-000079',
      donor: 'Mike Santos',
      contact: '+63 915 XXX XXXX',
      request: '#BL-000220',
      item: 'Blankets',
      quantity: '25 pieces',
      status: 'For Verification',
      date: 'Sep 14, 2026'
    },
    {
      id: '#DO-000071',
      donor: 'Grace Lee',
      contact: '+63 912 XXX XXXX',
      request: '#BL-000189',
      item: 'Medicine Kit (First Aid)',
      quantity: '15 kits',
      status: 'Verified',
      date: 'Sep 10, 2026'
    },
    {
      id: '#DO-000065',
      donor: 'Nico Reyes',
      contact: '+63 920 XXX XXXX',
      request: '#BL-000161',
      item: 'Hygiene Kits',
      quantity: '40 packs',
      status: 'Distributed',
      date: 'Sep 8, 2026'
    },
    {
      id: '#DO-000055',
      donor: 'Alma Torres',
      contact: '+63 916 XXX XXXX',
      request: '#BL-000140',
      item: 'Canned Goods',
      quantity: '50 pieces',
      status: 'Completed',
      date: 'Aug 25, 2026'
    }
  ];

  constructor(
    private router: Router
  ) {}

  get filteredDonations(): Donation[] {
    const term = this.search.toLowerCase();

    return this.donations.filter(item => {
      const searchMatch =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.donor.toLowerCase().includes(term) ||
        item.request.toLowerCase().includes(term);

      const filterMatch =
        this.filter === 'All' || item.status === this.filter;

      return searchMatch && filterMatch;
    });
  }

  setFilter(filter: string): void {
    this.filter = filter;
  }

  coordinate(item: Donation): void {
    this.router.navigate([
      '/dswd-coordination',
      item.request.replace(/^#/, ''),
      item.id.replace(/^#/, '')
    ]);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}