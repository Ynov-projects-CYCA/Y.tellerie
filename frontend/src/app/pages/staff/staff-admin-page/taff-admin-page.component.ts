import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { currentUser, Employee, EmployeeStatus, mockEmployees } from '../../../data/mockData';

@Component({
  selector: 'app-staff-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-admin-page.component.html',
  styleUrls: ['./staff-admin-page.component.scss']
})
export class StaffAdminPageComponent {
  currentUser = currentUser;
  employees: Employee[] = [...mockEmployees];
  searchTerm = '';

  isAddDialogOpen = false;
  isEditDialogOpen = false;
  selectedEmployee: Employee | null = null;

  employeeFormData: {
    name: string;
    role: string;
    shift: string;
    status: EmployeeStatus;
  } = this.getInitialForm();

  get filteredEmployees(): Employee[] {
    const value = this.searchTerm.toLowerCase();
    return this.employees.filter(emp =>
      emp.name.toLowerCase().includes(value) ||
      emp.role.toLowerCase().includes(value) ||
      emp.shift.toLowerCase().includes(value)
    );
  }

  get activeCount(): number {
    return this.employees.filter(e => e.status === 'active').length;
  }

  get inactiveCount(): number {
    return this.employees.filter(e => e.status === 'inactive').length;
  }

  openAddDialog(): void {
    this.employeeFormData = this.getInitialForm();
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.employeeFormData = this.getInitialForm();
  }

  openEditDialog(employee: Employee): void {
    this.selectedEmployee = employee;
    this.employeeFormData = {
      name: employee.name,
      role: employee.role,
      shift: employee.shift,
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
    const newId = Math.max(...this.employees.map(e => e.id), 0) + 1;

    this.employees = [
      ...this.employees,
      {
        id: newId,
        ...this.employeeFormData
      }
    ];

    this.closeAddDialog();
  }

  editEmployee(): void {
    if (!this.selectedEmployee) return;

    this.employees = this.employees.map(emp =>
      emp.id === this.selectedEmployee?.id
        ? { ...emp, ...this.employeeFormData }
        : emp
    );

    this.closeEditDialog();
  }

  deleteEmployee(id: number): void {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      this.employees = this.employees.filter(emp => emp.id !== id);
    }
  }

  toggleEmployeeStatus(id: number): void {
    this.employees = this.employees.map(emp =>
      emp.id === id
        ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
        : emp
    );
  }

  getStatusLabel(status: EmployeeStatus): string {
    return status === 'active' ? 'Actif' : 'Inactif';
  }

  getStatusClass(status: EmployeeStatus): string {
    return status === 'active' ? 'badge badge--success' : 'badge badge--danger';
  }

  private getInitialForm() {
    return {
      name: '',
      role: '',
      shift: '',
      status: 'active' as EmployeeStatus
    };
  }
}