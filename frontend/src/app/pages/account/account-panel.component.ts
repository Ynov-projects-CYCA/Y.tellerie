import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  AppHttpError,
  AuthAccountService,
  AuthApiService,
  AuthSessionService,
  PASSWORD_POLICY_MESSAGE,
  strongPasswordValidator,
} from '@core';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-panel.component.html',
  styleUrl: './account-panel.component.scss',
})
export class AccountPanelComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApiService = inject(AuthApiService);
  private readonly authAccountService = inject(AuthAccountService);
  private readonly authSessionService = inject(AuthSessionService);

  readonly heading = input.required<string>();
  readonly accountTypeLabel = input.required<string>();

  protected readonly user = computed(() => this.authSessionService.currentUser());
  protected readonly isLoggingOut = signal(false);
  protected readonly isChangingPassword = signal(false);
  protected readonly passwordSuccess = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordPolicyMessage = PASSWORD_POLICY_MESSAGE;

  protected readonly changePasswordForm = this.formBuilder.nonNullable.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, strongPasswordValidator()]],
    confirmPassword: ['', [Validators.required]],
  });

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authAccountService
      .logout()
      .pipe(finalize(() => this.isLoggingOut.set(false)))
      .subscribe();
  }

  protected submitPasswordChange(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { oldPassword, newPassword, confirmPassword } =
      this.changePasswordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordError.set(
        'La confirmation du nouveau mot de passe ne correspond pas.',
      );
      return;
    }

    this.passwordSuccess.set(null);
    this.passwordError.set(null);
    this.isChangingPassword.set(true);

    this.authApiService
      .changePassword({ oldPassword, newPassword })
      .pipe(finalize(() => this.isChangingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordSuccess.set('Votre mot de passe a bien ete mis a jour.');
          this.changePasswordForm.reset({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
        error: (error: unknown) => {
          this.passwordError.set(this.extractErrorMessage(error));
        },
      });
  }

  protected hasPasswordError(
    controlName: 'oldPassword' | 'newPassword' | 'confirmPassword',
  ): boolean {
    const control = this.changePasswordForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected getPrimaryPhone(): string | null {
    const user = this.user();
    return user?.phoneNumber || user?.phone || null;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AppHttpError) {
      return error.message;
    }

    return 'Une erreur inattendue est survenue.';
  }
}
