import { TestBed } from '@angular/core/testing';

import { NotificationComponent } from './notification/notification.component';
import { NotificationBellComponent } from './notification/notification-bell.component';
import { NotificationService } from './notification/notification.service';

describe('notification feature', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotificationComponent, NotificationBellComponent]
    });
    service = TestBed.inject(NotificationService);
  });

  describe('NotificationService toasts', () => {
    it('starts with no toasts but a seeded inbox', () => {
      expect(service.toasts()).toEqual([]);
      expect(service.items().length).toBeGreaterThan(0);
    });

    it('queues a toast with the given type', () => {
      service.success('Saved.');
      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Saved.');
    });

    it('defaults to the info type', () => {
      service.info('FYI');
      expect(service.toasts()[0].type).toBe('info');
    });

    it('gives every toast a unique id', () => {
      service.info('one');
      service.error('two');
      const ids = service.toasts().map(t => t.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('removes a toast when dismissed', () => {
      service.info('bye');
      const id = service.toasts()[0].id;
      service.dismiss(id);
      expect(service.toasts()).toEqual([]);
    });

    it('auto-dismisses a toast after its duration', async () => {
      service.show('timed', 'info', 10);
      expect(service.toasts().length).toBe(1);
      await new Promise(resolve => setTimeout(resolve, 40));
      expect(service.toasts()).toEqual([]);
    });

    it('caps the visible stack and keeps the newest toasts', () => {
      for (let i = 0; i < 6; i++) {
        service.show(`toast ${i}`, 'info', 60000);
      }
      const toasts = service.toasts();
      expect(toasts.length).toBe(4);
      expect(toasts[toasts.length - 1].message).toBe('toast 5');
    });

    it('clears every toast and stops pending timers', () => {
      service.show('a', 'info', 60000);
      service.show('b', 'info', 60000);
      service.clearToasts();
      expect(service.toasts()).toEqual([]);
    });
  });

  describe('NotificationService inbox', () => {
    it('counts unread items', () => {
      const unread = service.items().filter(i => !i.read).length;
      expect(service.unreadCount()).toBe(unread);
      expect(service.hasUnread()).toBe(unread > 0);
    });

    it('prepends a new item and marks it unread', () => {
      const before = service.items().length;
      service.notify({ title: 'New', message: 'Something happened' });

      const items = service.items();
      expect(items.length).toBe(before + 1);
      expect(items[0].title).toBe('New');
      expect(items[0].read).toBe(false);
      expect(items[0].type).toBe('info');
      expect(items[0].category).toBe('system');
    });

    it('marks a single item as read', () => {
      const target = service.items().find(i => !i.read)!;
      service.markRead(target.id);
      expect(service.items().find(i => i.id === target.id)!.read).toBe(true);
    });

    it('marks all items as read', () => {
      service.markAllRead();
      expect(service.unreadCount()).toBe(0);
      expect(service.hasUnread()).toBe(false);
    });

    it('removes a single item', () => {
      const target = service.items()[0];
      service.removeItem(target.id);
      expect(service.items().some(i => i.id === target.id)).toBe(false);
    });

    it('clears every item', () => {
      service.clearItems();
      expect(service.items()).toEqual([]);
    });
  });

  describe('NotificationComponent', () => {
    it('renders a toast per queued notification', async () => {
      service.info('first');
      service.error('second');

      const fixture = TestBed.createComponent(NotificationComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      expect(rendered.querySelectorAll('.notif').length).toBe(2);
      expect(rendered.textContent).toContain('first');
      expect(rendered.textContent).toContain('second');
      expect(rendered.querySelector('.notif-error')).toBeTruthy();
    });

    it('renders nothing when the queue is empty', async () => {
      const fixture = TestBed.createComponent(NotificationComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      expect(rendered.querySelectorAll('.notif').length).toBe(0);
    });

    it('dismisses a toast when its close button is clicked', async () => {
      service.info('dismiss me');

      const fixture = TestBed.createComponent(NotificationComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      (rendered.querySelector('.notif-close') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(service.toasts()).toEqual([]);
      expect(rendered.querySelectorAll('.notif').length).toBe(0);
    });
  });

  describe('NotificationBellComponent', () => {
    it('shows the unread count and hides the panel until clicked', async () => {
      const fixture = TestBed.createComponent(NotificationBellComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      expect(rendered.querySelector('.bell-count')!.textContent!.trim()).toBe(
        String(service.unreadCount())
      );
      expect(rendered.querySelector('.bell-panel')).toBeNull();
    });

    it('opens the panel and marks everything read on click', async () => {
      const fixture = TestBed.createComponent(NotificationBellComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      (rendered.querySelector('.bell-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(rendered.querySelector('.bell-panel')).toBeTruthy();
      expect(service.unreadCount()).toBe(0);
      expect(rendered.querySelector('.bell-count')).toBeNull();
    });

    it('lists every inbox item and closes on an outside click', async () => {
      const total = service.items().length;

      const fixture = TestBed.createComponent(NotificationBellComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      (rendered.querySelector('.bell-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(rendered.querySelectorAll('.bell-item').length).toBe(total);

      document.body.click();
      await fixture.whenStable();

      expect(rendered.querySelector('.bell-panel')).toBeNull();
    });

    it('shows an empty state once the inbox is cleared', async () => {
      service.clearItems();

      const fixture = TestBed.createComponent(NotificationBellComponent);
      await fixture.whenStable();

      const rendered = fixture.nativeElement as HTMLElement;
      (rendered.querySelector('.bell-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(rendered.querySelector('.bell-empty')).toBeTruthy();
    });

    it('uses the plain style by default and the circle style on request', async () => {
      const plain = TestBed.createComponent(NotificationBellComponent);
      await plain.whenStable();
      expect(
        (plain.nativeElement as HTMLElement).querySelector('.bell-btn')!.classList
      ).not.toContain('is-circle');

      const circle = TestBed.createComponent(NotificationBellComponent);
      circle.componentInstance.circle = true;
      await circle.whenStable();
      expect(
        (circle.nativeElement as HTMLElement).querySelector('.bell-btn')!.classList
      ).toContain('is-circle');
    });
  });
});
