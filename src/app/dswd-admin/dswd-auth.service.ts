import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DswdUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  authToken: string;
}

const STORAGE_KEY = 'dswd_user';

@Injectable({ providedIn: 'root' })
export class DswdAuthService {
  private readonly http = inject(HttpClient);

  private readonly userState = signal<DswdUser | null>(this.loadFromStorage());

  readonly currentUser = this.userState.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userState());
  readonly authToken = computed(() => this.userState()?.authToken ?? '');

  private loadFromStorage(): DswdUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DswdUser) : null;
    } catch {
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await firstValueFrom(
        this.http.post<DswdUser>('/api/auth/login', { email, password })
      );

      if (user.role !== 'OFFICER') {
        return { success: false, error: 'Access denied. This portal is for DSWD officers only.' };
      }

      this.userState.set(user);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      sessionStorage.setItem('bayanihanlink-dswd-demo-session', 'true');
      return { success: true };
    } catch (err: any) {
      const message = err?.error?.error ?? 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  }

  logout(): void {
    this.userState.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('bayanihanlink-dswd-demo-session');
  }
}
