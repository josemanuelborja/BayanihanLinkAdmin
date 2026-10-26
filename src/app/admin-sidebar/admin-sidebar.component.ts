import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ApiService, ApiOffer } from '../api/api.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  pendingRequestCount = 0;
  pendingOfferCount = 0;

  async ngOnInit(): Promise<void> {
    try {
      const requests = await this.api.getRequests();
      this.pendingRequestCount = requests.filter(r => r.status === 'PENDING').length;

      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const offers = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );
      this.pendingOfferCount = offers.filter(o => o.status === 'PENDING').length;
    } catch {
      this.pendingRequestCount = 0;
      this.pendingOfferCount = 0;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
