import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Booking, BookingsApiService, BookingStatus } from '@core';
import {
  DataTableModalComponent,
  TableAction,
  TableColumn,
  TableConfig,
} from '../../../shared/components/data-table-modal/data-table-modal.component';

interface ReservationTableRow {
  id: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  totalPrice: number;
  status: BookingStatus;
  statusLabel: string;
  raw: Booking;
}

@Component({
  selector: 'app-staff-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableModalComponent],
  templateUrl: './staff-reservations-page.component.html',
  styleUrls: ['./staff-reservations-page.component.scss']
})
export class StaffReservationsPageComponent implements OnInit {
  private readonly bookingsApi = inject(BookingsApiService);

  protected readonly statusOptions = Object.values(BookingStatus);

  reservations: Booking[] = [];
  filterStatus: BookingStatus | 'all' = 'all';
  isLoading = false;
  errorMessage: string | null = null;
  isModalOpen = false;
  modalConfig!: TableConfig;

  ngOnInit(): void {
    this.loadReservations();
  }

  get filteredReservations(): Booking[] {
    if (this.filterStatus === 'all') {
      return this.reservations;
    }
    return this.reservations.filter(r => r.status === this.filterStatus);
  }

  get confirmedCount(): number {
    return this.reservations.filter(r => r.status === BookingStatus.CONFIRMED).length;
  }

  get pendingCount(): number {
    return this.reservations.filter(r => r.status === BookingStatus.PENDING_PAYMENT).length;
  }

  get totalRevenue(): number {
    return this.reservations
      .filter(r => r.status === BookingStatus.CONFIRMED)
      .reduce((sum, r) => sum + r.totalPrice, 0);
  }

  protected getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]: 'Confirmée',
      [BookingStatus.PENDING_PAYMENT]: 'En attente paiement',
      [BookingStatus.PAYMENT_FAILED]: 'Paiement échoué',
      [BookingStatus.CANCELED]: 'Annulée',
      [BookingStatus.REFUND_REQUESTED]: 'Remboursement demandé',
      [BookingStatus.REFUNDED]: 'Remboursée',
    };

    return labels[status] ?? status;
  }

  openReservationsModal(): void {
    this.initializeModalConfig();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onActionClick(event: { action: string; item: ReservationTableRow }): void {
    if (event.action !== 'cancel') {
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    this.isLoading = true;
    this.bookingsApi.cancel(event.item.raw.id).subscribe({
      next: () => this.loadReservations(),
      error: () => {
        this.errorMessage = "Impossible d'annuler cette réservation.";
        this.isLoading = false;
      },
    });
  }

  private loadReservations(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.bookingsApi.findAllForStaff().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.isLoading = false;
        if (this.isModalOpen) {
          this.initializeModalConfig();
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les réservations.';
        this.isLoading = false;
      },
    });
  }

  private initializeModalConfig(): void {
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID', width: '110px', sortable: true },
      { key: 'guestName', label: 'Client', sortable: true },
      { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
      { key: 'checkInDate', label: 'Arrivée', type: 'date', sortable: true },
      { key: 'totalPrice', label: 'Prix', type: 'currency', sortable: true },
      { key: 'statusLabel', label: 'Statut', type: 'status', sortable: true },
    ];

    const actions: TableAction[] = [
      {
        label: 'Annuler',
        action: 'cancel',
        color: 'danger',
        condition: (item: ReservationTableRow) =>
          ![BookingStatus.CANCELED, BookingStatus.REFUNDED].includes(item.status),
      },
    ];

    this.modalConfig = {
      title: 'Tableau des réservations',
      subtitle: 'Vue globale réservée au personnel',
      columns,
      actions,
      data: this.toTableRows(),
      loading: this.isLoading,
      emptyMessage: 'Aucune réservation trouvée',
      useDropdownForActions: true,
    };
  }

  private toTableRows(): ReservationTableRow[] {
    return this.filteredReservations.map((reservation) => ({
      id: reservation.id.slice(0, 8).toUpperCase(),
      guestName: `${reservation.guestFirstName} ${reservation.guestLastName}`.trim(),
      roomNumber: reservation.room.roomNumber,
      checkInDate: reservation.checkInDate,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      statusLabel: this.getStatusLabel(reservation.status),
      raw: reservation,
    }));
  }
}
