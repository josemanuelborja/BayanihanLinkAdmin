import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  constructor(
    private router: Router,
    private notifications: NotificationService
  ) {}

  login(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /** Hands over to the separate DSWD administrator portal. */
  goToDswdLogin(): void {
    this.router.navigate(['/dswd/login']);
  }

  /** Placeholder until the public user login page exists. */
  goToUserLogin(): void {
    this.notifications.info('User login page');
  }
}