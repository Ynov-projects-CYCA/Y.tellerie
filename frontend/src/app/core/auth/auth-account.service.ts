import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { defer, Observable, of } from 'rxjs';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthAccountService {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  logout(): Observable<void> {
    return defer(() => {
      // La deconnexion est purement locale tant qu'aucun mecanisme
      // de revocation serveur n'est maintenu dans l'API.
      this.authSessionService.clearSession();
      void this.router.navigateByUrl('/connexion');
      return of(void 0);
    });
  }
}
