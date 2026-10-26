import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Button],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  async login(): Promise<void> {
    if (!this.email.trim() || !this.password) return;
    this.loading = true;
    this.errorMessage = '';
    const res = await this.auth.login(this.email, this.password);
    this.loading = false;
    if (res.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = res.error || 'Login failed';
    }
  }

  goToDswdLogin(): void {
    this.router.navigate(['/dswd/login']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /** Placeholder until the public user login page exists. */
  goToUserLogin(): void {
    // Public-user authentication is outside this App Admin portal.
  }
}
