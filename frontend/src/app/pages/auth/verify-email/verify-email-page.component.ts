import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AppHttpError } from '../../../core/http/models/app-http-error.model';
import { AuthShellComponent } from '../shared/auth-shell.component';

@Component({
  selector: 'app-verify-email-page',
  imports: [RouterLink, AuthShellComponent],
  templateUrl: './verify-email-page.component.html',
})
export class VerifyEmailPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authApiService = inject(AuthApiService);
  private redirectTimeoutId: number | null = null;

  protected readonly token = this.route.snapshot.queryParamMap.get('token');
  protected readonly isLoading = signal(true);
  protected readonly isSuccess = signal(false);
  protected readonly submitError = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.token) {
      this.isLoading.set(false);
      this.submitError.set(
        'Le lien de verification est incomplet ou invalide.',
      );
      return;
    }

    this.authApiService
      .verifyEmail(this.token)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.redirectTimeoutId = window.setTimeout(() => {
            void this.router.navigateByUrl('/connexion');
          }, 3000);
        },
        error: (error: unknown) => {
          if (error instanceof AppHttpError && error.statusCode === 400) {
            this.submitError.set(
              'Le lien de verification est invalide ou a deja ete utilise.',
            );
            return;
          }

          this.submitError.set(
            error instanceof AppHttpError
              ? error.message
              : 'Une erreur inattendue est survenue.',
          );
        },
      });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutId !== null) {
      window.clearTimeout(this.redirectTimeoutId);
    }
  }
}
