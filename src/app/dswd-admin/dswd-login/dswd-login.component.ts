import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dswd-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
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
