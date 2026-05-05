import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsApiService, Booking, BookingStatus, BookingSummaryRequest, Room, RoomsApiService, RoomStatus } from '../../../core/api';
import {
  GenericDataTableComponent,
  GenericTableAction,
  GenericTableColumn
} from '../../../shared/components/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-staff-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericDataTableComponent],
  templateUrl: './staff-reservations-page.component.html',
  styleUrls: ['./staff-reservations-page.component.scss']
})
export class StaffReservationsPageComponent implements OnInit {
  private bookingsApi = inject(BookingsApiService);
  private roomsApi = inject(RoomsApiService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  
  reservations: Booking[] = [];
  availableRooms: Room[] = [];
  filterStatus = 'all';
  isLoading = false;
  isLoadingAvailableRooms = false;
  isAddDialogOpen = false;
  isSaving = false;
  addReservationError = '';
  newReservation = this.getInitialReservationForm();

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.bookingsApi.findAll().subscribe({
      next: (bookings: Booking[]) => {
        this.reservations = bookings;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des réservations:', err);
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
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
      .filter(r => r.status === BookingStatus.CONFIRMED || r.status === BookingStatus.REFUNDED)
      .reduce((sum, r) => sum + (r.room?.price || 0), 0);
  }

  updateStatus(id: string, status: BookingStatus): void {
    if (status === BookingStatus.CANCELED) {
      this.bookingsApi.cancel(id).subscribe({
        next: () => this.loadReservations(),
        error: (err: any) => console.error('Erreur lors de l\'annulation de la réservation:', err)
      });
    }
  }

  onRowClick(item: any): void {
    console.log('reservation clicked', item);
  }

  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]: 'Confirmée',
      [BookingStatus.PENDING_PAYMENT]: 'En attente',
      [BookingStatus.PAYMENT_FAILED]: 'Paiement échoué',
      [BookingStatus.CANCELED]: 'Annulée',
      [BookingStatus.REFUND_REQUESTED]: 'Remboursement demandé',
      [BookingStatus.REFUNDED]: 'Remboursée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: BookingStatus): string {
    const classes: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]: 'badge badge--success',
      [BookingStatus.PENDING_PAYMENT]: 'badge badge--warning',
      [BookingStatus.PAYMENT_FAILED]: 'badge badge--danger',
      [BookingStatus.CANCELED]: 'badge badge--neutral',
      [BookingStatus.REFUND_REQUESTED]: 'badge badge--info',
      [BookingStatus.REFUNDED]: 'badge badge--neutral'
    };
    return classes[status] || 'badge';
  }

  reservationColumns: GenericTableColumn<Booking>[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'guestFirstName', label: 'Prénom' },
    { key: 'guestLastName', label: 'Nom' },
    { key: 'guestEmail', label: 'Email' },
    { key: 'checkInDate', label: 'Arrivée', type: 'date' },
    { key: 'checkOutDate', label: 'Départ', type: 'date' },
    { key: 'status', label: 'Statut', type: 'status' }
  ];

  reservationActions: GenericTableAction<Booking>[] = [
    {
      label: 'Confirmer',
      action: 'confirm',
      color: 'success',
      condition: row => row.status === BookingStatus.PENDING_PAYMENT
    },
    {
      label: 'Annuler',
      action: 'cancel',
      color: 'danger',
      condition: row => row.status !== BookingStatus.CANCELED
    }
  ];

  onTableAction(event: { action: string; row: Booking }): void {
    if (event.action === 'confirm') {
      this.updateStatus(event.row.id, BookingStatus.CONFIRMED);
    }

    if (event.action === 'cancel') {
      this.updateStatus(event.row.id, BookingStatus.CANCELED);
    }
  }

  openAddDialog(): void {
    this.addReservationError = '';
    this.availableRooms = [];
    this.isAddDialogOpen = true;
    this.loadSelectableRooms();
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.isSaving = false;
    this.isLoadingAvailableRooms = false;
    this.addReservationError = '';
    this.availableRooms = [];
    this.newReservation = this.getInitialReservationForm();
    this.changeDetectorRef.detectChanges();
  }

  onReservationDatesChange(): void {
    this.newReservation.roomId = '';
    this.availableRooms = [];
    this.addReservationError = '';

    if (!this.canLoadAvailableRooms()) {
      this.loadSelectableRooms();
      return;
    }

    this.isLoadingAvailableRooms = true;
    this.bookingsApi.searchAvailability({
      checkInDate: this.newReservation.checkInDate,
      checkOutDate: this.newReservation.checkOutDate,
    }).subscribe({
      next: (results) => {
        this.availableRooms = results.map(result => result.room);
        this.isLoadingAvailableRooms = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des chambres disponibles:', err);
        this.addReservationError = err?.message ?? 'Impossible de charger les chambres disponibles.';
        this.isLoadingAvailableRooms = false;
      }
    });
  }

  loadSelectableRooms(): void {
    this.isLoadingAvailableRooms = true;
    this.roomsApi.findAll().subscribe({
      next: (rooms: Room[]) => {
        this.availableRooms = rooms.filter(room => room.status === RoomStatus.AVAILABLE);
        this.isLoadingAvailableRooms = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des chambres:', err);
        this.addReservationError = err?.message ?? 'Impossible de charger les chambres.';
        this.isLoadingAvailableRooms = false;
      }
    });
  }

  addReservation(): void {
    this.addReservationError = '';
    const specialRequests = this.newReservation.specialRequests?.trim();

    const payload: BookingSummaryRequest = {
      roomId: this.newReservation.roomId,
      guestFirstName: this.newReservation.guestFirstName.trim(),
      guestLastName: this.newReservation.guestLastName.trim(),
      guestEmail: this.newReservation.guestEmail.trim(),
      checkInDate: this.newReservation.checkInDate,
      checkOutDate: this.newReservation.checkOutDate,
      specialRequests: specialRequests || undefined
    };

    if (!this.isReservationFormValid(payload)) {
      this.addReservationError = 'Veuillez renseigner une chambre, un client, un email et des dates valides.';
      return;
    }

    this.isSaving = true;
    this.bookingsApi.confirm(payload).subscribe({
      next: (booking: Booking) => {
        this.reservations = [...this.reservations, booking];
        this.closeAddDialog();
        this.loadReservations();
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout de la réservation:', err);
        this.addReservationError = err?.message ?? 'Impossible d\'ajouter la réservation pour le moment.';
        this.isSaving = false;
      }
    });
  }

  private isReservationFormValid(payload: BookingSummaryRequest): boolean {
    return Boolean(
      payload.roomId &&
      payload.guestFirstName &&
      payload.guestLastName &&
      payload.guestEmail &&
      payload.checkInDate &&
      payload.checkOutDate &&
      payload.checkOutDate > payload.checkInDate
    );
  }

  private canLoadAvailableRooms(): boolean {
    return Boolean(
      this.newReservation.checkInDate &&
      this.newReservation.checkOutDate &&
      this.newReservation.checkOutDate > this.newReservation.checkInDate
    );
  }

  private getInitialReservationForm(): BookingSummaryRequest {
    return {
      roomId: '',
      guestFirstName: '',
      guestLastName: '',
      guestEmail: '',
      checkInDate: '',
      checkOutDate: '',
      specialRequests: ''
    };
  }
}
