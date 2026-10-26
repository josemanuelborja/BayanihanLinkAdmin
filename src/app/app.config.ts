import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { BayanihanPreset } from './bayanihan.theme';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // PrimeNG overlays (e.g. the date picker panel) animate via @angular/animations;
    // without this provider the overlay throws on open and never appears.
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: BayanihanPreset,
        options: {
          // The app has no dark mode; stop PrimeNG from following the OS setting.
          darkModeSelector: false
        }
      }
    })
  ]
};
