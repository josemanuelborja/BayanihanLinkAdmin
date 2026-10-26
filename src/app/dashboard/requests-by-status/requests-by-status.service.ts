import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../dashboard-api';
import { REQUESTS_BY_STATUS_FALLBACK, RequestsByStatus } from './requests-by-status.data';

@Injectable({ providedIn: 'root' })
export class RequestsByStatusService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly dataState = signal<RequestsByStatus>(REQUESTS_BY_STATUS_FALLBACK);

  readonly data = this.dataState.asReadonly();

  async refresh(): Promise<void> {
    if (!this.http) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.http.get<RequestsByStatus>(`${this.baseUrl}/dashboard/requests-by-status`)
      );
      this.dataState.set(data);
    } catch {
      // Keep the seeded fallback while the API is unavailable.
    }
  }
}
