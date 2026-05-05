import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersApiService, User, UserRole } from '../../../core/api';
import {
  AuthSessionService,
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} from '@core';
import {
  GenericDataTableComponent,
  GenericTableAction,
  GenericTableColumn
} from '../../../shared/components/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-staff-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericDataTableComponent],
  templateUrl: './staff-admin-page.component.html',
  styleUrls: ['./staff-admin-page.component.scss']
})
export class StaffAdminPageComponent implements OnInit {
  private usersApi = inject(UsersApiService);
  private authSession = inject(AuthSessionService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly passwordPolicyMessage = PASSWORD_POLICY_MESSAGE;
  
  readonly currentUser = computed(() => this.authSession.currentUser());
  readonly hasStaffAccess = computed(
    () => this.currentUser()?.roles.includes('admin') ?? false,
  );
  employees = signal<User[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  formError = signal<string | null>(null);

  isAddDialogOpen = false;
  isEditDialogOpen = false;
  selectedEmployee: User | null = null;

  employeeFormData: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    roles: UserRole[];
    isActive: boolean;
  } = this.getInitialForm();

  ngOnInit(): void {
    if (this.hasStaffAccess()) {
      this.loadEmployees();
    }
  }

  loadEmployees(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.usersApi.findAll().subscribe({
      next: (users: User[]) => {
        this.employees.set([...users]);
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des employés:', err);
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  get filteredEmployees(): User[] {
    const value = this.searchTerm().toLowerCase();
    return this.employees().filter(emp =>
      `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(value) ||
      emp.email.toLowerCase().includes(value)
    );
  }

  get activeCount(): number {
    return this.employees().filter((e) => e.isActive).length;
  }

  get inactiveCount(): number {
    return this.employees().filter((e) => !e.isActive).length;
  }

  openAddDialog(): void {
    this.employeeFormData = this.getInitialForm();
    this.formError.set(null);
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.formError.set(null);
    this.employeeFormData = this.getInitialForm();
  }

  openEditDialog(employee: User): void {
    this.selectedEmployee = employee;
    this.employeeFormData = {
      firstname: employee.firstname,
      lastname: employee.lastname,
      email: employee.email,
      phone: employee.phone,
      password: '',
      roles: [...employee.roles],
      isActive: employee.isActive,
    };
    this.formError.set(null);
    this.isEditDialogOpen = true;
  }

  closeEditDialog(): void {
    this.isEditDialogOpen = false;
    this.selectedEmployee = null;
    this.formError.set(null);
    this.employeeFormData = this.getInitialForm();
  }

  addEmployee(): void {
    if (!isStrongPassword(this.employeeFormData.password)) {
      this.formError.set(PASSWORD_POLICY_MESSAGE);
      return;
    }

    this.formError.set(null);

    this.usersApi.create({
      firstname: this.employeeFormData.firstname,
      lastname: this.employeeFormData.lastname,
      email: this.employeeFormData.email,
      phone: this.employeeFormData.phone,
      phoneNumber: this.employeeFormData.phone,
      roles: this.employeeFormData.roles,
      isActive: this.employeeFormData.isActive,
      password: this.employeeFormData.password,
    } as Partial<User> & { password: string }).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeAddDialog();
      },
      error: (err: any) => console.error('Erreur lors de l\'ajout:', err)
    });
  }

  editEmployee(): void {
    if (!this.selectedEmployee) return;

    this.formError.set(null);

    this.usersApi.update(this.selectedEmployee.id, {
      firstname: this.employeeFormData.firstname,
      lastname: this.employeeFormData.lastname,
      email: this.employeeFormData.email,
      phone: this.employeeFormData.phone,
      phoneNumber: this.employeeFormData.phone,
      roles: this.employeeFormData.roles,
      isActive: this.employeeFormData.isActive,
    }).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeEditDialog();
      },
      error: (err: any) => console.error('Erreur lors de la modification:', err)
    });
  }

  deleteEmployee(id: string): void {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      this.usersApi.delete(id).subscribe({
        next: () => this.loadEmployees(),
        error: (err: any) => console.error('Erreur lors de la suppression:', err)
      });
    }
  }

  toggleEmployeeStatus(id: string): void {
    const employee = this.employees().find(e => e.id === id);
    if (employee) {
      this.usersApi.update(id, { isActive: !employee.isActive }).subscribe({
        next: () => this.loadEmployees(),
        error: (err: any) => console.error('Erreur:', err)
      });
    }
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'badge badge--success' : 'badge badge--danger';
  }

  setRole(role: UserRole): void {
    this.employeeFormData.roles = [role];
  }

  getPrimaryRole(user: User): string {
    if (user.roles.includes('admin')) {
      return 'Administrateur';
    }

    return user.roles.includes('personnel') ? 'Personnel' : 'Client';
  }

  private getInitialForm() {
    return {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      password: '',
      roles: ['personnel'] as UserRole[],
      isActive: true,
    };
  }

  employeeColumns: GenericTableColumn<User>[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'firstname', label: 'Prénom' },
    { key: 'lastname', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'roles', label: 'Rôles' },
    { key: 'isActive', label: 'Statut', type: 'status' }
  ];

  employeeActions: GenericTableAction<User>[] = [
    {
      label: 'Modifier',
      action: 'edit',
      color: 'secondary'
    },
    {
      label: 'Activer/Désactiver',
      action: 'toggle',
      color: 'secondary'
    },
    {
      label: 'Supprimer',
      action: 'delete',
      color: 'danger'
    }
  ];

  onTableAction(event: { action: string; row: User }): void {
    if (event.action === 'edit') {
      this.openEditDialog(event.row);
    }

    if (event.action === 'toggle') {
      this.toggleEmployeeStatus(event.row.id);
    }

    if (event.action === 'delete') {
      this.deleteEmployee(event.row.id);
    }
  }
}
