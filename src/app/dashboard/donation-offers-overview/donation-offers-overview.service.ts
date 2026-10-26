import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL, API_ENABLED } from '../dashboard-api';
import {
  DONATION_OFFERS_OVERVIEW_FALLBACK,
  DonationOffersOverview
} from './donation-offers-overview.data';

@Injectable({ providedIn: 'root' })
export class DonationOffersOverviewService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiEnabled = inject(API_ENABLED);
  private readonly dataState = signal<DonationOffersOverview>(DONATION_OFFERS_OVERVIEW_FALLBACK);

  readonly data = this.dataState.asReadonly();
  async refresh(month: number | null = null, year: number | null = null): Promise<void> {
    if (!this.apiEnabled || !this.http) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<DonationOffersOverview>(`${this.baseUrl}/dashboard/donation-offers-overview`, {
          params: {
            ...(month !== null ? { month: String(month) } : {}),
            ...(year !== null ? { year: String(year) } : {})
          }
        })
      );
      this.dataState.set(data);
    } catch { /* Keep the chart empty while the API is unavailable. */ }
  }
}
