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
  LucideDownload
} from '@lucide/angular';
import { Observable } from 'rxjs';
import {CardComponent} from '../../../shared/components/card.component';
import {BadgeComponent} from '../../../shared/components/badge.component';
import {DialogComponent} from '../../../shared/components/dialog.component';
import {ButtonComponent} from '../../../shared/components/button.component';
import {BookingsApiService} from '../../../core/api/bookings-api.service';
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
    LucideDownload
  ],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent implements OnInit {
  private readonly bookingsApi = inject(BookingsApiService);

  bookings$!: Observable<Booking[]>;
  selectedBooking = signal<Booking | null>(null);
  isModalOpen = signal(false);

  ngOnInit(): void {
    this.bookings$ = this.bookingsApi.findAll();
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
