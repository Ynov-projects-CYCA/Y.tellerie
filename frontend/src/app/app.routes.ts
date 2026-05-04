import { Routes } from '@angular/router';

import { AppShellComponent } from './layout/app-shell.component';

import { HomeComponent } from './pages/home/home.component';
import { ApiContractPageComponent } from './pages/api-contract/api-contract-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

import { StaffDashboardPageComponent } from './pages/staff/staff-dashboard-page/staff-dashboard-page.component';
import { StaffReservationsPageComponent } from './pages/staff/staff-reservations-page/staff-reservations-page.component';
import { StaffRoomsPageComponent } from './pages/staff/staff-rooms-page/staff-rooms-page.component';
import { StaffAdminPageComponent } from './pages/staff/staff-admin-page/staff-admin-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Accueil',
        component: HomeComponent,
      },
      {
        path: 'integration',
        title: 'Contrat API',
        component: ApiContractPageComponent,
      },
      {
        path: 'staff',
        children: [
          {
            path: '',
            title: 'Dashboard staff',
            component: StaffDashboardPageComponent,
          },
          {
            path: 'reservations',
            title: 'Réservations',
            component: StaffReservationsPageComponent,
          },
          {
            path: 'rooms',
            title: 'Chambres',
            component: StaffRoomsPageComponent,
          },
          {
            path: 'admin',
            title: 'Administration',
            component: StaffAdminPageComponent,
          }
        ]
      },
      {
        path: '**',
        title: 'Page introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];