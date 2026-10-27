import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiRequest } from '../../api/api.service';
import { API_BASE_URL } from '../dashboard-api';
import { matchesPeriod, periodLabel } from '../dashboard-data.util';
import { RequestsByPriority } from './requests-by-priority.data';

const PRIORITIES = [
  { id: 'critical', label: 'Critical', backend: 'CRITICAL' },
  { id: 'urgent', label: 'Urgent', backend: 'URGENT' },
  { id: 'normal', label: 'Normal', backend: 'NORMAL' }
];

function emptyPriorities() {
  return PRIORITIES.map(priority => ({
    id: priority.id,
    label: priority.label,
    count: 0
  }));
}

@Injectable({ providedIn: 'root' })
export class RequestsByPriorityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly dataState = signal<RequestsByPriority>({
    period: 'All time',
    priorities: emptyPriorities()
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

      const priorities = PRIORITIES.map(priority => ({
        id: priority.id,
        label: priority.label,
        count: filtered.filter(request => request.urgency === priority.backend).length
      }));

      this.dataState.set({ period: periodLabel(month, year), priorities });
    } catch {
      this.dataState.set({ period: periodLabel(month, year), priorities: emptyPriorities() });
    }
  }
}
