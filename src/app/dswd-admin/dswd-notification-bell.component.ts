import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiOffer, ApiRequest } from '../api/api.service';
import { DswdAuthService } from './dswd-auth.service';
import { buildDswdCases } from './dswd-request.data';

interface DswdInboxItem {
  id: string;
  caseId: string;
  title: string;
  message: string;
  type: 'request' | 'donation';
}

@Component({
  selector: 'app-dswd-notification-bell',
  standalone: true,
  templateUrl: './dswd-notification-bell.component.html',
  styleUrl: './dswd-notification-bell.component.scss'
})
export class DswdNotificationBellComponent implements OnInit {
  items: DswdInboxItem[] = [];
  open = false;

  private readonly read = new Set<string>();
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(DswdAuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` });
      const [offers, requests] = await Promise.all([
        firstValueFrom(this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })),
        firstValueFrom(this.http.get<ApiRequest[]>('/api/requests'))
      ]);

      this.items = buildDswdCases(offers, requests).map(item => ({
        id: `offer-${item.offerId}`,
        caseId: item.id,
        title: 'Donation offer for assessment',
        message: `#${item.offerId} · ${item.offerItem} · ${item.offerQuantity}`,
        type: 'donation'
      }));
    } catch {
      this.items = [];
    }

    this.cdr.markForCheck();
  }

  get unreadCount(): number {
    return this.items.filter(item => !this.read.has(item.id)).length;
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.items.forEach(item => this.read.add(item.id));
  }

  openCase(item: DswdInboxItem): void {
    this.open = false;
    void this.router.navigate(['/dswd/review', item.caseId]);
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.open = false;
  }
}
