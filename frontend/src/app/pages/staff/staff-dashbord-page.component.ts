import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../core/auth/auth-api.service';
import { AuthSessionService } from '../../core/auth/auth-session.service';

@Component({
  selector: 'app-staff-page',
  templateUrl: './staff-dashbord-page.component.html',
  styleUrl: './staff-dashbord-page.scss',
})
export class StaffDashboardPageComponent {
  private readonly authApiService = inject(AuthApiService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly user = computed(() => this.authSessionService.currentUser());
  protected readonly isLoggingOut = signal(false);

  protected logout(): void {
    const session = this.authSessionService.currentSession();
    if (!session) {
      this.authSessionService.clearSession();
      void this.router.navigateByUrl('/connexion');
      return;
    }

    this.isLoggingOut.set(true);

    this.authApiService
      .logout(session.refreshToken)
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(false);
          this.authSessionService.clearSession();
          void this.router.navigateByUrl('/connexion');
        }),
      )
      .subscribe({
        error: () => undefined,
      });
  }
}
