import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { DswdDashboardComponent } from './dswd-admin/dswd-dashboard/dswd-dashboard.component';
import { DswdLoginComponent } from './dswd-admin/dswd-login/dswd-login.component';

describe('DSWD administrator login', () => {
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

  it('resolves the DSWD login route', async () => {
    await router.navigateByUrl('/dswd/login');
    expect(activeComponent()).toBe(DswdLoginComponent);
  });

  it('the "DSWD Administrator? Log in here" link leaves the admin login page', async () => {
    const cmp = TestBed.createComponent(LoginComponent).componentInstance;
    const spy = vi.spyOn(router, 'navigate');

    cmp.goToDswdLogin();

    expect(toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[])).toBe('/dswd/login');

    await router.navigateByUrl('/dswd/login');
    expect(activeComponent()).toBe(DswdLoginComponent);
  });

  it('signing in on the DSWD portal lands on the DSWD dashboard', async () => {
    const cmp = await harness.navigateByUrl('/dswd/login', DswdLoginComponent);
    const spy = vi.spyOn(router, 'navigate');

    cmp.login();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    expect(url).toBe('/dswd/dashboard');

    await router.navigateByUrl(url);
    expect(activeComponent()).toBe(DswdDashboardComponent);
  });

  it('"Back to User Login" on the DSWD portal returns to the admin login', async () => {
    const cmp = await harness.navigateByUrl('/dswd/login', DswdLoginComponent);
    const spy = vi.spyOn(router, 'navigate');

    cmp.goToUserLogin();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    await router.navigateByUrl(url);
    expect(activeComponent()).toBe(LoginComponent);
  });

  it('the admin login still goes to the admin dashboard', async () => {
    const cmp = await harness.navigateByUrl('/login', LoginComponent);
    const spy = vi.spyOn(router, 'navigate');

    cmp.login();

    const url = toUrl(spy.mock.calls[spy.mock.calls.length - 1][0] as string[]);
    await router.navigateByUrl(url);
    expect(activeComponent()).toBe(DashboardComponent);
  });

  it('toggles password visibility', async () => {
    const cmp = await harness.navigateByUrl('/dswd/login', DswdLoginComponent);

    expect(cmp.showPassword).toBe(false);
    cmp.togglePassword();
    expect(cmp.showPassword).toBe(true);
    cmp.togglePassword();
    expect(cmp.showPassword).toBe(false);
  });
});

describe('login forms render a usable password toggle', () => {
  beforeEach(() => {
    // Both login components inject Router, so the providers must be there.
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  /**
   * The bug: the toggle rendered nothing while the field was masked, so it
   * collapsed to zero width and could not be clicked to reveal the password.
   *
   * The state is set before the first change detection; flipping it afterwards
   * would trip NG0100 in dev mode.
   */
  function renderToggle(
    type: typeof LoginComponent | typeof DswdLoginComponent,
    showPassword: boolean
  ): HTMLButtonElement {
    const fixture = TestBed.createComponent(type as any);
    (fixture.componentInstance as any).showPassword = showPassword;
    fixture.detectChanges();

    return fixture.nativeElement.querySelector('.password-toggle') as HTMLButtonElement;
  }

  function assertToggle(type: typeof LoginComponent | typeof DswdLoginComponent): void {
    const hidden = renderToggle(type, false);

    expect(hidden.textContent?.trim(), 'toggle has no visible label').toBe('Show');
    expect(hidden.getAttribute('aria-label')).toBe('Show password');
    expect(hidden.getAttribute('aria-pressed')).toBe('false');

    const shown = renderToggle(type, true);

    expect(shown.textContent?.trim(), 'toggle has no visible label').toBe('Hide');
    expect(shown.getAttribute('aria-label')).toBe('Hide password');
    expect(shown.getAttribute('aria-pressed')).toBe('true');
  }

  it('is visible and labelled on the admin login', () => {
    assertToggle(LoginComponent);
  });

  it('is visible and labelled on the DSWD login', () => {
    assertToggle(DswdLoginComponent);
  });
});