import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { DswdLoginComponent } from './dswd-admin/dswd-login/dswd-login.component';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DswdReviewComponent } from './dswd-admin/dswd-review/dswd-review.component';
import { RequestManagementComponent } from './request-management/request-management.component';
import { RequestReviewComponent } from './request-management/request-review/request-review.component';

describe('App Admin and DSWD validation responsibilities', () => {
  let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    sessionStorage.removeItem('bayanihanlink-dswd-demo-session');
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it('provides a separate DSWD sign-in and limits the role to validation queue/review', async () => {
    await harness.navigateByUrl('/dswd/login', DswdLoginComponent);
    expect(router.url).toBe('/dswd/login');

    const login = await harness.navigateByUrl('/dswd/login', DswdLoginComponent);
    login.email = 'officer@dswd.gov.ph';
    login.password = 'bayanihanlinkgov123';
    vi.spyOn((login as any).dswdAuth, 'login').mockImplementation(async () => {
      sessionStorage.setItem('bayanihanlink-dswd-demo-session', 'true');
      return { success: true };
    });
    await login.login();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/dswd/dashboard');
    expect(router.routerState.snapshot.root.firstChild?.routeConfig?.component).toBe(DswdDashboardComponent);

    await router.navigateByUrl('/dswd/review/BL-000234');
    expect(router.url).toBe('/dswd/review/BL-000234');
    expect(router.routerState.snapshot.root.firstChild?.routeConfig?.component).toBe(DswdReviewComponent);
  });

  it('does not expose DSWD distribution/status administration routes', async () => {
    await router.navigateByUrl('/dswd/status');
    expect(router.url).toBe('/login');
  });

  it('keeps request priority and platform workflow actions in App Admin review', () => {
    const adminRequests = TestBed.createComponent(RequestManagementComponent).componentInstance;
    const adminReview = TestBed.createComponent(RequestReviewComponent).componentInstance;

    expect((adminRequests as any).verify).toBeDefined();
    expect((adminReview as any).verifyRequest).toBeDefined();
    expect(adminReview.statuses).toContain('Verified');
    expect(adminReview.statuses).not.toContain('DSWD Confirmed');
  });
});
