import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const loggedInUserRole = 1;
  console.log('inside roleguard');
  if (state.url === `/dashboard/employee`) {
    return true;
  }
  if (loggedInUserRole === 1) {
    router.navigateByUrl('/dashboard/employee');
  }

  return false;
};
