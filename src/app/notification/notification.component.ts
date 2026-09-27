import { Component, inject } from '@angular/core';

import { NotificationType } from './notification.model';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  private readonly notifications = inject(NotificationService);

  readonly toasts = this.notifications.toasts;

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

  dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
