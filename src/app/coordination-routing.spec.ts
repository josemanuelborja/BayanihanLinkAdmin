import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { DswdCoordinationComponent } from './dswd-coordination/dswd-coordination.component';
import { DonationOffersComponent } from './donation-offers/donation-offers.component';
import { RequestManagementComponent } from './request-management/request-management.component';
import { RequestReviewComponent } from './request-management/request-review/request-review.component';

describe('every coordination link lands on the coordination UI', () => {
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

  it('resolves the bare coordination route', async () => {
    await router.navigateByUrl('/dswd-coordination');
    expect(activeComponent()).toBe(DswdCoordinationComponent);
  });

  it('resolves request-only link to the coordination UI (not login)', async () => {
    await router.navigateByUrl('/dswd-coordination/BL-000301');
    expect(activeComponent()).toBe(DswdCoordinationComponent);
  });

  it('resolves request+offer link to the coordination UI', async () => {
    await router.navigateByUrl('/dswd-coordination/BL-000234/DO-000089');
    expect(activeComponent()).toBe(DswdCoordinationComponent);
  });

  it('Review on every request row lands on the review page', async () => {
    const cmp = TestBed.createComponent(RequestManagementComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');
    const targets: string[] = [];

    for (const r of cmp.requests) {
      cmp.review(r.id);
      const args = spy.mock.calls[spy.mock.calls.length - 1][0] as string[];
      targets.push(toUrl(args));
    }

    expect(new Set(targets).size).toBe(cmp.requests.length);

    for (const t of targets) {
      await router.navigateByUrl(t);
      expect(activeComponent(), `Review failed for ${t}`).toBe(RequestReviewComponent);
    }
  });

  it('Coordinate on every offer row lands on the coordination UI', async () => {
    const cmp = TestBed.createComponent(DonationOffersComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');

    for (const d of cmp.donations) {
      cmp.coordinate(d);
      const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
      await router.navigateByUrl(url);
      expect(activeComponent(), `Coordinate failed for ${url}`).toBe(DswdCoordinationComponent);
    }
  });

  it('shows the clicked request id, and defaults the offer when omitted', async () => {
    const cmp = await harness.navigateByUrl('/dswd-coordination/BL-000301', DswdCoordinationComponent);
    expect(cmp.requestId).toBe('BL-000301');
    expect(cmp.offerId).toBe('DO-000089');
  });

  it('shows both clicked ids when an offer row is used', async () => {
    const cmp = await harness.navigateByUrl('/dswd-coordination/BL-000241/DO-000085', DswdCoordinationComponent);
    expect(cmp.requestId).toBe('BL-000241');
    expect(cmp.offerId).toBe('DO-000085');
  });
});
