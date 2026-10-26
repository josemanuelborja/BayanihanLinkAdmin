import { InjectionToken } from '@angular/core';

/** Override in app.config when the dashboard API is hosted on another origin. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api'
});

export const API_ENABLED = new InjectionToken<boolean>('API_ENABLED', {
  providedIn: 'root',
  factory: () => false
});
