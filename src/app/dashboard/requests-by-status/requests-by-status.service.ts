import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiRequest } from '../../api/api.service';
import { API_BASE_URL } from '../dashboard-api';
import { matchesPeriod, periodLabel } from '../dashboard-data.util';
import { RequestsByStatus, StatusBreakdown } from './requests-by-status.data';

const STATUS_ROWS = [
  { id: 'pending', label: 'Pending', backend: 'PENDING' },
  { id: 'verified', label: 'DSWD Confirmed', backend: 'VERIFIED' },
  { id: 'assisted', label: 'Assisted', backend: 'ASSISTED' },
  { id: 'completed', label: 'Completed', backend: 'COMPLETED' }
];

const PRIORITIES = [
  { id: 'critical', label: 'Critical', backend: 'CRITICAL' },
  { id: 'urgent', label: 'Urgent', backend: 'URGENT' },
  { id: 'normal', label: 'Normal', backend: 'NORMAL' }
];

function emptyStatuses(): StatusBreakdown[] {
  return STATUS_ROWS.map(row => ({
    id: row.id,
    label: row.label,
    count: 0,
    priorities: PRIORITIES.map(priority => ({
      label: priority.label,
      count: 0
    }))
  }));
}

@Injectable({ providedIn: 'root' })
export class RequestsByStatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly dataState = signal<RequestsByStatus>({
    period: 'All time',
    statuses: emptyStatuses()
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

      const statuses = STATUS_ROWS.map(row => {
        const inStatus = filtered.filter(request => request.status === row.backend);

        return {
          id: row.id,
          label: row.label,
          count: inStatus.length,
          priorities: PRIORITIES.map(priority => ({
            label: priority.label,
            count: inStatus.filter(request => request.urgency === priority.backend).length
          }))
        };
      });

      this.dataState.set({ period: periodLabel(month, year), statuses });
    } catch {
      this.dataState.set({ period: periodLabel(month, year), statuses: emptyStatuses() });
    }
  }
}
