import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideSearch,
  LucideCalendar,
  LucideUsers,
  LucideCheckCircle,
  LucideRotateCcw
} from '@lucide/angular';
import {
  AvailabilityResponse,
  BookingsApiService,
  getRoomImage,
  getRoomLabel,
  Room,
  RoomsApiService,
  StripeApiService,
} from '@core';
import { BadgeComponent, ButtonComponent, CardComponent, DialogComponent } from '@shared';

interface DisplayRoom {
  room: Room;
  totalPrice: number;
  isSearch: boolean;
}

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    DialogComponent,
    LucideSearch,
    LucideCalendar,
    LucideUsers,
    LucideCheckCircle,
    LucideRotateCcw,
  ],
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.scss',
})
export class BookingPageComponent implements OnInit {
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly roomsApi = inject(RoomsApiService);
  private readonly stripeApi = inject(StripeApiService);

  readonly today = new Date().toISOString().split('T')[0];

  checkIn = signal<string>('');
  checkOut = signal<string>('');
  guests = signal<number>(1);

  isLoading = signal(false);
  hasSearched = signal(false);
  searchError = signal<string | null>(null);

  availableRooms = signal<AvailabilityResponse[]>([]);
  allRooms = signal<Room[]>([]);

  displayRooms = computed<DisplayRoom[]>(() => {
    if (this.hasSearched()) {
      return this.availableRooms().map(ar => ({
        room: ar.room,
        totalPrice: ar.totalPrice,
        isSearch: true
      }));
    }
    return this.allRooms().map(r => ({
      room: r,
      totalPrice: r.price,
      isSearch: false
    }));
  });

  selectedRoom = signal<DisplayRoom | null>(null);
  dialogOpen = signal(false);
  guestName = signal('');
  guestEmail = signal('');
  specialRequests = signal('');
  isSubmitting = signal(false);
  bookingSuccess = signal(false);
  bookingError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadInitialRooms();
  }

  private loadInitialRooms(): void {
    this.isLoading.set(true);
    this.roomsApi.findAll().subscribe({
      next: (rooms) => {
        this.allRooms.set(rooms);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Réinitialise la recherche et revient à la liste initiale.
   */
  resetSearch(): void {
    this.checkIn.set('');
    this.checkOut.set('');
    this.guests.set(1);
    this.hasSearched.set(false);
    this.availableRooms.set([]);
    this.searchError.set(null);
  }

  /**
   * Lance la recherche de disponibilités.
   */
  async handleSearch(): Promise<void> {
    if (!this.checkIn() || !this.checkOut()) {
      this.searchError.set('Veuillez sélectionner vos dates de séjour.');
      return;
    }

    this.isLoading.set(true);
    this.searchError.set(null);

    this.bookingsApi.searchAvailability({
      checkInDate: this.checkIn(),
      checkOutDate: this.checkOut(),
      capacity: this.guests(),
    }).subscribe({
      next: (rooms) => {
        this.availableRooms.set(rooms);
        this.hasSearched.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.searchError.set('Une erreur est survenue lors de la recherche.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Ouvre la modale de réservation pour une chambre sélectionnée.
   */
  openDialog(roomData: DisplayRoom): void {
    if (!this.checkIn() || !this.checkOut()) {
      this.searchError.set('Veuillez sélectionner vos dates de séjour avant de réserver.');
      // Scroller vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.selectedRoom.set(roomData);
    this.dialogOpen.set(true);
  }

  /**
   * Ferme la modale de réservation et réinitialise le formulaire.
   */
  closeDialog(): void {
    if (this.isSubmitting()) return;
    this.dialogOpen.set(false);
    this.resetBookingForm();
  }

  /**
   * Réinitialise les champs du formulaire de réservation.
   */
  private resetBookingForm(): void {
    this.bookingSuccess.set(false);
    this.bookingError.set(null);
    this.guestName.set('');
    this.guestEmail.set('');
    this.specialRequests.set('');
  }

  /**
   * Confirme la réservation auprès de l'API puis redirige vers Stripe.
   */
  confirmBooking(): void {
    const roomData = this.selectedRoom();
    if (!roomData) return;

    this.isSubmitting.set(true);
    this.bookingError.set(null);

    const [firstName, ...lastNameParts] = this.guestName().split(' ');

    this.bookingsApi.confirm({
      roomId: roomData.room.id,
      guestFirstName: firstName,
      guestLastName: lastNameParts.join(' ') || ' ',
      guestEmail: this.guestEmail(),
      checkInDate: this.checkIn(),
      checkOutDate: this.checkOut(),
      specialRequests: this.specialRequests(),
    }).subscribe({
      next: (booking) => {
        this.stripeApi.createCheckoutSession({
          bookingId: booking.id,
          description: `Réservation chambre ${roomData.room.roomNumber} - ${this.checkIn()} au ${this.checkOut()}`
        }).subscribe({
          next: (session) => {
            window.location.href = session.url;
          },
          error: () => {
            this.bookingError.set('Réservation créée mais erreur lors de l\'initialisation du paiement.');
            this.isSubmitting.set(false);
          }
        });
      },
      error: () => {
        this.bookingError.set('Erreur lors de la confirmation de réservation.');
        this.isSubmitting.set(false);
      }
    });
  }

  /**
   * Vérifie si le formulaire est valide pour la confirmation.
   */
  canConfirm(): boolean {
    return !!this.guestName() && !!this.guestEmail() && this.guestEmail().includes('@');
  }

  protected getRoomLabel(room: Room): string {
    return getRoomLabel(room);
  }

  protected getRoomImage(room: Room): string {
    return getRoomImage(room);
  }

  protected roomDetailsQueryParams(): { checkIn?: string; checkOut?: string; guests?: number } {
    return {
      checkIn: this.checkIn() || undefined,
      checkOut: this.checkOut() || undefined,
      guests: this.guests() || undefined,
    };
  }
}
