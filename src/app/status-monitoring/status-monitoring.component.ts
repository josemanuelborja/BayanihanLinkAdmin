import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../notification/notification-bell.component';

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
  imports: [CommonModule, RouterLink, NotificationBellComponent],
  templateUrl: './status-monitoring.component.html',
  styleUrl: './status-monitoring.component.scss'
})
export class StatusMonitoringComponent {

  tracking: TrackingItem[] = [
    {
      id: '#BL-000123',
      name: 'Maria Santos',
      priority: 'URGENT',
      disaster: 'Typhoon · Food & Water',
      location: 'CDO City',
      current: 4
    },
    {
      id: '#BL-000234',
      name: 'Juan Dela Cruz',
      priority: 'CRITICAL',
      disaster: 'Flood · Drinking Water',
      location: 'Iligan City',
      current: 3
    },
    {
      id: '#BL-000189',
      name: 'Ana Reyes',
      priority: 'NORMAL',
      disaster: 'Fire · Medicine Kit',
      location: 'Davao City',
      current: 6
    },
    {
      id: '#BL-000256',
      name: 'Pedro Cruz',
      priority: 'URGENT',
      disaster: 'Typhoon · Blankets & Clothing',
      location: 'Butuan City',
      current: 2
    },
    {
      id: '#BL-000290',
      name: 'Rosa Lopez',
      priority: 'NORMAL',
      disaster: 'Earthquake · Hygiene Supplies',
      location: 'Surigao del Norte',
      current: 5
    }
  ];

  stages = [
    'Submitted',
    'Verified',
    'Assistance Offered',
    "Gov't Verification",
    'Distributed',
    'Completed'
  ];

  constructor(private router: Router) {}

  logout(): void {
    this.router.navigate(['/login']);
  }
}