import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { APP_ENVIRONMENT, AppHttpError, SystemApiService } from '@core';

@Component({
  selector: 'app-api-contract-page',
  standalone: true,
  templateUrl: './api-contract-page.component.html',
  styleUrl: './api-contract-page.component.scss',
})
export class ApiContractPageComponent {
  private readonly systemApiService = inject(SystemApiService);

  protected readonly environment = inject(APP_ENVIRONMENT);
  protected readonly loading = signal(false);
  protected readonly backendMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly contractItems = [
    'Les réponses HTTP sont décapsulées avant d’arriver aux services métier.',
    'Les erreurs backend sont converties en AppHttpError avec message UI prêt à afficher.',
    'Le bearer token est injecté automatiquement si une session auth valide est stockée.',
    'La session frontend repose sur le JWT d’accès stocké dans ytellerie.auth_session.',
    'La deconnexion purge uniquement la session locale tant qu aucune revocation serveur n est introduite.',
    'Les vues compte affichent seulement les données issues de l’authentification tant que les endpoints profil restent fictifs.',
  ];

  checkBackend(): void {
    this.loading.set(true);
    this.backendMessage.set(null);
    this.errorMessage.set(null);

    this.systemApiService
      .getWelcome()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.backendMessage.set(message);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof AppHttpError ? error.message : 'Une erreur inattendue est survenue.',
          );
        },
      });
  }
}
