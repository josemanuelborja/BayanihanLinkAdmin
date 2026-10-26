import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { DswdAuthService } from '../dswd-auth.service';

@Component({
  selector: 'app-dswd-login',
  standalone: true,
  imports: [FormsModule, Button],
  templateUrl: './dswd-login.component.html',
  styleUrl: './dswd-login.component.scss'
})
export class DswdLoginComponent {
  private readonly dswdAuth = inject(DswdAuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  async login(): Promise<void> {
    if (!this.email.trim() || !this.password) return;
    this.loading = true;
    this.errorMessage = '';
    const res = await this.dswdAuth.login(this.email, this.password);
    this.loading = false;
    if (res.success) {
      this.router.navigate(['/dswd/dashboard']);
    } else {
      this.errorMessage = res.error || 'Login failed';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }
}
