import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiRequest } from '../../api/api.service';
import { API_BASE_URL } from '../dashboard-api';
import { matchesPeriod, periodLabel } from '../dashboard-data.util';
import { RequestsByDisasterType } from './requests-by-disaster-type.data';

// Keep a familiar order even when a type has zero requests.
const KNOWN_DISASTERS = [
  { id: 'typhoon', label: 'Typhoon' },
  { id: 'flood', label: 'Flood' },
  { id: 'fire', label: 'Fire' },
  { id: 'earthquake', label: 'Earthquake' },
  { id: 'other', label: 'Other disasters' }
];

@Injectable({ providedIn: 'root' })
export class RequestsByDisasterTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly dataState = signal<RequestsByDisasterType>({
    period: 'All time',
    disasters: KNOWN_DISASTERS.map(disaster => ({ ...disaster, count: 0 }))
  });

  readonly data = this.dataState.asReadonly();

  async refresh(month: number | null = null, year: number | null = null): Promise<void> {
    try {
      const requests = await firstValueFrom(
        this.http.get<ApiRequest[]>(`${this.baseUrl}/requests`)
      );

      const filtered = requests.filter(request =>
        matchesPeriod(request.dateSubmitted, month, year)
      );

      const counts = new Map<string, number>();
      for (const request of filtered) {
        const name = request.disasterType || 'Other disasters';
        counts.set(name, (counts.get(name) || 0) + 1);
      }

      const disasters = KNOWN_DISASTERS.map(disaster => ({
        ...disaster,
        count: counts.get(disaster.label) || 0
      }));

      // Include any disaster type that is not in the fixed list above.
      for (const [name, count] of counts) {
        const known = KNOWN_DISASTERS.some(disaster => disaster.label === name);
        if (!known) {
          disasters.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            label: name,
            count
          });
        }
      }

      this.dataState.set({ period: periodLabel(month, year), disasters });
    } catch {
      this.dataState.set({
        period: periodLabel(month, year),
        disasters: KNOWN_DISASTERS.map(disaster => ({ ...disaster, count: 0 }))
      });
    }
  }
}
