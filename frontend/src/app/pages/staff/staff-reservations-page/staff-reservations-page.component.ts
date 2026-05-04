import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModalComponent, TableConfig, TableColumn, TableAction } from '../../../shared/components/data-table-modal/data-table-modal.component';
import { mockReservations, Reservation, ReservationStatus } from '../../../data/mockData';

@Component({
  selector: 'app-staff-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableModalComponent],
  templateUrl: './staff-reservations-page.component.html',
  styleUrls: ['./staff-reservations-page.component.scss']
})
export class StaffReservationsPageComponent {
  reservations: Reservation[] = [...mockReservations];
  filterStatus = 'all';
  isModalOpen = false;
  modalConfig!: TableConfig;

  get filteredReservations(): Reservation[] {
    if (this.filterStatus === 'all') {
      return this.reservations;
    }
    return this.reservations.filter(r => r.status === this.filterStatus);
  }

  get confirmedCount(): number {
    return this.reservations.filter(r => r.status === 'confirmed').length;
  }

  get pendingCount(): number {
    return this.reservations.filter(r => r.status === 'pending').length;
  }

  get totalRevenue(): number {
    return this.reservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0);
  }

  updateStatus(id: number, status: string): void {
    this.reservations = this.reservations.map(reservation =>
      reservation.id === id
        ? { ...reservation, status: status as ReservationStatus }
        : reservation
    );
  }

  initializeModalConfig() {
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'guestName', label: 'Client', sortable: true },
      { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
      { key: 'checkIn', label: 'Arrivée', type: 'date', sortable: true },
      { key: 'totalPrice', label: 'Prix', type: 'currency', sortable: true },
      { key: 'status', label: 'Statut', type: 'status', sortable: true }
    ];

    const actions: TableAction[] = [
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
    ];

    this.modalConfig = {
      title: 'Tableau des réservations',
      subtitle: 'Gère les statuts et actions des réservations',
      columns,
      actions,
      data: this.filteredReservations,
      emptyMessage: 'Aucune réservation trouvée'
    };
  }

  openReservationsModal(): void {
    this.initializeModalConfig();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onActionClick(event: { action: string; item: any }): void {
    const { action, item } = event;

    switch (action) {
      case 'confirm':
        this.updateStatus(item.id, 'confirmed');
        break;
      case 'cancel':
        this.updateStatus(item.id, 'pending');
        break;
      case 'complete':
        this.updateStatus(item.id, 'completed');
        break;
    }

    this.initializeModalConfig();
  }

  onRowClick(item: any): void {
    console.log('reservation clicked', item);
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      confirmed: 'Confirmée',
      pending: 'En attente',
      completed: 'Terminée'
    };
    return labels[status];
  }

  getStatusClass(status: ReservationStatus): string {
    const classes: Record<ReservationStatus, string> = {
      confirmed: 'badge badge--success',
      pending: 'badge badge--warning',
      completed: 'badge badge--neutral'
    };
    return classes[status];
  }
}