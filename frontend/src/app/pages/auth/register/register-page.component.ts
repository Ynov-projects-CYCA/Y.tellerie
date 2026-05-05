import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LucideUserPlus } from '@lucide/angular';
import {
  AppHttpError,
  AuthApiService,
  PASSWORD_POLICY_MESSAGE,
  strongPasswordValidator,
} from '@core';
import { AuthShellComponent } from '@pages/auth/shared/auth-shell.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent, LucideUserPlus],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly passwordPolicyMessage = PASSWORD_POLICY_MESSAGE;

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
      password: ['', [Validators.required, strongPasswordValidator()]],
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
        phoneNumber: payload.phone,
        role: 'client',
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/connexion');
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
