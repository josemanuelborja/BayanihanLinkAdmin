import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dswd-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dswd-sidebar.component.html',
  styleUrl: './dswd-sidebar.component.scss'
})
export class DswdSidebarComponent {
  @Input() activePage: 'queue' | 'review' = 'queue';

  constructor(private readonly router: Router) {}

  logout(): void {
    sessionStorage.removeItem('bayanihanlink-dswd-demo-session');
    void this.router.navigate(['/login']);
  }
}
