import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private notifications: NotificationService
  ) {}

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.notifications.error('Please enter your email and password.');
      return;
    }

    this.loading = true;
    const result = await this.auth.login(this.email, this.password);
    this.loading = false;

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.notifications.error(result.error ?? 'Login failed.');
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToDswdLogin(): void {
    this.router.navigate(['/dswd/login']);
  }

  goToUserLogin(): void {
    this.notifications.info('User login page');
  }
}
