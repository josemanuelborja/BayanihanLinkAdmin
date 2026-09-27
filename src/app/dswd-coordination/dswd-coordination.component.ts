import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationBellComponent } from '../notification/notification-bell.component';
import { NotificationService } from '../notification/notification.service';

export interface CoordinationNote {
  id: number;
  author: string;
  role: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-dswd-coordination',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationBellComponent],
  templateUrl: './dswd-coordination.component.html',
  styleUrl: './dswd-coordination.component.scss'
})
export class DswdCoordinationComponent {

  requestId = 'BL-000234';
  offerId = 'DO-000089';
  selectedStatus = 'Submitted for Verification';

  statuses = [
    'For Coordination',
    'Submitted for Verification',
    'Verified',
    'For Distribution',
    'Distributed'
  ];

  notes: CoordinationNote[] = [
    {
      id: 1,
      author: 'Admin User',
      role: 'Administrator',
      time: 'Sep 16, 2026',
      text: 'Coordination submitted to DSWD Region X. Awaiting verification response. Donor confirmed availability on Sep 16, 2026.'
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
        author: 'Admin User',
        role: 'Administrator',
        time: 'Just now',
        text
      }
    ];

    this.noteDraft = '';
    this.notifications.success('Note added to coordination case');
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
    this.notifications.success(`Status updated to ${this.selectedStatus}`);
  }

  backToOffers(): void {
    this.router.navigate(['/donation-offers']);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}