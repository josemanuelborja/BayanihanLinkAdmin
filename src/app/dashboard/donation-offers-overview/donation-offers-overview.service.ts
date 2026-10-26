import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DonationOffersOverview
} from './donation-offers-overview.data';
import { ApiOffer } from '../../api/api.service';
import { AuthService } from '../../auth/auth.service';
import { HttpHeaders } from '@angular/common/http';

const EMPTY_DONATION_DATA: DonationOffersOverview = {
  period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  totalOffers: 0,
  awaitingReview: 0,
  coordinatedWithDswd: 0,
  updatesRecorded: 0,
  trend: []
};

@Injectable({ providedIn: 'root' })
export class DonationOffersOverviewService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly dataState = signal<DonationOffersOverview>(EMPTY_DONATION_DATA);

  readonly data = this.dataState.asReadonly();

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const token = this.auth.authToken();
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      const offers = await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/admin/all', { headers })
      );

      const pending = offers.filter(o => o.status === 'PENDING').length;
      const accepted = offers.filter(o => o.status === 'ACCEPTED').length;

      this.dataState.set({
        ...EMPTY_DONATION_DATA,
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalOffers: offers.length,
        awaitingReview: pending,
        coordinatedWithDswd: accepted,
        updatesRecorded: offers.length
      });
    } catch {
      this.dataState.set(EMPTY_DONATION_DATA);
    }
  }
}
