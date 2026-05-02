import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  LucideUser,
  LucideMail,
  LucidePhone,
  LucideSave,
  LucideLoader2
} from '@lucide/angular';
import { AppHttpError, AuthApiService, AuthSessionService } from '@core';
import { ButtonComponent, CardComponent, CardContentComponent, CardDescriptionComponent, CardHeaderComponent, CardTitleComponent } from '@shared';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    LucideUser,
    LucideMail,
    LucidePhone,
    LucideSave,
    LucideLoader2
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly authApiService = inject(AuthApiService);

  protected readonly user = computed(() => this.authSessionService.currentUser());
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly profileForm = this.fb.nonNullable.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{8,}$/)]],
  });

  ngOnInit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        firstname: currentUser.firstname,
        lastname: currentUser.lastname,
        email: currentUser.email,
        phone: currentUser.phone,
      });
    }
  }

  protected submit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.isSuccess.set(false);

    this.authApiService
      .updateProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.authSessionService.updateSession(response);
          this.isSuccess.set(true);
          setTimeout(() => this.isSuccess.set(false), 3000);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof AppHttpError
              ? error.message
              : 'Une erreur est survenue lors de la mise à jour.'
          );
        },
      });
  }

  protected hasError(controlName: 'firstname' | 'lastname' | 'email' | 'phone'): boolean {
    const control = this.profileForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }
}
