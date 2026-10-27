// BayanihanLink — notification store
// Holds the transient toast queue and the persistent bell-dropdown inbox.

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import {
  AppNotification,
  NotificationCategory,
  NotificationInput,
  NotificationType,
  Toast
} from './notification.model';

// Older toasts drop off the top once the stack is this deep.
const MAX_VISIBLE_TOASTS = 4;
const DEFAULT_DURATION = 4000;

interface ApiNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly auth = inject(AuthService, { optional: true });

  private readonly toastState = signal<Toast[]>([]);
  private readonly itemState = signal<AppNotification[]>([]);

  readonly toasts = this.toastState.asReadonly();
  readonly items = this.itemState.asReadonly();

  readonly unreadCount = computed(() => this.itemState().filter(item => !item.read).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  private nextId = 1;
  private loadedForUserId = '';
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /* ---------- Inbox (loaded from MongoDB) ---------- */

  async loadInbox(force = false): Promise<void> {
    const user = this.auth?.currentUser();
    if (!user?.id || !this.http) {
      return;
    }
    if (!force && this.loadedForUserId === user.id) {
      return;
    }

    try {
      const rows = await firstValueFrom(
        this.http.get<ApiNotification[]>(`/api/notifications/user/${user.id}`, {
          headers: this.authHeaders()
        })
      );

      this.itemState.set(rows.map((row, index) => this.toAppNotification(row, index)));
      this.nextId = rows.length + 1;
      this.loadedForUserId = user.id;
    } catch {
      // No notifications yet, or the request failed: show the empty state.
      this.itemState.set([]);
    }
  }

  private toAppNotification(row: ApiNotification, index: number): AppNotification {
    const backendType = row.type || '';

    let type: NotificationType = 'info';
    if (backendType.includes('COMPLETED') || backendType.includes('ACCEPTED') || backendType.includes('SAVED')) {
      type = 'success';
    } else if (backendType.includes('REJECTED') || backendType.includes('FAILED')) {
      type = 'error';
    } else if (backendType.includes('REQUEST')) {
      type = 'warning';
    }

    let category: NotificationCategory = 'system';
    if (backendType.includes('COORDINATION')) {
      category = 'coordination';
    } else if (backendType.includes('OFFER') || backendType.includes('DSWD')) {
      category = 'donation';
    } else if (backendType.includes('REQUEST')) {
      category = 'request';
    }

    return {
      id: index + 1,
      remoteId: row._id,
      type,
      category,
      title: row.title || 'Notification',
      message: row.message || '',
      time: timeAgo(row.createdAt),
      read: !!row.isRead
    };
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth?.authToken() ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /* ---------- Toasts ---------- */

  show(message: string, type: NotificationType = 'info', durationMs = DEFAULT_DURATION): void {
    const id = this.nextId++;
    const next = [...this.toastState(), { id, type, message } satisfies Toast];

    if (next.length > MAX_VISIBLE_TOASTS) {
      next.slice(0, next.length - MAX_VISIBLE_TOASTS).forEach(toast => this.clearTimer(toast.id));
    }

    this.toastState.set(next.slice(-MAX_VISIBLE_TOASTS));
    this.timers.set(id, setTimeout(() => this.dismiss(id), durationMs));
  }

  info(message: string, durationMs = DEFAULT_DURATION): void {
    this.show(message, 'info', durationMs);
  }

  success(message: string, durationMs = DEFAULT_DURATION): void {
    this.show(message, 'success', durationMs);
  }

  warning(message: string, durationMs = DEFAULT_DURATION): void {
    this.show(message, 'warning', durationMs);
  }

  error(message: string, durationMs = DEFAULT_DURATION): void {
    this.show(message, 'error', durationMs);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.toastState.update(list => list.filter(toast => toast.id !== id));
  }

  clearToasts(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.toastState.set([]);
  }

  /* ---------- Inbox actions ---------- */

  notify(input: NotificationInput): void {
    const item: AppNotification = {
      id: this.nextId++,
      type: input.type ?? 'info',
      category: input.category ?? 'system',
      title: input.title,
      message: input.message,
      time: 'Just now',
      read: false
    };

    this.itemState.update(list => [item, ...list]);
  }

  markRead(id: number): void {
    const target = this.itemState().find(item => item.id === id);

    this.itemState.update(list =>
      list.map(item => (item.id === id && !item.read ? { ...item, read: true } : item))
    );

    if (target?.remoteId && this.http) {
      void firstValueFrom(
        this.http.put(`/api/notifications/${target.remoteId}/read`, {}, { headers: this.authHeaders() })
      ).catch(() => undefined);
    }
  }

  markAllRead(): void {
    this.itemState.update(list => list.map(item => (item.read ? item : { ...item, read: true })));

    const user = this.auth?.currentUser();
    if (user?.id && this.http) {
      void firstValueFrom(
        this.http.put(`/api/notifications/user/${user.id}/read-all`, {}, { headers: this.authHeaders() })
      ).catch(() => undefined);
    }
  }

  removeItem(id: number): void {
    this.itemState.update(list => list.filter(item => item.id !== id));
  }

  clearItems(): void {
    this.itemState.set([]);
  }

  categoryLabel(category: NotificationCategory): string {
    switch (category) {
      case 'request':
        return 'Request';
      case 'donation':
        return 'Donation';
      case 'coordination':
        return 'Coordination';
      default:
        return 'System';
    }
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
