import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LucideLogIn } from '@lucide/angular';
import { AppHttpError, AuthApiService, AuthRedirectService, AuthRole, AuthSessionService } from '@core';
import { AuthShellComponent } from '@pages/auth/shared/auth-shell.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthShellComponent,
    RouterLink,
    LucideLogIn
  ],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly authRedirectService = inject(AuthRedirectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly selectedRole = signal<AuthRole>('client');
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isForgotPasswordOpen = signal(false);
  protected readonly isAdminContactOpen = signal(false);
  protected readonly isForgotPasswordSubmitting = signal(false);
  protected readonly forgotPasswordSuccess = signal<string | null>(null);
  protected readonly forgotPasswordError = signal<string | null>(null);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [true],
  });

  protected readonly forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    const currentUser = this.authSessionService.currentUser();

    if (currentUser) {
      void this.router.navigateByUrl(
        this.authRedirectService.getPostAuthUrl(currentUser),
      );
    }
  }

  protected selectRole(role: AuthRole): void {
    this.selectedRole.set(role);
  }

  protected openAdminContactModal(): void {
    this.isAdminContactOpen.set(true);
  }

  protected closeAdminContactModal(): void {
    this.isAdminContactOpen.set(false);
  }

  protected openForgotPasswordModal(): void {
    this.forgotPasswordSuccess.set(null);
    this.forgotPasswordError.set(null);

    const email = this.loginForm.controls.email.value;
    if (email) {
      this.forgotPasswordForm.controls.email.setValue(email);
    }

    this.isForgotPasswordOpen.set(true);
  }

  protected closeForgotPasswordModal(): void {
    this.isForgotPasswordOpen.set(false);
  }

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.authApiService
      .login({ 
        email, 
        password, 
        requiredRole: this.selectedRole() === 'personnel' ? 'personnel' : 'client' 
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.authSessionService.startSession(
            response,
            rememberMe ? 'local' : 'session',
          );

          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
          const fallbackUrl = this.authRedirectService.getPostAuthUrl(response.user);

          void this.router.navigateByUrl(redirectTo || fallbackUrl);
        },
        error: (error: unknown) => {
          this.submitError.set(this.buildLoginErrorMessage(error));
        },
      });
  }

  protected submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isForgotPasswordSubmitting.set(true);
    this.forgotPasswordError.set(null);
    this.forgotPasswordSuccess.set(null);

    this.authApiService
      .forgotPassword(this.forgotPasswordForm.getRawValue())
      .pipe(finalize(() => this.isForgotPasswordSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.forgotPasswordSuccess.set(
            'Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.',
          );
        },
        error: (error: unknown) => {
          this.forgotPasswordError.set(this.extractErrorMessage(error));
        },
      });
  }

  protected hasError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected hasForgotPasswordError(): boolean {
    const control = this.forgotPasswordForm.controls.email;
    return control.invalid && (control.touched || control.dirty);
  }

  private buildLoginErrorMessage(error: unknown): string {
    if (error instanceof AppHttpError && error.statusCode === 401) {
      return error.message || 'Email ou mot de passe invalide.';
    }

    if (error instanceof AppHttpError && error.statusCode === 403) {
      return error.message;
    }

    return this.extractErrorMessage(error);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AppHttpError) {
      return error.message;
    }

    return 'Une erreur inattendue est survenue.';
  }
}
