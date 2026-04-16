import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { ApiContractPageComponent } from './pages/api-contract/api-contract-page.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { StaffDashboardPageComponent } from './pages/dashboard-staff/staff-dashboard-page.component';

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
        title: 'Tableau de bord',
        component: StaffDashboardPageComponent,
      },
      {
        path: '**',
        title: 'Introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
