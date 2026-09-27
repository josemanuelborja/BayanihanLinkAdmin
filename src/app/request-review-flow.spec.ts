import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { RequestManagementComponent } from './request-management/request-management.component';
import { RequestReviewComponent } from './request-management/request-review/request-review.component';
import { RequestVerifiedComponent } from './request-management/request-verified/request-verified.component';
import { DswdCoordinationComponent } from './dswd-coordination/dswd-coordination.component';
import { LoginComponent } from './login/login.component';

describe('request review -> verified -> coordination flow', () => {
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

  const toUrl = (args: string[]) => '/' + args.join('/').replace(/^\/+/, '');

  it('routes resolve to the right components (never login)', async () => {
    const cases: [string, any][] = [
      ['/request-review/BL-000301', RequestReviewComponent],
      ['/request-verified/BL-000301', RequestVerifiedComponent],
      ['/dswd-coordination/BL-000301', DswdCoordinationComponent],
    ];

    for (const [url, expected] of cases) {
      await router.navigateByUrl(url);
      expect(activeComponent(), url).toBe(expected);
      expect(activeComponent(), url).not.toBe(LoginComponent);
    }
  });

  it('walks the whole flow end to end from the Review button', async () => {
    // 1. click Review on a real row
    const list = TestBed.createComponent(RequestManagementComponent).componentInstance;
    const row = list.requests[1]; // #BL-000301
    const spy = vi.spyOn(router, 'navigate');
    list.review(row.id);
    const reviewUrl = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    expect(reviewUrl).toBe('/request-review/BL-000301');

    // 2. the review page shows that id
    const review = await harness.navigateByUrl(reviewUrl, RequestReviewComponent);
    expect(review.requestId).toBe('BL-000301');

    // 3. click Verify
    spy.mockClear();
    review.verifyRequest();
    const verifiedUrl = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    expect(verifiedUrl).toBe('/request-verified/BL-000301');
    await router.navigateByUrl(verifiedUrl);
    expect(activeComponent()).toBe(RequestVerifiedComponent);

    // 4. proceed onward to coordination, carrying the same id
    const verified = await harness.navigateByUrl(verifiedUrl, RequestVerifiedComponent);
    expect(verified.requestId).toBe('BL-000301');

    spy.mockClear();
    verified.proceedToCoordination();
    const coordUrl = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    expect(coordUrl).toBe('/dswd-coordination/BL-000301');
    await router.navigateByUrl(coordUrl);
    expect(activeComponent()).toBe(DswdCoordinationComponent);

    // 5. the coordination page receives it
    const coord = await harness.navigateByUrl(coordUrl, DswdCoordinationComponent);
    expect(coord.requestId).toBe('BL-000301');
  });

  it('Rejects back to the request list', async () => {
    const review = await harness.navigateByUrl('/request-review/BL-000302', RequestReviewComponent);
    const spy = vi.spyOn(router, 'navigate');
    review.rejectRequest();
    expect(toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[])).toBe('/request-management');
  });

  it('verified page links back to the request list', async () => {
    const v = await harness.navigateByUrl('/request-verified/BL-000302', RequestVerifiedComponent);
    const spy = vi.spyOn(router, 'navigate');
    v.backToRequests();
    expect(toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[])).toBe('/request-management');
  });

  it('the verified page has no double-# in the displayed id', async () => {
    const v = await harness.navigateByUrl('/request-verified/BL-000302', RequestVerifiedComponent);
    expect(v.requestId.startsWith('#')).toBe(false);
  });
});
