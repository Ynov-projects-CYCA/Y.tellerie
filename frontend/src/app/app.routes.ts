import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { ApiContractPageComponent } from './pages/api-contract/api-contract-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Accueil',
        component: HomePageComponent,
      },
      {
        path: 'integration',
        title: 'Contrat API',
        component: ApiContractPageComponent,
      },
      {
        path: '**',
        title: 'Introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
