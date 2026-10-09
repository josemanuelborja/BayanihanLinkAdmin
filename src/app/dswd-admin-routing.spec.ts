import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { LoginComponent } from './login/login.component';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DswdReviewComponent } from './dswd-admin/dswd-review/dswd-review.component';
import { DswdStatusComponent } from './dswd-admin/dswd-status/dswd-status.component';

describe('every DSWD admin link lands on its own page', () => {
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

  it('resolves the DSWD dashboard', async () => {
    await router.navigateByUrl('/dswd/dashboard');
    expect(activeComponent()).toBe(DswdDashboardComponent);
  });

  it('resolves the DSWD review page', async () => {
    await router.navigateByUrl('/dswd/review/BL-000234');
    expect(activeComponent()).toBe(DswdReviewComponent);
  });

  it('resolves the DSWD status page', async () => {
    await router.navigateByUrl('/dswd/status');
    expect(activeComponent()).toBe(DswdStatusComponent);
  });

  it('shows the clicked request id on the review page', async () => {
    const cmp = await harness.navigateByUrl('/dswd/review/BL-000302', DswdReviewComponent);
    expect(cmp.requestId).toBe('BL-000302');
  });

  it('Review on every dashboard row lands on the review page', async () => {
    const cmp = TestBed.createComponent(DswdDashboardComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');
    const ids = ['BL-000234', 'BL-000302', 'BL-000280', 'BL-000241', 'BL-000220'];
    const targets: string[] = [];

    for (const id of ids) {
      cmp.reviewRequest(id);
      targets.push(toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]));
    }

    expect(new Set(targets).size).toBe(ids.length);

    for (const t of targets) {
      await router.navigateByUrl(t);
      expect(activeComponent(), `Review failed for ${t}`).toBe(DswdReviewComponent);
    }
  });

  it('Review on every status row lands on the review page', async () => {
    const cmp = TestBed.createComponent(DswdStatusComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');
    const ids = ['BL-000123', 'BL-000234', 'BL-000189', 'BL-000256', 'BL-000290'];
    const targets: string[] = [];

    for (const id of ids) {
      cmp.review(id);
      targets.push(toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]));
    }

    expect(new Set(targets).size).toBe(ids.length);

    for (const t of targets) {
      await router.navigateByUrl(t);
      expect(activeComponent(), `Review failed for ${t}`).toBe(DswdReviewComponent);
    }
  });

  it('the Back button on the review page returns to the DSWD dashboard', async () => {
    const cmp = await harness.navigateByUrl('/dswd/review/BL-000234', DswdReviewComponent);
    const spy = vi.spyOn(router, 'navigate');

    cmp.backToDashboard();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    await router.navigateByUrl(url);
    expect(activeComponent(), `Back failed for ${url}`).toBe(DswdDashboardComponent);
  });

  it('logout from a DSWD page lands on login', async () => {
    const cmp = await harness.navigateByUrl('/dswd/dashboard', DswdDashboardComponent);
    const spy = vi.spyOn(router, 'navigate');

    cmp.logout();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    await router.navigateByUrl(url);
    expect(activeComponent(), `Logout failed for ${url}`).toBe(LoginComponent);
  });

  it('does not fall through to login for any DSWD sidebar link', async () => {
    const urls = ['/dswd/dashboard', '/dswd/review/BL-000234', '/dswd/status'];

    for (const url of urls) {
      await router.navigateByUrl(url);
      expect(activeComponent(), `${url} fell through to login`).not.toBe(LoginComponent);
    }
  });
});