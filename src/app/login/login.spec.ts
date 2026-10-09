import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { routes } from '../app.routes';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: any;
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      // The real routes, so a link pointing at a missing path fails here
      // instead of silently falling through to `**`.
      providers: [provideRouter(routes)]
    });

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function el<T extends Element>(selector: string): T {
    return fixture.nativeElement.querySelector(selector) as T;
  }

  it('renders the password toggle with a visible label', () => {
    const toggle = el<HTMLButtonElement>('.password-toggle');

    expect(toggle).toBeTruthy();

    // The button is styled as bare text over the input, so an empty label
    // leaves it collapsed to a couple of pixels with nothing to click.
    expect(toggle.textContent?.trim()).toBeTruthy();
  });

  it('labels the toggle for what it will do, and toggles the input type', () => {
    const toggle = el<HTMLButtonElement>('.password-toggle');
    const input = el<HTMLInputElement>('#password');

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
  });

  it('never submits the form when the toggle is pressed', () => {
    const toggle = el<HTMLButtonElement>('.password-toggle');

    // Without type="button" the toggle would submit the login form.
    expect(toggle.getAttribute('type')).toBe('button');
  });

  it('signs in to the dashboard', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.login();
    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('sends the DSWD link to the DSWD portal, not the admin dashboard', async () => {
    const link = el<HTMLButtonElement>('.admin-link');

    expect(link.textContent).toContain('DSWD Administrator');

    link.click();
    await fixture.whenStable();

    expect(router.url).toBe('/dswd/login');
  });

  it('does not point the DSWD link at a route the router cannot resolve', async () => {
    // A link to a missing route falls through to `**` and lands on /login,
    // which looks identical to the button doing nothing.
    const link = el<HTMLButtonElement>('.admin-link');
    link.click();
    await fixture.whenStable();

    expect(router.url).not.toBe('/login');
  });

  it('labels the admin email and password inputs', () => {
    for (const id of ['email', 'password']) {
      const input = el<HTMLInputElement>(`#${id}`);
      const label = fixture.nativeElement.querySelector(`label[for="${id}"]`);

      expect(label, `#${id} has no label`).toBeTruthy();
      expect(input.name).toBeTruthy();
    }
  });
});
