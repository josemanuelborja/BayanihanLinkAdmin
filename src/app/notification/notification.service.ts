// BayanihanLink — notification store
// Holds the transient toast queue and the persistent bell-dropdown inbox.

import { Injectable, computed, signal } from '@angular/core';

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

function timeAgo(minutes: number): string {
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

function seedItems(startId: number): AppNotification[] {
  const seeds: Array<NotificationInput & { minutesAgo: number; read: boolean }> = [
    {
      minutesAgo: 4,
      read: false,
      type: 'warning',
      category: 'request',
      title: 'Urgent request needs review',
      message: '#BL-000123 · Typhoon · Food & Water · CDO City'
    },
    {
      minutesAgo: 18,
      read: false,
      type: 'info',
      category: 'donation',
      title: 'New donation offer',
      message: 'DO-000089 · Blankets & Clothing · 240 units'
    },
    {
      minutesAgo: 52,
      read: false,
      type: 'success',
      category: 'coordination',
      title: 'Distribution completed',
      message: 'Request #BL-000189 · Hygiene Supplies · Davao City'
    },
    {
      minutesAgo: 145,
      read: true,
      type: 'error',
      category: 'request',
      title: 'Verification failed',
      message: 'Request #BL-000234 · Iligan City · Documents unreadable'
    },
    {
      minutesAgo: 320,
      read: true,
      type: 'info',
      category: 'system',
      title: 'System maintenance scheduled',
      message: 'The portal will be unavailable on Sunday, 02:00–04:00'
    }
  ];

  return seeds.map((seed, index) => ({
    id: startId + index,
    type: seed.type ?? 'info',
    category: seed.category ?? 'system',
    title: seed.title,
    message: seed.message,
    time: timeAgo(seed.minutesAgo),
    read: seed.read
  }));
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastState = signal<Toast[]>([]);
  private readonly itemState = signal<AppNotification[]>([]);

  readonly toasts = this.toastState.asReadonly();
  readonly items = this.itemState.asReadonly();

  readonly unreadCount = computed(() => this.itemState().filter(item => !item.read).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor() {
    this.itemState.set(seedItems(this.nextId));
    this.nextId += 5;
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

  /* ---------- Inbox ---------- */

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
    this.itemState.update(list =>
      list.map(item => (item.id === id && !item.read ? { ...item, read: true } : item))
    );
  }

  markAllRead(): void {
    this.itemState.update(list => list.map(item => (item.read ? item : { ...item, read: true })));
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
