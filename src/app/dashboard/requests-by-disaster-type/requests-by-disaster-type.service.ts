import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  RequestsByDisasterType,
  DisasterTypeSlice
} from './requests-by-disaster-type.data';
import { ApiRequest } from '../../api/api.service';

const EMPTY_DISASTER_DATA: RequestsByDisasterType = {
  period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  disasters: []
};

@Injectable({ providedIn: 'root' })
export class RequestsByDisasterTypeService {
  private readonly http = inject(HttpClient);
  private readonly dataState = signal<RequestsByDisasterType>(EMPTY_DISASTER_DATA);

  readonly data = this.dataState.asReadonly();

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const requests = await firstValueFrom(
        this.http.get<ApiRequest[]>('/api/requests')
      );

      const counts: Record<string, number> = {};
      for (const r of requests) {
        const key = r.disasterType?.toLowerCase() ?? 'other';
        counts[key] = (counts[key] ?? 0) + 1;
      }

      const knownTypes = ['typhoon', 'flood', 'fire', 'earthquake'];
      const slices: DisasterTypeSlice[] = knownTypes.map(type => ({
        id: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count: counts[type] ?? 0
      }));

      const otherCount = Object.entries(counts)
        .filter(([key]) => !knownTypes.includes(key))
        .reduce((sum, [, count]) => sum + count, 0);

      if (otherCount > 0) {
        slices.push({ id: 'other', label: 'Other disasters', count: otherCount });
      }

      this.dataState.set({
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        disasters: slices
      });
    } catch {
      this.dataState.set(EMPTY_DISASTER_DATA);
    }
  }
}
