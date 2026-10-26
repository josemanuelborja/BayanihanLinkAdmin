import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  authToken: string;
}

const STORAGE_KEY = 'admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly userState = signal<AdminUser | null>(this.loadFromStorage());

  readonly currentUser = this.userState.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userState());
  readonly authToken = computed(() => this.userState()?.authToken ?? '');

  private loadFromStorage(): AdminUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await firstValueFrom(
        this.http.post<AdminUser>('/api/auth/login', { email, password })
      );

      if (user.role !== 'ADMIN') {
        return { success: false, error: 'Access denied. This portal is for administrators only.' };
      }

      this.userState.set(user);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    } catch (err: any) {
      const message = err?.error?.error ?? 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  }

  logout(): void {
    this.userState.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
