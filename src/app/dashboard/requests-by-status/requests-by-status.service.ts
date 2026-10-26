import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { RequestsByStatus } from './requests-by-status.data';
import { ApiRequest } from '../../api/api.service';

const EMPTY_STATUS_DATA: RequestsByStatus = {
  period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  statuses: [
    { id: 'pending', label: 'Pending', count: 0, priorities: [] },
    { id: 'verified', label: 'Verified', count: 0, priorities: [] },
    { id: 'assisted', label: 'Assisted', count: 0, priorities: [] },
    { id: 'completed', label: 'Completed', count: 0, priorities: [] }
  ]
};

@Injectable({ providedIn: 'root' })
export class RequestsByStatusService {
  private readonly http = inject(HttpClient);
  private readonly dataState = signal<RequestsByStatus>(EMPTY_STATUS_DATA);

  readonly data = this.dataState.asReadonly();

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const requests = await firstValueFrom(
        this.http.get<ApiRequest[]>('/api/requests')
      );

      const pending = requests.filter(r => r.status === 'PENDING');
      const verified = requests.filter(r => r.status === 'VERIFIED');
      const assisted = requests.filter(r => r.status === 'ASSISTED');
      const completed = requests.filter(r => r.status === 'COMPLETED');

      const toBreakdown = (list: ApiRequest[]) => [
        { label: 'Critical', count: list.filter(r => r.urgency === 'CRITICAL').length },
        { label: 'Urgent',   count: list.filter(r => r.urgency === 'URGENT').length },
        { label: 'Normal',   count: list.filter(r => r.urgency === 'NORMAL').length }
      ];

      this.dataState.set({
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        statuses: [
          { id: 'pending',   label: 'Pending',   count: pending.length,   priorities: toBreakdown(pending) },
          { id: 'verified',  label: 'Verified',  count: verified.length,  priorities: toBreakdown(verified) },
          { id: 'assisted',  label: 'Assisted',  count: assisted.length,  priorities: toBreakdown(assisted) },
          { id: 'completed', label: 'Completed', count: completed.length, priorities: toBreakdown(completed) }
        ]
      });
    } catch {
      this.dataState.set(EMPTY_STATUS_DATA);
    }
  }
}
