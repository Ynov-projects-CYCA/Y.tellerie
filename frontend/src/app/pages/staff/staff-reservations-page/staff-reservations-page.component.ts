import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsApiService, Booking, BookingStatus, BookingSummaryRequest, Room, RoomsApiService, RoomStatus, StripeApiService } from '../../../core/api';
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
  private stripeApi = inject(StripeApiService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  
  reservations: Booking[] = [];
  availableRooms: Room[] = [];
  filterStatus = 'all';
  isLoading = false;
  isLoadingAvailableRooms = false;
  isAddDialogOpen = false;
  isSaving = false;
  addReservationError = '';
  editingReservationId: string | null = null;
  editingReservationRoom: Room | null = null;
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
    { key: 'id', label: 'ID', type: 'shortId' },
    { key: 'guestFirstName', label: 'Prénom' },
    { key: 'guestLastName', label: 'Nom' },
    { key: 'guestEmail', label: 'Email' },
    { key: 'checkInDate', label: 'Arrivée', type: 'date' },
    { key: 'checkOutDate', label: 'Départ', type: 'date' },
    { key: 'status', label: 'Statut', type: 'status' }
  ];

  reservationActions: GenericTableAction<Booking>[] = [
    {
      label: 'Modifier',
      action: 'edit',
      color: 'secondary',
      condition: row => row.status !== BookingStatus.CANCELED && row.status !== BookingStatus.REFUNDED
    },
    {
      label: 'Annuler',
      action: 'cancel',
      color: 'danger',
      condition: row => row.status !== BookingStatus.CANCELED
    }
  ];

  onTableAction(event: { action: string; row: Booking }): void {
    if (event.action === 'edit') {
      this.openEditDialog(event.row);
    }

    if (event.action === 'cancel') {
      this.updateStatus(event.row.id, BookingStatus.CANCELED);
    }
  }

  openAddDialog(): void {
    this.addReservationError = '';
    this.editingReservationId = null;
    this.editingReservationRoom = null;
    this.newReservation = this.getInitialReservationForm();
    this.availableRooms = [];
    this.isAddDialogOpen = true;
    this.loadSelectableRooms();
  }

  openEditDialog(booking: Booking): void {
    this.addReservationError = '';
    this.editingReservationId = booking.id;
    this.editingReservationRoom = booking.room;
    this.newReservation = {
      roomId: booking.room.id,
      guestFirstName: booking.guestFirstName,
      guestLastName: booking.guestLastName,
      guestEmail: booking.guestEmail,
      checkInDate: this.toDateInputValue(booking.checkInDate),
      checkOutDate: this.toDateInputValue(booking.checkOutDate),
      specialRequests: booking.specialRequests ?? ''
    };
    this.availableRooms = [booking.room];
    this.isAddDialogOpen = true;
    this.onReservationDatesChange();
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.isSaving = false;
    this.isLoadingAvailableRooms = false;
    this.addReservationError = '';
    this.editingReservationId = null;
    this.editingReservationRoom = null;
    this.availableRooms = [];
    this.newReservation = this.getInitialReservationForm();
    this.changeDetectorRef.detectChanges();
  }

  onReservationDatesChange(): void {
    const currentRoom = this.editingReservationRoom;
    const currentRoomId = currentRoom?.id;
    if (!currentRoomId) {
      this.newReservation.roomId = '';
    }
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
        const rooms = results.map(result => result.room);
        this.availableRooms = currentRoom && !rooms.some(room => room.id === currentRoom.id)
          ? [currentRoom, ...rooms]
          : rooms;
        if (currentRoomId) {
          this.newReservation.roomId = currentRoomId;
        }
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
    if (this.editingReservationId) {
      this.bookingsApi.update(this.editingReservationId, payload).subscribe({
        next: (booking: Booking) => {
          this.reservations = this.reservations.map(current =>
            current.id === booking.id ? booking : current,
          );
          this.closeAddDialog();
          this.loadReservations();
        },
        error: (err: any) => {
          console.error('Erreur lors de la modification de la réservation:', err);
          this.addReservationError = err?.message ?? 'Impossible de modifier la réservation pour le moment.';
          this.isSaving = false;
        }
      });
      return;
    }

    this.bookingsApi.confirm(payload).subscribe({
      next: (booking: Booking) => {
        this.stripeApi.createCheckoutSession({
          bookingId: booking.id,
          description: `Réservation chambre ${booking.room.roomNumber} - ${payload.checkInDate} au ${payload.checkOutDate}`,
        }).subscribe({
          next: () => {
            this.reservations = [...this.reservations, booking];
            this.closeAddDialog();
            this.loadReservations();
            this.changeDetectorRef.detectChanges();
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'envoi du lien de paiement:', err);
            this.bookingsApi.cancel(booking.id).subscribe({
              next: () => this.loadReservations(),
              error: () => this.loadReservations(),
            });
            this.addReservationError =
              err?.message ??
              'Le lien de paiement n\'a pas pu être créé. La réservation a été annulée pour libérer la chambre.';
            this.isSaving = false;
          }
        });
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

  get isEditingReservation(): boolean {
    return this.editingReservationId !== null;
  }

  private toDateInputValue(value: string): string {
    return value.slice(0, 10);
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
