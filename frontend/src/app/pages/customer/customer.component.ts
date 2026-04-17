import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideSearch,
  LucideCalendar,
  LucideUsers,
  LucideCheckCircle,
  LucideX,
  LucideStar,
  LucideMapPin,
  LucideWifi,
  LucideTv,
  LucideWind,
  LucideCoffee,
  LucideSunrise,
  LucideSparkles,
} from '@lucide/angular';
import { ButtonComponent } from '../../shared/components/button.component';
import { CardComponent } from '../../shared/components/card.component';

export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  floor: number;
  image: string;
}

const ROOM_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  '2': 'https://images.unsplash.com/photo-1670800050441-e77f8c82963f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  '3': 'https://images.unsplash.com/photo-1685592437742-3b56edb46b15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  '4': 'https://images.unsplash.com/photo-1765852550350-be1815fe67ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  '5': 'https://images.unsplash.com/photo-1670852767079-e4b234abdb4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  '6': 'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
};

const ALL_ROOMS: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'Chambre Simple',
    capacity: 1,
    price: 89,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Climatisation'],
    floor: 1,
    image: ROOM_IMAGES['1'],
  },
  {
    id: '2',
    number: '102',
    type: 'Chambre Double',
    capacity: 2,
    price: 129,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Mini-bar'],
    floor: 1,
    image: ROOM_IMAGES['2'],
  },
  {
    id: '3',
    number: '201',
    type: 'Suite Junior',
    capacity: 3,
    price: 199,
    status: 'occupied',
    amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Mini-bar', 'Balcon'],
    floor: 2,
    image: ROOM_IMAGES['3'],
  },
  {
    id: '4',
    number: '202',
    type: 'Chambre Familiale',
    capacity: 4,
    price: 179,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Espace salon'],
    floor: 2,
    image: ROOM_IMAGES['4'],
  },
  {
    id: '5',
    number: '301',
    type: 'Suite Deluxe',
    capacity: 2,
    price: 299,
    status: 'available',
    amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Mini-bar', 'Balcon', 'Jacuzzi'],
    floor: 3,
    image: ROOM_IMAGES['5'],
  },
  {
    id: '6',
    number: '302',
    type: 'Chambre Double',
    capacity: 2,
    price: 129,
    status: 'maintenance',
    amenities: ['Wi-Fi', 'TV', 'Climatisation', 'Mini-bar'],
    floor: 3,
    image: ROOM_IMAGES['6'],
  },
];

// Rooms the logged-in client has previously booked
const PREVIOUSLY_BOOKED_IDS = new Set(['2', '5', '4']);

@Component({
  selector: 'app-client-booking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    LucideSearch,
    LucideCalendar,
    LucideUsers,
    LucideCheckCircle,
    LucideX,
    LucideStar,
    LucideMapPin,
    LucideWifi,
    LucideTv,
    LucideWind,
    LucideCoffee,
    LucideSunrise,
    LucideSparkles,
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss',
})
export class CustomerComponent {
  // ── Search state ────────────────────────────────────────
  checkIn  = signal('');
  checkOut = signal('');
  guests   = signal(2);

  today = new Date().toISOString().split('T')[0];

  // ── Rooms state ─────────────────────────────────────────
  rooms = signal<Room[]>(ALL_ROOMS);

  filteredRooms = computed(() => this.rooms());

  hasSearched = signal(false);

  // ── Dialog state ─────────────────────────────────────────
  dialogOpen    = signal(false);
  selectedRoom  = signal<Room | null>(null);
  guestName     = signal('');
  guestEmail    = signal('');
  bookingSuccess = signal(false);

  // ── Derived ──────────────────────────────────────────────
  totalNights = computed(() => {
    const ci = this.checkIn();
    const co = this.checkOut();
    if (!ci || !co) return 0;
    const diff = new Date(co).getTime() - new Date(ci).getTime();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  });

  totalPrice = computed(() => {
    const room = this.selectedRoom();
    if (!room) return 0;
    return room.price * this.totalNights();
  });

  canConfirm = computed(() =>
    !!this.guestName().trim() &&
    !!this.guestEmail().trim() &&
    !!this.checkIn() &&
    !!this.checkOut() &&
    this.totalNights() > 0
  );

  // ── Methods ──────────────────────────────────────────────
  handleSearch(): void {
    const g = this.guests();
    this.rooms.set(
      ALL_ROOMS.filter(
        (r) => r.status === 'available' && r.capacity >= g
      )
    );
    this.hasSearched.set(true);
  }

  hasBookedBefore(roomId: string): boolean {
    return PREVIOUSLY_BOOKED_IDS.has(roomId);
  }

  openDialog(room: Room): void {
    this.selectedRoom.set(room);
    this.guestName.set('');
    this.guestEmail.set('');
    this.bookingSuccess.set(false);
    this.dialogOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.selectedRoom.set(null);
    this.bookingSuccess.set(false);
    document.body.style.overflow = '';
  }

  confirmBooking(): void {
    if (!this.canConfirm()) return;
    this.bookingSuccess.set(true);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeDialog();
    }
  }

  // ── Amenity icon helper ──────────────────────────────────
  amenityIcon(amenity: string): string {
    const map: Record<string, string> = {
      'Wi-Fi': 'wifi',
      'TV': 'tv',
      'Climatisation': 'wind',
      'Mini-bar': 'coffee',
      'Balcon': 'sunrise',
      'Jacuzzi': 'sparkles',
      'Espace salon': 'sparkles',
    };
    return map[amenity] ?? 'sparkles';
  }

  statusLabel(status: Room['status']): string {
    return status === 'available' ? 'Disponible'
      : status === 'occupied'  ? 'Occupée'
        : 'Maintenance';
  }
}
