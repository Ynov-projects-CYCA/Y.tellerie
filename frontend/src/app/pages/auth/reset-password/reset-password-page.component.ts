import { Component, OnDestroy, inject, signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LucideKeyRound } from '@lucide/angular';
import {
  AppHttpError,
  AuthApiService,
  PASSWORD_POLICY_MESSAGE,
  strongPasswordValidator,
} from '@core';
import { AuthShellComponent } from '@pages/auth/shared/auth-shell.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent, LucideKeyRound],
  templateUrl: './reset-password-page.component.html',
})
export class ResetPasswordPageComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);
  private redirectTimeoutId: number | null = null;
  protected readonly token = this.route.snapshot.queryParamMap.get('token');

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(
    this.token ? null : 'Le lien de reinitialisation est incomplet ou invalide.',
  );
  protected readonly isSuccess = signal(false);
  protected readonly passwordPolicyMessage = PASSWORD_POLICY_MESSAGE;

  protected readonly resetPasswordForm = this.formBuilder.nonNullable.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword'),
    },
  );

  protected submit(): void {
    if (!this.token) {
      return;
    }

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.authApiService
      .resetPassword({
        token: this.token,
        password: this.resetPasswordForm.controls.password.getRawValue(),
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.redirectTimeoutId = window.setTimeout(() => {
            void this.router.navigateByUrl('/connexion');
          }, 3000);
        },
        error: (error: unknown) => {
          if (error instanceof AppHttpError && error.statusCode === 401) {
            this.submitError.set(
              'Le lien de reinitialisation est invalide ou expire.',
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

  protected hasError(controlName: 'password' | 'confirmPassword'): boolean {
    const control = this.resetPasswordForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected passwordsDoNotMatch(): boolean {
    return (
      this.resetPasswordForm.hasError('passwordMismatch') &&
      (this.resetPasswordForm.controls.confirmPassword.touched ||
        this.resetPasswordForm.controls.confirmPassword.dirty)
    );
  }
}

function passwordMatchValidator(
  passwordKey: string,
  confirmPasswordKey: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const confirmPassword = control.get(confirmPasswordKey)?.value;

    if (!password || !confirmPassword || password === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  };
}
