import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExternalPartnerCoordinationComponent } from './external-coordination/external-coordination.component';
import { DonationOffersComponent } from './donation-offers/donation-offers.component';
import { RequestManagementComponent } from './request-management/request-management.component';
import { StatusMonitoringComponent } from './status-monitoring/status-monitoring.component';
import { RecentRequestsComponent } from './dashboard/recent-requests/recent-requests.component';

const EXPECTED: Record<string, any> = {
  '/dashboard': DashboardComponent,
  '/request-management': RequestManagementComponent,
  '/donation-offers': DonationOffersComponent,
  '/external-coordination': ExternalPartnerCoordinationComponent,
  '/status-monitoring': StatusMonitoringComponent,
};

function activeComponent(router: Router) {
  let s: any = router.routerState.snapshot.root;
  while (s.firstChild) s = s.firstChild;
  return s.component;
}

describe('sidebar navigation', () => {
  let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  const PAGES = [
    '/dashboard',
    '/request-management',
    '/donation-offers',
    '/external-coordination',
    '/status-monitoring',
  ];

  for (const from of PAGES) {
    it(`every sidebar link on ${from} navigates to its own page`, async () => {
      await harness.navigateByUrl(from);

      const links: HTMLAnchorElement[] = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('nav a[href]')
      );

      // the sidebar must be real links, not buttons with click handlers
      expect(links.length, `no sidebar links found on ${from}`).toBe(5);

      for (const link of links) {
        const href = link.getAttribute('href')!;
        expect(EXPECTED[href], `${from} -> ${href} is not a known page`).toBeTruthy();

        await harness.navigateByUrl(from);
        const current: HTMLAnchorElement[] = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('nav a[href]')
        );
        const target = current.find(a => a.getAttribute('href') === href)!;

        target.click();
        await harness.fixture.whenStable();

        expect(router.url, `clicking ${href} from ${from}`).toBe(href);
        expect(activeComponent(router), `clicking ${href} from ${from}`).toBe(EXPECTED[href]);
      }
    // This re-renders the whole page once per sidebar link, and the sidebar
    // now carries six inline SVGs. jsdom parses SVG far more slowly than
    // HTML, so the default 5s is not enough for 25 full page renders.
    }, 30000);
  }

  it('dashboard "View All" link goes to request management', async () => {
    await harness.navigateByUrl('/dashboard');
    const viewAll = document.querySelector<HTMLAnchorElement>('a.view-all');
    expect(viewAll).toBeTruthy();

    viewAll!.click();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/request-management');
    expect(activeComponent(router)).toBe(RequestManagementComponent);
  });

  it('has no leftover alert-only stubs on the dashboard', async () => {
    const cmp = TestBed.createComponent(DashboardComponent).componentInstance as any;
    expect(cmp.openPage).toBeUndefined();
  });

  it('every dashboard Review button opens the review page for that row', async () => {
    const fixture = TestBed.createComponent(RecentRequestsComponent);
    (fixture.componentInstance as any).requests = ['BL-000302', 'BL-000301', 'BL-000298', 'BL-000295', 'BL-000290'].map(id => ({
      id, requester: '', disaster: '', category: '', location: '', priority: 'NORMAL' as const,
      status: 'Pending', date: '2026-09-16'
    }));
    fixture.detectChanges();
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button.review-button')) as HTMLButtonElement[];
    expect(buttons).toHaveLength(5);
    buttons.forEach((button, index) => {
      button.click();
      const id = fixture.componentInstance.requests[index].id;
      expect(spy).toHaveBeenLastCalledWith(['/request-review', id]);
    });
  });
});
