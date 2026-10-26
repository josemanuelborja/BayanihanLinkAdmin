import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-dswd-login',
  standalone: true,
  imports: [FormsModule, Button],
  templateUrl: './dswd-login.component.html',
  styleUrl: './dswd-login.component.scss'
})
export class DswdLoginComponent {

  email = '';
  password = '';
  showPassword = false;

  constructor(private router: Router) {}

  login(): void {
    if (!this.email.trim() || !this.password) return;
    // Prototype-only client marker; this is not credential authentication.
    sessionStorage.setItem('bayanihanlink-dswd-demo-session', 'true');
    this.router.navigate(['/dswd/dashboard']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }
}
