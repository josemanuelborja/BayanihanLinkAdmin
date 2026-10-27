import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiOffer } from '../../api/api.service';
import { AuthService } from '../../auth/auth.service';
import { API_BASE_URL } from '../dashboard-api';
import { lastMonthPoints, matchesPeriod, monthKey, periodLabel } from '../dashboard-data.util';
import { DonationOfferTrendPoint, DonationOffersOverview } from './donation-offers-overview.data';

function trendPoints(month: number | null, year: number | null): Array<{ key: string; date: string }> {
  if (month !== null && year !== null) {
    const date = new Date(Date.UTC(year, month - 1, 1, 12));
    return [{ key: year + '-' + (month - 1), date: date.toISOString() }];
  }

  return lastMonthPoints(8);
}

function zeroTrend(points: Array<{ date: string }>): DonationOfferTrendPoint[] {
  return points.map(point => ({ date: point.date, count: 0 }));
}

function emptyOverview(month: number | null = null, year: number | null = null): DonationOffersOverview {
  const points = trendPoints(month, year);

  return {
    period: periodLabel(month, year),
    totalOffers: 0,
    awaitingReview: 0,
    coordinatedWithDswd: 0,
    updatesRecorded: 0,
    trend: zeroTrend(points),
    awaitingReviewTrend: zeroTrend(points),
    coordinatedWithDswdTrend: zeroTrend(points),
    updatesRecordedTrend: zeroTrend(points)
  };
}

@Injectable({ providedIn: 'root' })
export class DonationOffersOverviewService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly dataState = signal<DonationOffersOverview>(emptyOverview());

  readonly data = this.dataState.asReadonly();

  async refresh(month: number | null = null, year: number | null = null): Promise<void> {
    try {
      const offers = await firstValueFrom(
        this.http.get<ApiOffer[]>(`${this.baseUrl}/offers/admin/all`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${this.auth.authToken()}` })
        })
      );

      const filtered = offers.filter(offer =>
        matchesPeriod(offer.createdAt, month, year)
      );
      const points = trendPoints(month, year);

      const countTrend = (
        matches: (offer: ApiOffer) => boolean
      ): DonationOfferTrendPoint[] => points.map(point => ({
        date: point.date,
        count: filtered.filter(offer =>
          monthKey(offer.createdAt) === point.key && matches(offer)
        ).length
      }));

      this.dataState.set({
        period: periodLabel(month, year),
        totalOffers: filtered.length,
        awaitingReview: filtered.filter(offer => offer.status === 'PENDING').length,
        coordinatedWithDswd: filtered.filter(offer => offer.status === 'ACCEPTED').length,
        updatesRecorded: filtered.filter(offer => offer.status !== 'PENDING').length,
        trend: countTrend(() => true),
        awaitingReviewTrend: countTrend(offer => offer.status === 'PENDING'),
        coordinatedWithDswdTrend: countTrend(offer => offer.status === 'ACCEPTED'),
        updatesRecordedTrend: countTrend(offer => offer.status !== 'PENDING')
      });
    } catch {
      this.dataState.set(emptyOverview(month, year));
    }
  }
}
