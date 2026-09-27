import { Component, HostListener, Input, inject } from '@angular/core';

import { AppNotification, NotificationType } from './notification.model';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent {
  private readonly notifications = inject(NotificationService);

  readonly items = this.notifications.items;
  readonly unreadCount = this.notifications.unreadCount;
  readonly hasUnread = this.notifications.hasUnread;

  open = false;

  // The dashboard renders its bell as a white circle; the other topbars use a plain icon.
  @Input() circle = false;

  toggle(): void {
    this.open = !this.open;

    if (this.open) {
      this.notifications.markAllRead();
    }
  }

  // Any click outside the bell closes the dropdown.
  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.open = false;
  }

  markRead(item: AppNotification): void {
    this.notifications.markRead(item.id);
  }

  remove(item: AppNotification): void {
    this.notifications.removeItem(item.id);
  }

  clearAll(): void {
    this.notifications.clearItems();
  }

  labelFor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Notice';
    }
  }

  iconFor(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '✕';
      default:
        return 'i';
    }
  }
}
