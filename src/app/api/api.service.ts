import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface ApiRequest {
  id: string;
  userId: string;
  disasterType: string;
  category: string;
  categories: string[];
  itemNeeded: string;
  quantity: string;
  unit: string;
  description: string;
  personsAffected: number;
  location: string;
  evidenceImage: string;
  urgency: 'NORMAL' | 'URGENT' | 'CRITICAL';
  status: 'PENDING' | 'VERIFIED' | 'ASSISTED' | 'COMPLETED';
  currentTimelineStep: number;
  dateSubmitted: string;
}

export interface ApiOffer {
  _id: string;
  donorId: string;
  requestId: string;
  quantityOffered: string;
  unit: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private get headers(): HttpHeaders {
    const token = this.auth.authToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  async getRequests(status?: string): Promise<ApiRequest[]> {
    try {
      const params: Record<string, string> = {};
      if (status) params['status'] = status;

      const url = status ? `/api/requests?status=${status}` : '/api/requests';
      return await firstValueFrom(this.http.get<ApiRequest[]>(url));
    } catch {
      return [];
    }
  }

  async getAllOffers(): Promise<ApiOffer[]> {
    try {
      return await firstValueFrom(
        this.http.get<ApiOffer[]>('/api/offers/all', { headers: this.headers })
      );
    } catch {
      return [];
    }
  }

  async updateRequestStatus(
    id: string,
    status: string,
    urgency?: string,
    currentTimelineStep?: number
  ): Promise<ApiRequest | null> {
    try {
      const body: Record<string, any> = { status };
      if (urgency) body['urgency'] = urgency;
      if (currentTimelineStep !== undefined) body['currentTimelineStep'] = currentTimelineStep;

      return await firstValueFrom(
        this.http.patch<ApiRequest>(`/api/requests/${id}/status`, body, { headers: this.headers })
      );
    } catch {
      return null;
    }
  }
}
