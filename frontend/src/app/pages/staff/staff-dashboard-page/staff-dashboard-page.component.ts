import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableModalComponent, TableConfig } from '../../../shared/components/data-table-modal/data-table-modal.component';
import {
  mockRooms,
  mockReservations,
  mockEmployees,
  currentUser,
  Room,
  Reservation,
  Employee,
  RoomStatus,
  ReservationStatus,
  EmployeeStatus
} from '../../../data/mockData';

@Component({
  selector: 'app-staff-dashboard-page',
  standalone: true,
  imports: [CommonModule, DataTableModalComponent],
  templateUrl: './staff-dashboard-page.component.html',
  styleUrls: ['./staff-dashboard-page.component.scss']
})
export class StaffDashboardPageComponent implements OnInit {
  availableRooms = 0;
  occupiedRooms = 0;
  activeReservations = 0;
  totalRevenue = 0;
  occupancyRate = 0;

  rooms: Room[] = [...mockRooms];
  reservations: Reservation[] = [...mockReservations];
  employees: Employee[] = [...mockEmployees];
  currentUser = currentUser;

  isModalOpen = false;
  activeModal: 'reservations' | 'rooms' | 'admin' | null = null;
  modalConfig!: TableConfig;

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    this.availableRooms = this.rooms.filter(r => r.status === 'available').length;
    this.occupiedRooms = this.rooms.filter(r => r.status === 'occupied').length;
    this.activeReservations = this.reservations.filter(r => r.status === 'confirmed').length;
    this.totalRevenue = this.reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0);
    this.occupancyRate = Math.round((this.occupiedRooms / this.rooms.length) * 100);
  }

  getActiveEmployees() {
    return this.employees.filter(e => e.status === 'active').slice(0, 3);
  }

  getPendingReservations() {
    return this.reservations.filter(r => r.status === 'pending').length;
  }

  openReservationsModal(): void {
    this.activeModal = 'reservations';
    this.modalConfig = {
      title: 'Tableau des réservations',
      subtitle: 'Gère les statuts et actions des réservations',
      columns: [
        { key: 'id', label: 'ID', width: '80px', sortable: true },
        { key: 'guestName', label: 'Client', sortable: true },
        { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
        { key: 'checkIn', label: 'Arrivée', type: 'date', sortable: true },
        { key: 'totalPrice', label: 'Prix', type: 'currency', sortable: true },
        { key: 'status', label: 'Statut', type: 'status', sortable: true }
      ],
      actions: [
        {
          label: 'Confirmer',
          action: 'confirm',
          color: 'success',
          condition: item => item.status === 'pending'
        },
        {
          label: 'Annuler',
          action: 'cancel',
          color: 'danger',
          condition: item => item.status !== 'completed'
        },
        {
          label: 'Terminer',
          action: 'complete',
          color: 'primary',
          condition: item => item.status === 'confirmed'
        }
      ],
      data: this.reservations,
      emptyMessage: 'Aucune réservation trouvée',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  openRoomsModal(): void {
    this.activeModal = 'rooms';
    this.modalConfig = {
      title: 'Tableau des chambres',
      subtitle: 'Gère le statut des chambres',
      columns: [
        { key: 'id', label: 'ID', width: '80px', sortable: true },
        { key: 'status', label: 'Statut', type: 'status', sortable: true }
      ],
      actions: [
        {
          label: 'Disponible',
          action: 'available',
          color: 'success',
          condition: item => item.status !== 'available'
        },
        {
          label: 'Occupée',
          action: 'occupied',
          color: 'danger',
          condition: item => item.status !== 'occupied'
        },
        {
          label: 'Supprimer',
          action: 'delete',
          color: 'danger'
        }
      ],
      data: this.rooms,
      emptyMessage: 'Aucune chambre disponible',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  openAdminModal(): void {
    this.activeModal = 'admin';
    this.modalConfig = {
      title: 'Tableau du personnel',
      subtitle: 'Gère le personnel directement depuis le dashboard',
      columns: [
        { key: 'id', label: 'ID', width: '80px', sortable: true },
        { key: 'name', label: 'Nom', sortable: true },
        { key: 'role', label: 'Rôle', sortable: true },
        { key: 'shift', label: 'Shift', sortable: true },
        { key: 'status', label: 'Statut', type: 'status', sortable: true }
      ],
      actions: [
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
          label: 'Supprimer',
          action: 'delete',
          color: 'danger'
        }
      ],
      data: this.employees,
      emptyMessage: 'Aucun employé trouvé',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.activeModal = null;
  }

  onModalAction(event: { action: string; item: any }): void {
    if (this.activeModal === 'reservations') {
      this.handleReservationAction(event.action, event.item);
    }

    if (this.activeModal === 'rooms') {
      this.handleRoomAction(event.action, event.item);
    }

    if (this.activeModal === 'admin') {
      this.handleAdminAction(event.action, event.item);
    }

    this.calculateStats();
  }

  private handleReservationAction(action: string, item: Reservation): void {
    switch (action) {
      case 'confirm':
        this.updateReservationStatus(item.id, 'confirmed');
        break;
      case 'cancel':
        this.updateReservationStatus(item.id, 'pending');
        break;
      case 'complete':
        this.updateReservationStatus(item.id, 'completed');
        break;
    }
  }

  private handleRoomAction(action: string, item: Room): void {
    switch (action) {
      case 'available':
        this.updateRoomStatus(item.id, 'available');
        break;
      case 'occupied':
        this.updateRoomStatus(item.id, 'occupied');
        break;
      case 'delete':
        this.deleteRoom(item.id);
        break;
    }
  }

  private handleAdminAction(action: string, item: Employee): void {
    switch (action) {
      case 'activate':
        this.toggleEmployeeStatus(item.id, 'active');
        break;
      case 'deactivate':
        this.toggleEmployeeStatus(item.id, 'inactive');
        break;
      case 'delete':
        this.deleteEmployee(item.id);
        break;
    }
  }

  private updateReservationStatus(id: number, status: ReservationStatus): void {
    this.reservations = this.reservations.map(reservation =>
      reservation.id === id ? { ...reservation, status } : reservation
    );
  }

  private updateRoomStatus(id: number, status: RoomStatus): void {
    this.rooms = this.rooms.map(room =>
      room.id === id ? { ...room, status } : room
    );
  }

  private toggleEmployeeStatus(id: number, status: EmployeeStatus): void {
    this.employees = this.employees.map(employee =>
      employee.id === id ? { ...employee, status } : employee
    );
  }

  private deleteRoom(id: number): void {
    this.rooms = this.rooms.filter(room => room.id !== id);
  }

  private deleteEmployee(id: number): void {
    this.employees = this.employees.filter(employee => employee.id !== id);
  }
}
