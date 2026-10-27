import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const dswdSessionGuard: CanActivateFn = () => {
  return sessionStorage.getItem('bayanihanlink-dswd-demo-session') === 'true'
    ? true
    : inject(Router).createUrlTree(['/dswd/login']);
};

/**
 * Keeps the review page off an empty id. The review page loads the real offer
 * from the database and shows an error when it no longer exists.
 */
export const dswdRequestExistsGuard: CanActivateFn = route => {
  return route.paramMap.get('id')
    ? true
    : inject(Router).createUrlTree(['/dswd/dashboard']);
};
