import { Routes } from '@angular/router';
import { authGuard, clientGuard, personnelGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';
import { ApiContractPageComponent } from './pages/api-contract/api-contract-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { LoginPageComponent } from './pages/auth/login/login-page.component';
import { RegisterPageComponent } from './pages/auth/register/register-page.component';
import { ResetPasswordPageComponent } from './pages/auth/reset-password/reset-password-page.component';
import { VerifyEmailPageComponent } from './pages/auth/verify-email/verify-email-page.component';
import { StaffDashboardPageComponent } from './pages/staff/staff-dashbord-page.component';
import { BookingPageComponent } from './pages/customer/booking/booking-page.component';
import { HistoryPageComponent } from './pages/customer/history/history-page.component';
import { ProfilePageComponent } from './pages/profile/profile-page.component';

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
        path: 'client',
        title: 'Espace client',
        component: BookingPageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'client/historique',
        title: 'Historique',
        component: HistoryPageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'profile',
        title: 'Mon compte',
        component: ProfilePageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'staff',
        title: 'Espace personnel',
        component: StaffDashboardPageComponent,
        canActivate: [authGuard, personnelGuard],
      },
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
        path: 'verify-email',
        title: 'Verification email',
        component: VerifyEmailPageComponent,
      },
      {
        path: '**',
        title: 'Introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
