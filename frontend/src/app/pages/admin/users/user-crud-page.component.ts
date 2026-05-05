import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucidePencil,
  LucidePlus,
  LucideRefreshCw,
  LucideSave,
  LucideTrash2,
  LucideUsers,
  LucideX,
} from '@lucide/angular';
import { finalize } from 'rxjs';
import {
  AppHttpError,
  AuthRole,
  CreateUserPayload,
  User,
  UsersApiService,
} from '@core';

@Component({
  selector: 'app-user-crud-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
    LucideSave,
    LucideTrash2,
    LucideUsers,
    LucideX,
  ],
  templateUrl: './user-crud-page.component.html',
  styleUrl: './user-crud-page.component.scss',
})
export class UserCrudPageComponent implements OnInit {
  private readonly usersApiService = inject(UsersApiService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly users = signal<User[]>([]);
  protected readonly selectedUser = signal<User | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly roles: AuthRole[] = ['client', 'personnel', 'admin'];

  protected readonly isEditing = computed(() => this.selectedUser() !== null);

  protected readonly form = this.formBuilder.nonNullable.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    phone: ['', Validators.required],
    password: ['', [Validators.minLength(8)]],
    role: ['client' as AuthRole, Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  protected loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.usersApiService
      .findAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: (error) => this.errorMessage.set(this.formatError(error)),
      });
  }

  protected selectUser(user: User): void {
    this.selectedUser.set(user);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.form.reset({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      phone: user.phone,
      password: '',
      role: user.roles[0] ?? 'client',
      isActive: user.isActive,
    });
  }

  protected startCreate(): void {
    this.selectedUser.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.form.controls.password.setValidators([
      Validators.required,
      Validators.minLength(8),
    ]);
    this.form.controls.password.updateValueAndValidity();
    this.form.reset({
      firstname: '',
      lastname: '',
      email: '',
      phoneNumber: '',
      phone: '',
      password: '',
      role: 'client',
      isActive: true,
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const selectedUser = this.selectedUser();
    const request = selectedUser
      ? this.usersApiService.update(selectedUser.id, {
          firstname: value.firstname,
          lastname: value.lastname,
          email: value.email,
          phoneNumber: value.phoneNumber,
          phone: value.phone,
          roles: [value.role],
          isActive: value.isActive,
        })
      : this.usersApiService.create({
          firstname: value.firstname,
          lastname: value.lastname,
          email: value.email,
          phoneNumber: value.phoneNumber,
          phone: value.phone,
          password: value.password,
          roles: [value.role],
          isActive: value.isActive,
        } satisfies CreateUserPayload);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (user) => {
        this.successMessage.set(
          selectedUser ? 'Utilisateur mis a jour.' : 'Utilisateur cree.',
        );
        this.upsertUser(user);
        this.selectUser(user);
      },
      error: (error) => this.errorMessage.set(this.formatError(error)),
    });
  }

  protected deleteUser(user: User): void {
    if (!confirm(`Supprimer le compte de ${user.firstname} ${user.lastname} ?`)) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.usersApiService.delete(user.id).subscribe({
      next: () => {
        this.users.update((users) => users.filter((item) => item.id !== user.id));
        if (this.selectedUser()?.id === user.id) {
          this.startCreate();
        }
        this.successMessage.set('Utilisateur supprime.');
      },
      error: (error) => this.errorMessage.set(this.formatError(error)),
    });
  }

  private upsertUser(user: User): void {
    this.users.update((users) => {
      const index = users.findIndex((item) => item.id === user.id);
      if (index === -1) {
        return [user, ...users];
      }

      return users.map((item) => (item.id === user.id ? user : item));
    });
  }

  private formatError(error: unknown): string {
    if (error instanceof AppHttpError) {
      return error.message;
    }

    return "L'operation a echoue.";
  }
}
