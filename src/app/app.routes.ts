import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./product/product.page').then((m) => m.ProductPage),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
