import { definePreset } from '@primeuix/themes';
import Aura from '@primeng/themes/aura';

/**
 * PrimeNG theme preset tinted with the admin brand blue (#2848b7) so every
 * PrimeNG component matches the rest of the portal instead of the default
 * Tailwind blue. The DSWD portal overrides its accent to teal per-panel.
 */
export const BayanihanPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f2f5fc',
      100: '#e2e8f8',
      200: '#c3cdf0',
      300: '#9aa8e6',
      400: '#5c71d0',
      500: '#2848b7',
      600: '#1f3a9c',
      700: '#1a2f80',
      800: '#152560',
      900: '#0e183f',
      950: '#0a1129'
    }
  }
});