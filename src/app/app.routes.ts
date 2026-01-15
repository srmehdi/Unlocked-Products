import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { roleGuard } from './core/guards/role-guard/role-guard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((c) => c.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password').then((c) => c.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then((c) => c.ResetPassword),
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    // canActivateChild: [roleGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
    children: [
      {
        path: 'employee',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/employee/employee-dashboard/employee-dashboard').then(
                (c) => c.EmployeeDashboard
              ),
          },
        ],
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about').then((c) => c.About),
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact').then((c) => c.Contact),
      },
      {
        path: 'add-product',
        loadComponent: () =>
          import('./features/product/add-product/add-product').then((c) => c.AddProduct),
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./features/product/product-detail/product-detail').then((c) => c.ProductDetail),
      },
    ],
  },
  {
    path: '**',
    component: Login,
  },
];
