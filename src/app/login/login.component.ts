import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Button],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  constructor(
    private router: Router
  ) {}

  login(): void {
    this.router.navigate(['/dashboard']);
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
