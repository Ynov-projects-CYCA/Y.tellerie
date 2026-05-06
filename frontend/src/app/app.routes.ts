import { Routes } from '@angular/router';


import { authGuard, clientGuard, guestGuard, personnelGuard } from '@core';
import { AppShellComponent } from '@layout';
import {
  ApiContractPageComponent,
  BookingPageComponent,
  HistoryPageComponent,
  HomePageComponent,
  LegalPageComponent,
  LoginPageComponent,
  NotFoundPageComponent,
  PaymentCancelPageComponent,
  PaymentSuccessPageComponent,
  ProfilePageComponent,
  RegisterPageComponent,
  RoomDetailsPageComponent,
  ResetPasswordPageComponent,
  StaffDashboardPageComponent,
  VerifyEmailPageComponent,
} from '@pages';

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
        component: HomePageComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'integration',
        title: 'Contrat API',
        component: ApiContractPageComponent,
      },
      {
        path: 'mentions-legales',
        title: 'Mentions légales',
        component: LegalPageComponent,
        data: { legalPage: 'mentions' },
      },
      {
        path: 'confidentialite',
        title: 'Confidentialité',
        component: LegalPageComponent,
        data: { legalPage: 'privacy' },
      },
      {
        path: 'conditions-utilisation',
        title: 'Conditions d’utilisation',
        component: LegalPageComponent,
        data: { legalPage: 'terms' },
      },
      {
        path: 'staff',
        canActivate: [authGuard, personnelGuard],
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
          },
        ],
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
        path: 'client/chambres/:id',
        title: 'Detail de la chambre',
        component: RoomDetailsPageComponent,
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
        path: 'success',
        title: 'Paiement réussi',
        component: PaymentSuccessPageComponent,
        canActivate: [authGuard, clientGuard],
      },
      {
        path: 'cancel',
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
        title: 'Page introuvable',
        component: NotFoundPageComponent,
      },
    ],
  },
];
