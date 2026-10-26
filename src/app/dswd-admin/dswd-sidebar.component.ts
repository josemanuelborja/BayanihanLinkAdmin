import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DswdAuthService } from './dswd-auth.service';

@Component({
  selector: 'app-dswd-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dswd-sidebar.component.html',
  styleUrl: './dswd-sidebar.component.scss'
})
export class DswdSidebarComponent {
  private readonly router = inject(Router);
  private readonly dswdAuth = inject(DswdAuthService);

  @Input() activePage: 'queue' | 'review' = 'queue';

  logout(): void {
    this.dswdAuth.logout();
    void this.router.navigate(['/login']);
  }
}
