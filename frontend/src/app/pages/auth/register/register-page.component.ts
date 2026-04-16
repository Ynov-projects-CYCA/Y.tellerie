import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthRedirectService } from '../../../core/auth/auth-redirect.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AppHttpError } from '../../../core/http/models/app-http-error.model';
import { AuthShellComponent } from '../shared/auth-shell.component';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly authRedirectService = inject(AuthRedirectService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly registerForm = this.formBuilder.nonNullable.group(
    {
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[+0-9 ()-]{8,}$/),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword'),
    },
  );

  protected submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const { confirmPassword, acceptTerms, ...payload } =
      this.registerForm.getRawValue();

    this.authApiService
      .register({
        ...payload,
        role: 'client',
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.authSessionService.startSession(response, 'local');
          void this.router.navigateByUrl(
            this.authRedirectService.getPostAuthUrl(response.user),
          );
        },
        error: (error: unknown) => {
          if (error instanceof AppHttpError && error.statusCode === 409) {
            this.submitError.set(
              'Un compte existe deja avec cette adresse email.',
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

  protected hasError(
    controlName:
      | 'firstname'
      | 'lastname'
      | 'email'
      | 'phone'
      | 'password'
      | 'confirmPassword'
      | 'acceptTerms',
  ): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected passwordsDoNotMatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      (this.registerForm.controls.confirmPassword.touched ||
        this.registerForm.controls.confirmPassword.dirty)
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
