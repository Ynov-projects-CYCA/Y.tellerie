import { Routes } from '@angular/router';
import { authGuard, clientGuard, guestGuard, personnelGuard } from '@core';
import { AppShellComponent } from '@layout';
import {
  ApiContractPageComponent,
  BookingPageComponent,
  HistoryPageComponent,
  HomePageComponent,
  LoginPageComponent,
  NotFoundPageComponent,
  PaymentCancelPageComponent,
  PaymentSuccessPageComponent,
  ProfilePageComponent,
  RegisterPageComponent,
  ResetPasswordPageComponent,
  StaffDashboardPageComponent,
  VerifyEmailPageComponent,
} from '@pages';

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
        canActivate: [guestGuard],
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
        path: 'client/paiement/success',
        title: 'Paiement réussi',
        component: PaymentSuccessPageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'client/paiement/cancel',
        title: 'Paiement annulé',
        component: PaymentCancelPageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'profile',
        title: 'Mon compte',
        component: ProfilePageComponent,
        canActivate: [authGuard],
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
        canActivate: [guestGuard],
      },
      {
        path: 'inscription',
        title: 'Inscription',
        component: RegisterPageComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'reinitialiser-mot-de-passe',
        title: 'Reinitialiser le mot de passe',
        component: ResetPasswordPageComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'verify-email',
        title: 'Verification email',
        component: VerifyEmailPageComponent,
        canActivate: [guestGuard],
      },
      {
        path: '**',
        title: 'Introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
