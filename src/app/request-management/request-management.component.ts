import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';

interface RequestItem {
  id: string;
  requester: string;
  disaster: string;
  category: string;
  quantity: string;
  location: string;
  priority: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationBellComponent],
  templateUrl: './request-management.component.html',
  styleUrl: './request-management.component.scss'
})
export class RequestManagementComponent {

  search = '';
  statusFilter = 'All';
  priorityFilter = 'All';

  requests: RequestItem[] = [
    {
      id: '#BL-000302',
      requester: 'Ana Reyes',
      disaster: 'Typhoon',
      category: 'Food',
      quantity: '20 sacks',
      location: 'CDO City',
      priority: 'CRITICAL',
      status: 'Pending',
      date: 'Sep 16, 2026'
    },
    {
      id: '#BL-000301',
      requester: 'Juan Dela Cruz',
      disaster: 'Flood',
      category: 'Water',
      quantity: '50 bottles',
      location: 'Iligan City',
      priority: 'URGENT',
      status: 'Pending',
      date: 'Sep 16, 2026'
    },
    {
      id: '#BL-000298',
      requester: 'Rosa Gomez',
      disaster: 'Fire',
      category: 'Clothing',
      quantity: '30 sets',
      location: 'Davao City',
      priority: 'NORMAL',
      status: 'Verified',
      date: 'Sep 15, 2026'
    },
    {
      id: '#BL-000295',
      requester: 'Pedro Santos',
      disaster: 'Typhoon',
      category: 'Medicine',
      quantity: '10 kits',
      location: 'Butuan City',
      priority: 'URGENT',
      status: 'Assisted',
      date: 'Sep 14, 2026'
    },
    {
      id: '#BL-000290',
      requester: 'Maria Lopez',
      disaster: 'Earthquake',
      category: 'Blankets',
      quantity: '25 pieces',
      location: 'Surigao del Norte',
      priority: 'NORMAL',
      status: 'Completed',
      date: 'Sep 12, 2026'
    },
    {
      id: '#BL-000285',
      requester: 'Carlo Reyes',
      disaster: 'Flood',
      category: 'Food',
      quantity: '15 sacks',
      location: 'Cagayan de Oro',
      priority: 'CRITICAL',
      status: 'Pending',
      date: 'Sep 11, 2026'
    },
    {
      id: '#BL-000280',
      requester: 'Lita Santos',
      disaster: 'Typhoon',
      category: 'Hygiene',
      quantity: '40 packs',
      location: 'General Santos',
      priority: 'NORMAL',
      status: 'Verified',
      date: 'Sep 10, 2026'
    },
    {
      id: '#BL-000275',
      requester: 'Ramon Garcia',
      disaster: 'Fire',
      category: 'Clothing',
      quantity: '20 sets',
      location: 'Davao del Sur',
      priority: 'URGENT',
      status: 'Completed',
      date: 'Sep 9, 2026'
    }
  ];

  constructor(
    private router: Router,
    private notifications: NotificationService
  ) {}

  get filteredRequests(): RequestItem[] {
    return this.requests.filter(request => {
      const term = this.search.toLowerCase();

      const matchesSearch =
        !term ||
        request.id.toLowerCase().includes(term) ||
        request.requester.toLowerCase().includes(term) ||
        request.location.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'All' ||
        request.status === this.statusFilter;

      const matchesPriority =
        this.priorityFilter === 'All' ||
        request.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  setStatus(status: string): void {
    this.statusFilter = status;
  }

  setPriority(priority: string): void {
    this.priorityFilter = priority;
  }

  review(id: string): void {
    this.router.navigate([
      '/request-review',
      id.replace(/^#/, '')
    ]);
  }

  verify(id: string): void {
    this.notifications.success(`${id} marked for verification.`);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}