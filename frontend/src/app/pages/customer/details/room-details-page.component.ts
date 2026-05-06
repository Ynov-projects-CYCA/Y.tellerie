import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCalendar,
  LucideCheckCircle,
  LucideInfo,
  LucideShieldCheck,
  LucideSparkles,
  LucideUsers,
} from '@lucide/angular';
import {
  AuthSessionService,
  BookingsApiService,
  getRoomImage,
  getRoomLabel,
  Room,
  RoomsApiService,
  StripeApiService,
} from '@core';
import { BadgeComponent, ButtonComponent, CardComponent, DialogComponent } from '@shared';

@Component({
  selector: 'app-room-details-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    DialogComponent,
    LucideArrowLeft,
    LucideCalendar,
    LucideCheckCircle,
    LucideInfo,
    LucideShieldCheck,
    LucideSparkles,
    LucideUsers,
  ],
  templateUrl: './room-details-page.component.html',
  styleUrl: './room-details-page.component.scss',
})
export class RoomDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly roomsApi = inject(RoomsApiService);
  private readonly bookingsApi = inject(BookingsApiService);
  private readonly stripeApi = inject(StripeApiService);

  protected readonly today = new Date().toISOString().split('T')[0];

  protected readonly room = signal<Room | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  protected readonly checkIn = signal('');
  protected readonly checkOut = signal('');
  protected readonly guests = signal(1);
  protected readonly dateDialogOpen = signal(false);
  protected readonly dateSelectionError = signal<string | null>(null);

  protected readonly dialogOpen = signal(false);
  protected readonly guestName = signal('');
  protected readonly guestEmail = signal('');
  protected readonly specialRequests = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly bookingError = signal<string | null>(null);

  protected readonly hasBookingContext = computed(
    () => Boolean(this.checkIn() && this.checkOut()),
  );

  protected readonly nightCount = computed(() => {
    const checkIn = this.checkIn();
    const checkOut = this.checkOut();

    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();

    if (Number.isNaN(diff) || diff <= 0) {
      return 0;
    }

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  protected readonly estimatedTotal = computed(() => {
    const room = this.room();
    if (!room) {
      return 0;
    }

    const nights = this.nightCount();
    return nights > 0 ? nights * room.price : room.price;
  });

  protected readonly roomDescription = computed(() => {
    const room = this.room();
    if (!room) {
      return '';
    }

    return this.getRoomDescription(room);
  });

  protected readonly roomHighlights = computed(() => {
    const room = this.room();
    if (!room) {
      return [];
    }

    return this.getRoomHighlights(room);
  });

  protected readonly roomAmenities = computed(() => {
    const room = this.room();
    if (!room) {
      return [];
    }

    if (room.amenities?.length) {
      return room.amenities;
    }

    return this.getDefaultAmenities(room);
  });

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    this.prefillGuestIdentity();

    this.checkIn.set(this.route.snapshot.queryParamMap.get('checkIn') ?? '');
    this.checkOut.set(this.route.snapshot.queryParamMap.get('checkOut') ?? '');

    const guestsParam = Number(this.route.snapshot.queryParamMap.get('guests') ?? '1');
    this.guests.set(Number.isFinite(guestsParam) && guestsParam > 0 ? guestsParam : 1);

    if (!roomId) {
      this.loadError.set('Cette chambre est introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.roomsApi.findOne(roomId).subscribe({
      next: (room) => {
        this.room.set(room);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Impossible de charger les détails de cette chambre pour le moment.');
        this.isLoading.set(false);
      },
    });
  }

  protected getRoomLabel(room: Room): string {
    return getRoomLabel(room);
  }

  protected getImageUrl(room: Room): string {
    return getRoomImage(room, 'hero');
  }

  protected openDialog(): void {
    if (!this.hasBookingContext()) {
      return;
    }

    this.prefillGuestIdentity();
    this.bookingError.set(null);
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.dialogOpen.set(false);
    this.bookingError.set(null);
  }

  protected openDateDialog(): void {
    this.dateSelectionError.set(null);
    this.dateDialogOpen.set(true);
  }

  protected closeDateDialog(): void {
    this.dateDialogOpen.set(false);
    this.dateSelectionError.set(null);
  }

  protected async applyDateSelection(): Promise<void> {
    if (!this.checkIn() || !this.checkOut()) {
      this.dateSelectionError.set('Veuillez renseigner vos dates d arrivee et de depart.');
      return;
    }

    if (this.nightCount() <= 0) {
      this.dateSelectionError.set("La date de depart doit etre posterieure a la date d'arrivee.");
      return;
    }

    if (this.guests() < 1) {
      this.dateSelectionError.set('Le nombre de voyageurs doit etre superieur a zero.');
      return;
    }

    const room = this.room();
    if (room && this.guests() > room.capacity) {
      this.dateSelectionError.set(
        `Cette chambre peut accueillir jusqu'a ${room.capacity} personne${room.capacity > 1 ? 's' : ''}.`,
      );
      return;
    }

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        guests: this.guests(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    this.closeDateDialog();
  }

  protected canConfirm(): boolean {
    return !!this.guestName() && !!this.guestEmail() && this.guestEmail().includes('@');
  }

  protected confirmBooking(): void {
    const room = this.room();
    if (!room || !this.hasBookingContext()) {
      return;
    }

    this.isSubmitting.set(true);
    this.bookingError.set(null);

    const [firstName, ...lastNameParts] = this.guestName().trim().split(' ');

    this.bookingsApi
      .confirm({
        roomId: room.id,
        guestFirstName: firstName,
        guestLastName: lastNameParts.join(' ') || ' ',
        guestEmail: this.guestEmail(),
        checkInDate: this.checkIn(),
        checkOutDate: this.checkOut(),
        specialRequests: this.specialRequests(),
      })
      .subscribe({
        next: (booking) => {
          this.stripeApi
            .createCheckoutSession({
              bookingId: booking.id,
              description: `Reservation chambre ${room.roomNumber} - ${this.checkIn()} au ${this.checkOut()}`,
            })
            .subscribe({
              next: (session) => {
                window.location.href = session.url;
              },
              error: () => {
                this.bookingError.set(
                  "Reservation creee mais erreur lors de l'initialisation du paiement.",
                );
                this.isSubmitting.set(false);
              },
            });
        },
        error: () => {
          this.bookingError.set('Erreur lors de la confirmation de reservation.');
          this.isSubmitting.set(false);
        },
      });
  }

  private getRoomDescription(room: Room): string {
    const descriptions = {
      SIMPLE:
        "Un cocon lumineux pense pour les sejours courts, avec une atmosphère calme et un confort immediat.",
      DOUBLE:
        "Une chambre elegante et genereuse, ideale pour un duo recherchant espace, serenite et finition soignee.",
      SUITE:
        "Notre interpretation d'un sejour premium, avec une mise en scene plus ample et une experience plus exclusive.",
    } as const;

    return descriptions[room.type] ?? descriptions.DOUBLE;
  }

  private getRoomHighlights(room: Room): string[] {
    const highlightsByType = {
      SIMPLE: ['Ambiance feutree', 'Literie premium', 'Parfait pour une escapade urbaine'],
      DOUBLE: ['Volume plus confortable', 'Ideal pour deux voyageurs', 'Equilibre entre charme et fonctionnalite'],
      SUITE: ['Experience signature', 'Espace de detente raffine', 'Concue pour un sejour memorable'],
    } as const;

    return [...(highlightsByType[room.type] ?? highlightsByType.DOUBLE)];
  }

  private getDefaultAmenities(room: Room): string[] {
    const amenitiesByType = {
      SIMPLE: ['Wi-Fi haut debit', 'Salle de bain privative', 'Climatisation', 'Petit-dejeuner disponible'],
      DOUBLE: ['Wi-Fi haut debit', 'Lit queen size', 'Salle de bain privative', 'Coin bureau', 'Climatisation'],
      SUITE: ['Wi-Fi haut debit', 'Espace salon', 'Literie premium', 'Salle de bain privative', 'Service prioritaire'],
    } as const;

    return [...(amenitiesByType[room.type] ?? amenitiesByType.DOUBLE)];
  }

  private prefillGuestIdentity(): void {
    const currentUser = this.authSessionService.currentUser();
    if (!currentUser) {
      return;
    }

    if (!this.guestName().trim()) {
      this.guestName.set(`${currentUser.firstname} ${currentUser.lastname}`.trim());
    }

    if (!this.guestEmail().trim()) {
      this.guestEmail.set(currentUser.email);
    }
  }
}
