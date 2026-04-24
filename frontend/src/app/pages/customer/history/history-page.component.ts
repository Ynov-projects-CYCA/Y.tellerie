import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideCalendar,
  LucideCheckCircle,
  LucideXCircle,
  LucideClock,
  LucideMapPin,
  LucideChevronRight,
  LucideInfo,
  LucideUser,
  LucideMail,
  LucideDownload,
  LucideAlertTriangle
} from '@lucide/angular';
import { Observable } from 'rxjs';
import {CardComponent} from '../../../shared/components/card.component';
import {BadgeComponent} from '../../../shared/components/badge.component';
import {DialogComponent} from '../../../shared/components/dialog.component';
import {ButtonComponent} from '../../../shared/components/button.component';
import {BookingsApiService} from '../../../core/api/bookings-api.service';
import {StripeApiService} from '../../../core/api/stripe-api.service';
import {Booking, BookingStatus} from '../../../core/api/models/booking.model';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    BadgeComponent,
    DialogComponent,
    ButtonComponent,
    LucideCalendar,
    LucideCheckCircle,
    LucideXCircle,
    LucideClock,
    LucideMapPin,
    LucideChevronRight,
    LucideInfo,
    LucideUser,
    LucideMail,
    LucideDownload,
    LucideAlertTriangle
  ],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent implements OnInit {
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly stripeApi = inject(StripeApiService);

  bookings$!: Observable<Booking[]>;
  selectedBooking = signal<Booking | null>(null);
  isModalOpen = signal(false);
  isPaying = signal(false);
  isCancelling = signal<string | null>(null);

  // Nouvelles modales
  showCancelConfirm = signal(false);
  bookingToCancel = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.bookings$ = this.bookingsApi.findAll();
  }

  /**
   * Relance le paiement pour une réservation en attente.
   */
  retryPayment(booking: Booking): void {
    if (this.isPaying() || this.isCancelling()) return;

    this.isPaying.set(true);
    this.stripeApi.createCheckoutSession({
      bookingId: booking.id,
      description: `Paiement réservation chambre ${booking.room.roomNumber}`
    }).subscribe({
      next: (session) => {
        window.location.href = session.url;
      },
      error: () => {
        this.isPaying.set(false);
        this.errorMessage.set('Erreur lors du lancement du paiement. Veuillez réessayer plus tard.');
      }
    });
  }

  /**
   * Ouvre la modale de confirmation d'annulation.
   */
  openCancelModal(bookingId: string): void {
    if (this.isPaying() || this.isCancelling()) return;
    this.bookingToCancel.set(bookingId);
    this.showCancelConfirm.set(true);
  }

  /**
   * Ferme la modale de confirmation d'annulation.
   */
  closeCancelModal(): void {
    this.showCancelConfirm.set(false);
    this.bookingToCancel.set(null);
  }

  /**
   * Confirme l'annulation après validation dans la modale.
   */
  confirmCancel(): void {
    const bookingId = this.bookingToCancel();
    if (!bookingId) return;

    this.showCancelConfirm.set(false);
    this.isCancelling.set(bookingId);

    this.bookingsApi.cancel(bookingId).subscribe({
      next: () => {
        this.isCancelling.set(null);
        this.bookingToCancel.set(null);
        this.loadBookings();
      },
      error: () => {
        this.isCancelling.set(null);
        this.bookingToCancel.set(null);
        this.errorMessage.set('Une erreur est survenue lors de l\'annulation de la réservation.');
      }
    });
  }

  /**
   * Ferme la modale d'erreur.
   */
  closeErrorModal(): void {
    this.errorMessage.set(null);
  }

  /**
   * Retourne le libellé formaté pour le statut de réservation.
   */
  getStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
      [BookingStatus.CONFIRMED]: 'Confirmée',
      [BookingStatus.PENDING_PAYMENT]: 'En attente',
      [BookingStatus.PAYMENT_FAILED]: 'Échouée',
      [BookingStatus.CANCELED]: 'Annulée'
    };
    return labels[status] || status;
  }

  /**
   * Retourne le variant du badge correspondant au statut.
   */
  getStatusVariant(status: BookingStatus): 'success' | 'warning' | 'danger' | 'neutral' {
    const variants: Record<BookingStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
      [BookingStatus.CONFIRMED]: 'success',
      [BookingStatus.PENDING_PAYMENT]: 'warning',
      [BookingStatus.PAYMENT_FAILED]: 'danger',
      [BookingStatus.CANCELED]: 'danger'
    };
    return variants[status] || 'neutral';
  }

  /**
   * Ouvre la modale de détails d'une réservation.
   */
  openDetails(booking: Booking): void {
    this.selectedBooking.set(booking);
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Ferme la modale de détails.
   */
  closeDetails(): void {
    this.isModalOpen.set(false);
    this.selectedBooking.set(null);
    document.body.style.overflow = 'auto';
  }

  /**
   * Déclenche l'impression de la facture.
   */
  printInvoice(): void {
    window.print();
  }
}
