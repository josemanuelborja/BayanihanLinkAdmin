import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { findDswdValidationCase } from './dswd-request.data';

export const dswdSessionGuard: CanActivateFn = () => {
  return sessionStorage.getItem('bayanihanlink-dswd-demo-session') === 'true'
    ? true
    : inject(Router).createUrlTree(['/dswd/login']);
};

/**
 * Keeps the review page off unknown request ids.
 *
 * Redirecting from inside the component's param subscription does not work:
 * that fires while the navigation is still in flight, so the new navigation
 * is cancelled and the user is left on an empty review page. Returning a
 * UrlTree from a guard is applied by the router as part of the same
 * navigation.
 */
export const dswdRequestExistsGuard: CanActivateFn = route => {
  const request = findDswdValidationCase(route.paramMap.get('id'));

  return request
    ? true
    : inject(Router).createUrlTree(['/dswd/dashboard']);
};
