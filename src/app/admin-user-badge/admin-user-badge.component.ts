import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-user-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-user-badge.component.html',
  styleUrl: './admin-user-badge.component.scss'
})
export class AdminUserBadgeComponent {
  private readonly auth = inject(AuthService);

  get name(): string {
    return this.auth.currentUser()?.fullName ?? 'Admin User';
  }

  get initials(): string {
    const name = this.name;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
