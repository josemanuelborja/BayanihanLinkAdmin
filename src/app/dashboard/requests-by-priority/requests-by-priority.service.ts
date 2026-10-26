import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { RequestsByPriority } from './requests-by-priority.data';
import { ApiRequest } from '../../api/api.service';

const EMPTY_PRIORITY_DATA: RequestsByPriority = {
  period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  priorities: [
    { id: 'critical', label: 'Critical', count: 0 },
    { id: 'urgent', label: 'Urgent', count: 0 },
    { id: 'normal', label: 'Normal', count: 0 }
  ]
};

@Injectable({ providedIn: 'root' })
export class RequestsByPriorityService {
  private readonly http = inject(HttpClient);
  private readonly dataState = signal<RequestsByPriority>(EMPTY_PRIORITY_DATA);

  readonly data = this.dataState.asReadonly();

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const requests = await firstValueFrom(
        this.http.get<ApiRequest[]>('/api/requests')
      );

      this.dataState.set({
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        priorities: [
          { id: 'critical', label: 'Critical', count: requests.filter(r => r.urgency === 'CRITICAL').length },
          { id: 'urgent',   label: 'Urgent',   count: requests.filter(r => r.urgency === 'URGENT').length },
          { id: 'normal',   label: 'Normal',   count: requests.filter(r => r.urgency === 'NORMAL').length }
        ]
      });
    } catch {
      this.dataState.set(EMPTY_PRIORITY_DATA);
    }
  }
}
