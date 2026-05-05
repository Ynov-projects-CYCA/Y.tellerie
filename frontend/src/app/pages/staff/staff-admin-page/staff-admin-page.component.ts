import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersApiService, User, UserRole, UserStatus } from '../../../core/api';
import { AuthSessionService } from '@core';
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
  readonly UserRole = UserRole;
  readonly UserStatus = UserStatus;
  
  currentUser = this.authSession.currentUser();
  employees: User[] = [];
  searchTerm = '';
  isLoading = false;

  isAddDialogOpen = false;
  isEditDialogOpen = false;
  selectedEmployee: User | null = null;

  employeeFormData: {
    firstname: string;
    lastname: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  } = this.getInitialForm();

  get hasStaffAccess(): boolean {
    return this.currentUser?.roles.includes('personnel') ?? false;
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.usersApi.findAll().subscribe({
      next: (users: User[]) => {
        this.employees = users.filter(u => u.role !== 'USER');
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des employés:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredEmployees(): User[] {
    const value = this.searchTerm.toLowerCase();
    return this.employees.filter(emp =>
      `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(value) ||
      emp.email.toLowerCase().includes(value)
    );
  }

  get activeCount(): number {
    return this.employees.filter(e => e.status === UserStatus.ACTIVE).length;
  }

  get inactiveCount(): number {
    return this.employees.filter(e => e.status === UserStatus.INACTIVE).length;
  }

  openAddDialog(): void {
    this.employeeFormData = this.getInitialForm();
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.employeeFormData = this.getInitialForm();
  }

  openEditDialog(employee: User): void {
    this.selectedEmployee = employee;
    this.employeeFormData = {
      firstname: employee.firstname,
      lastname: employee.lastname,
      email: employee.email,
      role: employee.role,
      status: employee.status
    };
    this.isEditDialogOpen = true;
  }

  closeEditDialog(): void {
    this.isEditDialogOpen = false;
    this.selectedEmployee = null;
    this.employeeFormData = this.getInitialForm();
  }

  addEmployee(): void {
    this.usersApi.create(this.employeeFormData).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeAddDialog();
      },
      error: (err: any) => console.error('Erreur lors de l\'ajout:', err)
    });
  }

  editEmployee(): void {
    if (!this.selectedEmployee) return;

    this.usersApi.update(this.selectedEmployee.id, this.employeeFormData).subscribe({
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
    const employee = this.employees.find(e => e.id === id);
    if (employee) {
      const newStatus = employee.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
      this.usersApi.update(id, { ...employee, status: newStatus }).subscribe({
        next: () => this.loadEmployees(),
        error: (err: any) => console.error('Erreur:', err)
      });
    }
  }

  getStatusLabel(status: UserStatus): string {
    return status === UserStatus.ACTIVE ? 'Actif' : 'Inactif';
  }

  getStatusClass(status: UserStatus): string {
    return status === UserStatus.ACTIVE ? 'badge badge--success' : 'badge badge--danger';
  }

  private getInitialForm() {
    return {
      firstname: '',
      lastname: '',
      email: '',
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE
    };
  }

  employeeColumns: GenericTableColumn<User>[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'firstname', label: 'Prénom' },
    { key: 'lastname', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'status', label: 'Statut', type: 'status' }
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
