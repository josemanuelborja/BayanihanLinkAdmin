import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dswd-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dswd-login.component.html',
  styleUrl: './dswd-login.component.scss'
})
export class DswdLoginComponent {

  email = '';
  password = '';
  showPassword = false;

  constructor(private router: Router) {}

  login(): void {
    this.router.navigate(['/dswd/dashboard']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }
}