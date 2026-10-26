import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';

import { AdminUserBadgeComponent } from '../admin-user-badge/admin-user-badge.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';

export interface CoordinationNote {
  id: number;
  author: string;
  authorRole: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-external-coordination',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, AdminSidebarComponent, AdminUserBadgeComponent, NotificationBellComponent],
  templateUrl: './external-coordination.component.html',
  styleUrl: './external-coordination.component.scss'
})
export class ExternalPartnerCoordinationComponent {

  requestId = 'BL-000234';
  offerId = 'DO-000089';
  selectedStatus = 'Awaiting DSWD Confirmation';

  statuses = [
    'For Coordination',
    'Awaiting DSWD Confirmation',
    'Confirmed by DSWD',
    'Not confirmed by DSWD',
    'For Distribution',
    'Distributed'
  ];

  notes: CoordinationNote[] = [
    {
      id: 1,
      author: 'Admin User',
      authorRole: 'App Admin',
      time: 'Sep 16, 2026',
      text: 'No external confirmation recorded yet. The App Admin must contact DSWD outside BayanihanLink to confirm disaster eligibility and donation suitability.'
    }
  ];

  noteDraft = '';
  private nextNoteId = 2;

  get canPostNote(): boolean {
    return this.noteDraft.trim().length > 0;
  }

  addNote(): void {
    const text = this.noteDraft.trim();

    if (!text) {
      return;
    }

    this.notes = [
      ...this.notes,
      {
        id: this.nextNoteId++,
        author: 'App Admin',
        authorRole: 'App Admin',
        time: 'Just now',
        text
      }
    ];

    this.noteDraft = '';
    this.notifications.success('External coordination note recorded');
  }

  removeNote(id: number): void {
    this.notes = this.notes.filter(note => note.id !== id);
    this.notifications.info('Note removed');
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.route.params.subscribe(params => {
      if (params['requestId']) {
        this.requestId = params['requestId'];
      }

      if (params['offerId']) {
        this.offerId = params['offerId'];
      }
    });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
  }

  saveStatus(): void {
    this.notifications.success(`Coordination status recorded as ${this.selectedStatus}`);
  }

  backToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }

}
