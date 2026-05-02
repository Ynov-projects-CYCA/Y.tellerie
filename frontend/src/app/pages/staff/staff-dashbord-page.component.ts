import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService, AuthSessionService } from '@core';
import { AccountPanelComponent } from '@pages/account/account-panel.component';

@Component({
  selector: 'app-staff-page',
  standalone: true,
  imports: [AccountPanelComponent],
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
