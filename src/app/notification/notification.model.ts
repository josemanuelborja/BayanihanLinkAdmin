// BayanihanLink — notification types

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory = 'system' | 'request' | 'donation' | 'coordination';

// A persistent entry in the bell dropdown.
export interface AppNotification {
  id: number;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// A transient message shown in the corner of the screen.
export interface Toast {
  id: number;
  type: NotificationType;
  message: string;
}

export interface NotificationInput {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
}
