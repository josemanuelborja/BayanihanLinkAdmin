import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DSWD_VALIDATION_CASES } from './dswd-request.data';

interface DswdInboxItem {
  id: string;
  caseId: string;
  title: string;
  message: string;
  type: 'request' | 'donation';
}

@Component({
  selector: 'app-dswd-notification-bell',
  standalone: true,
  templateUrl: './dswd-notification-bell.component.html',
  styleUrl: './dswd-notification-bell.component.scss'
})
export class DswdNotificationBellComponent {
  readonly items: DswdInboxItem[] = DSWD_VALIDATION_CASES.flatMap(item => {
    const donation: DswdInboxItem = {
      id: `donation-${item.offerId}`,
      caseId: item.id,
      title: item.donationType === 'Open donation' ? 'New open donation offer' : 'New donation for assessment',
      message: `#${item.offerId} · ${item.offerItem} · ${item.offerQuantity}`,
      type: 'donation'
    };
    if (item.donationType === 'Open donation') return [donation];
    return [
      {
        id: `request-${item.requestId}`,
        caseId: item.id,
        title: 'New assistance request to review',
        message: `#${item.requestId} · ${item.item} · ${item.quantity}`,
        type: 'request'
      },
      donation
    ];
  });

  open = false;
  private readonly read = new Set<string>();

  constructor(private readonly router: Router) {}

  get unreadCount(): number {
    return this.items.filter(item => !this.read.has(item.id)).length;
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.items.forEach(item => this.read.add(item.id));
  }

  openCase(item: DswdInboxItem): void {
    this.open = false;
    void this.router.navigate(['/dswd/review', item.caseId]);
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void { this.open = false; }
}
