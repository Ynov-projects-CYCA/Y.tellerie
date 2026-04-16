import { Routes } from '@angular/router';
import { authGuard, clientGuard, personnelGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';
import { ApiContractPageComponent } from './pages/api-contract/api-contract-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { LoginPageComponent } from './pages/auth/login/login-page.component';
import { RegisterPageComponent } from './pages/auth/register/register-page.component';
import { ResetPasswordPageComponent } from './pages/auth/reset-password/reset-password-page.component';
import { ClientSpacePageComponent } from './pages/client-space/client-space-page.component';
import { PersonnelSpacePageComponent } from './pages/personnel-space/personnel-space-page.component';

export const routes: Routes = [
  {
    path: 'connexion',
    title: 'Connexion',
    component: LoginPageComponent,
  },
  {
    path: 'inscription',
    title: 'Inscription',
    component: RegisterPageComponent,
  },
  {
    path: 'reinitialiser-mot-de-passe',
    title: 'Reinitialiser le mot de passe',
    component: ResetPasswordPageComponent,
  },
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
        path: 'client',
        title: 'Espace client',
        component: ClientSpacePageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'staff',
        title: 'Espace personnel',
        component: PersonnelSpacePageComponent,
        canActivate: [authGuard, personnelGuard],
      },
      {
        path: '**',
        title: 'Introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
