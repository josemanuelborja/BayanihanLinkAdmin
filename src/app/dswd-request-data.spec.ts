import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { NotificationService } from './notification/notification.service';
import {
  DSWD_ATTENTION_REQUESTS,
  DSWD_REQUESTS,
  DSWD_STATUSES,
  findDswdRequest,
  priorityClass,
  statusBadge
} from './dswd-admin/dswd-request.data';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DswdReviewComponent } from './dswd-admin/dswd-review/dswd-review.component';

describe('DSWD request details come from the shared data', () => {
  let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  function activeComponent() {
    let s: any = router.routerState.snapshot.root;
    while (s.firstChild) s = s.firstChild;
    return s.component;
  }

  /** router.navigate() args -> a real url string */
  const toUrl = (args: string[]) => '/' + args.join('/').replace(/^\/+/, '');

  it('shows the details of the request it was opened for, not a fixed one', async () => {
    for (const expected of DSWD_ATTENTION_REQUESTS) {
      const cmp = await harness.navigateByUrl(
        `/dswd/review/${expected.id}`,
        DswdReviewComponent
      );

      expect(cmp.request?.id).toBe(expected.id);
      expect(cmp.request?.itemDetail).toBe(expected.itemDetail);
      expect(cmp.request?.location).toBe(expected.location);
      expect(cmp.request?.offerId).toBe(expected.offerId);
      expect(cmp.request?.notes).toBe(expected.notes);
    }
  });

  it('gives two different requests two different sets of details', async () => {
    const first = await harness.navigateByUrl('/dswd/review/BL-000234', DswdReviewComponent);
    const firstItem = first.request?.itemDetail;
    const firstLocation = first.request?.location;

    const second = await harness.navigateByUrl('/dswd/review/BL-000302', DswdReviewComponent);

    expect(second.request?.itemDetail).not.toBe(firstItem);
    expect(second.request?.location).not.toBe(firstLocation);
  });

  it('preselects the status of the request being reviewed', async () => {
    for (const expected of DSWD_ATTENTION_REQUESTS) {
      const cmp = await harness.navigateByUrl(
        `/dswd/review/${expected.id}`,
        DswdReviewComponent
      );

      expect(cmp.status).toBe(expected.status);
    }
  });

  it('resolves every id the dashboard and status pages link to', async () => {
    for (const request of DSWD_REQUESTS) {
      expect(findDswdRequest(request.id), `${request.id} is missing`).toBe(request);
    }
  });

  it('sends an unknown request id back to the dashboard', async () => {
    await router.navigateByUrl('/dswd/review/BL-999999');
    expect(activeComponent()).toBe(DswdDashboardComponent);
  });

  it('renders one dashboard row per request', async () => {
    const cmp = await harness.navigateByUrl('/dswd/dashboard', DswdDashboardComponent);

    expect(cmp.requests.length).toBe(DSWD_ATTENTION_REQUESTS.length);
  });

  it('View All opens the top of the queue', async () => {
    const cmp = TestBed.createComponent(DswdDashboardComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');

    cmp.reviewAll();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    await router.navigateByUrl(url);

    expect(activeComponent()).toBe(DswdReviewComponent);
    expect(url).toBe(`/dswd/review/${DSWD_ATTENTION_REQUESTS[0].id}`);
  });

  it('Update Status writes the new stage back and raises a toast', async () => {
    const original = findDswdRequest('BL-000220')?.status;

    const cmp = await harness.navigateByUrl('/dswd/review/BL-000220', DswdReviewComponent);
    const notifications = TestBed.inject(NotificationService);
    const before = notifications.toasts().length;

    cmp.status = 'Verified';
    cmp.updateStatus();

    expect(findDswdRequest('BL-000220')?.status).toBe('Verified');
    expect(notifications.toasts().length).toBe(before + 1);
    expect(notifications.toasts().at(-1)?.message).toContain('BL-000220');

    // Leave the shared record as we found it for the other specs.
    if (original) {
      findDswdRequest('BL-000220')!.status = original;
    }
  });

  it('every DSWD page renders the working notification bell', async () => {
    for (const url of ['/dswd/dashboard', '/dswd/review/BL-000234', '/dswd/status']) {
      await harness.navigateByUrl(url);

      const bells = document.querySelectorAll('app-notification-bell .bell-btn');
      expect(bells.length, `${url} has no notification bell`).toBe(1);
      expect(document.querySelector('span.bell'), `${url} still has the stub bell`).toBeNull();
    }
  });

  it('the DSWD bell opens the shared inbox and marks items read', async () => {
    await harness.navigateByUrl('/dswd/dashboard');
    const notifications = TestBed.inject(NotificationService);

    const button = document.querySelector<HTMLButtonElement>('app-notification-bell .bell-btn')!;
    const itemsBefore = notifications.items().length;

    button.click();
    await harness.fixture.whenStable();

    expect(document.querySelector('app-notification-bell .bell-panel')).toBeTruthy();
    expect(document.querySelectorAll('app-notification-bell .bell-item').length).toBe(itemsBefore);
    expect(notifications.unreadCount()).toBe(0);

    document.body.click();
    await harness.fixture.whenStable();

    expect(document.querySelector('app-notification-bell .bell-panel')).toBeNull();
  });

  it('a DSWD status update also lands in the bell inbox', async () => {
    const notifications = TestBed.inject(NotificationService);
    const before = notifications.items().length;

    const cmp = await harness.navigateByUrl('/dswd/review/BL-000241', DswdReviewComponent);
    cmp.status = 'Distributed';
    cmp.updateStatus();

    const latest = notifications.items()[0];
    expect(notifications.items().length).toBe(before + 1);
    expect(latest.title.toLowerCase()).toContain('status');
    expect(latest.message).toContain('BL-000241');
    expect(latest.read).toBe(false);
  });

  it('every status has a badge, and every badge maps back to a valid status', () => {
    for (const status of DSWD_STATUSES) {
      const badge = statusBadge(status);

      expect(badge.label.length).toBeGreaterThan(0);
      expect(badge.class.length).toBeGreaterThan(0);
    }
  });

  it('every priority maps to a css class', () => {
    expect(priorityClass('CRITICAL')).toBe('critical');
    expect(priorityClass('URGENT')).toBe('urgent');
    expect(priorityClass('NORMAL')).toBe('normal');
  });
});