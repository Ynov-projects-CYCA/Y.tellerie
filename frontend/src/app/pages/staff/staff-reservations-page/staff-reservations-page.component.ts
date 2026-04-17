import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { mockReservations, Reservation, ReservationStatus } from '../../../data/mockData';

@Component({
  selector: 'app-staff-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-reservations-page.component.html',
  styleUrls: ['./staff-reservations-page.component.scss']
})
export class StaffReservationsPageComponent {
  reservations: Reservation[] = [...mockReservations];
  filterStatus = 'all';

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