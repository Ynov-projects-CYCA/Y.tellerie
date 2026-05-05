import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModalComponent, TableConfig, TableColumn, TableAction } from '../../../shared/components/data-table-modal/data-table-modal.component';
import { currentUser, Employee, EmployeeStatus, mockEmployees } from '../../../data/mockData';

@Component({
  selector: 'app-staff-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableModalComponent],
  templateUrl: './staff-admin-page.component.html',
  styleUrls: ['./staff-admin-page.component.scss']
})
export class StaffAdminPageComponent {
  currentUser = currentUser;
  employees: Employee[] = [...mockEmployees];
  searchTerm = '';
  isModalOpen = false;
  modalConfig!: TableConfig;

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

  initializeModalConfig() {
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'name', label: 'Nom', sortable: true },
      { key: 'role', label: 'Rôle', sortable: true },
      { key: 'shift', label: 'Shift', sortable: true },
      { key: 'status', label: 'Statut', type: 'status', sortable: true }
    ];

    const actions: TableAction[] = [
      {
        label: 'Activer',
        action: 'activate',
        color: 'success',
        condition: item => item.status === 'inactive'
      },
      {
        label: 'Désactiver',
        action: 'deactivate',
        color: 'secondary',
        condition: item => item.status === 'active'
      },
      {
        label: 'Modifier',
        action: 'edit',
        color: 'primary'
      },
      {
        label: 'Supprimer',
        action: 'delete',
        color: 'danger'
      }
    ];

    this.modalConfig = {
      title: 'Tableau du personnel',
      subtitle: 'Gère le personnel via cette modal',
      columns,
      actions,
      data: this.filteredEmployees,
      emptyMessage: 'Aucun employé trouvé'
    };
  }

  openEmployeesModal(): void {
    this.initializeModalConfig();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onActionClick(event: { action: string; item: any }): void {
    const { action, item } = event;

    switch (action) {
      case 'activate':
        this.toggleEmployeeStatus(item.id);
        break;
      case 'deactivate':
        this.toggleEmployeeStatus(item.id);
        break;
      case 'edit':
        this.openEditDialog(item);
        break;
      case 'delete':
        this.deleteEmployee(item.id);
        break;
    }

    this.initializeModalConfig();
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