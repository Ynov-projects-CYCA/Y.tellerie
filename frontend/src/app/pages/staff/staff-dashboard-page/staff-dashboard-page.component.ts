import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Booking,
  BookingsApiService,
  BookingStatus,
  getRoomLabel,
  getRoomStatusLabel,
  Room,
  RoomsApiService,
  RoomStatus,
} from '@core';
import { DataTableModalComponent, TableAction, TableColumn, TableConfig } from '../../../shared/components/data-table-modal/data-table-modal.component';
import {
  mockEmployees,
  currentUser,
  Employee,
  EmployeeStatus
} from '../../../data/mockData';

interface ReservationSummary {
  guestName: string;
  roomNumber: string;
  totalPrice: number;
  checkInDate: string;
}

interface RoomTableRow {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  price: number;
  status: RoomStatus;
  statusLabel: string;
  raw: Room;
}

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
  selector: 'app-staff-dashboard-page',
  standalone: true,
  imports: [CommonModule, DataTableModalComponent],
  templateUrl: './staff-dashboard-page.component.html',
  styleUrls: ['./staff-dashboard-page.component.scss']
})
export class StaffDashboardPageComponent implements OnInit {
  private readonly roomsApi = inject(RoomsApiService);
  private readonly bookingsApi = inject(BookingsApiService);

  availableRooms = 0;
  occupiedRooms = 0;
  activeReservations = 0;
  totalRevenue = 0;
  occupancyRate = 0;

  rooms: Room[] = [];
  reservations: Booking[] = [];
  employees: Employee[] = [...mockEmployees];
  currentUser = currentUser;

  isModalOpen = false;
  activeModal: 'reservations' | 'rooms' | 'admin' | null = null;
  modalConfig!: TableConfig;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get reservationSummaries(): ReservationSummary[] {
    return this.reservations.map((reservation) => ({
      guestName: `${reservation.guestFirstName} ${reservation.guestLastName}`.trim(),
      roomNumber: reservation.room.roomNumber,
      totalPrice: reservation.totalPrice,
      checkInDate: reservation.checkInDate,
    }));
  }

  calculateStats(): void {
    this.availableRooms = this.rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
    this.occupiedRooms = this.rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
    this.activeReservations = this.reservations.filter(r => r.status === BookingStatus.CONFIRMED).length;
    this.totalRevenue = this.reservations
      .filter(r => r.status === BookingStatus.CONFIRMED)
      .reduce((sum, r) => sum + r.totalPrice, 0);
    this.occupancyRate = this.rooms.length
      ? Math.round((this.occupiedRooms / this.rooms.length) * 100)
      : 0;
  }

  getActiveEmployees(): Employee[] {
    return this.employees.filter(e => e.status === 'active').slice(0, 3);
  }

  getPendingReservations(): number {
    return this.reservations.filter(r => r.status === BookingStatus.PENDING_PAYMENT).length;
  }

  openReservationsModal(): void {
    this.activeModal = 'reservations';
    this.modalConfig = {
      title: 'Tableau des réservations',
      subtitle: 'Vue globale réservée au personnel',
      columns: this.getReservationColumns(),
      actions: [
        {
          label: 'Annuler',
          action: 'cancel',
          color: 'danger',
          condition: (item: ReservationTableRow) =>
            ![BookingStatus.CANCELED, BookingStatus.REFUNDED].includes(item.status),
        },
      ],
      data: this.toReservationRows(),
      emptyMessage: 'Aucune réservation trouvée',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  openRoomsModal(): void {
    this.activeModal = 'rooms';
    this.modalConfig = {
      title: 'Tableau des chambres',
      subtitle: 'Gère le statut des chambres',
      columns: this.getRoomColumns(),
      actions: [
        {
          label: 'Disponible',
          action: 'available',
          color: 'success',
          condition: (item: RoomTableRow) => item.status !== RoomStatus.AVAILABLE,
        },
        {
          label: 'Occupée',
          action: 'occupied',
          color: 'danger',
          condition: (item: RoomTableRow) => item.status !== RoomStatus.OCCUPIED,
        },
        {
          label: 'Nettoyée',
          action: 'clean',
          color: 'secondary',
          condition: (item: RoomTableRow) => item.status === RoomStatus.DIRTY,
        },
      ],
      data: this.toRoomRows(),
      emptyMessage: 'Aucune chambre disponible',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  openAdminModal(): void {
    this.activeModal = 'admin';
    this.modalConfig = {
      title: 'Tableau du personnel',
      subtitle: 'Gère le personnel directement depuis le dashboard',
      columns: [
        { key: 'id', label: 'ID', width: '80px', sortable: true },
        { key: 'name', label: 'Nom', sortable: true },
        { key: 'role', label: 'Rôle', sortable: true },
        { key: 'shift', label: 'Shift', sortable: true },
        { key: 'status', label: 'Statut', type: 'status', sortable: true }
      ],
      actions: [
        {
          label: 'Activer',
          action: 'activate',
          color: 'success',
          condition: (item: Employee) => item.status === 'inactive'
        },
        {
          label: 'Désactiver',
          action: 'deactivate',
          color: 'secondary',
          condition: (item: Employee) => item.status === 'active'
        },
        {
          label: 'Supprimer',
          action: 'delete',
          color: 'danger'
        }
      ],
      data: this.employees,
      emptyMessage: 'Aucun employé trouvé',
      useDropdownForActions: true
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.activeModal = null;
  }

  onModalAction(event: { action: string; item: RoomTableRow | ReservationTableRow | Employee }): void {
    if (this.activeModal === 'reservations') {
      this.handleReservationAction(event.action, event.item as ReservationTableRow);
    }

    if (this.activeModal === 'rooms') {
      this.handleRoomAction(event.action, event.item as RoomTableRow);
    }

    if (this.activeModal === 'admin') {
      this.handleAdminAction(event.action, event.item as Employee);
    }
  }

  private loadDashboardData(): void {
    this.roomsApi.findAll().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.calculateStats();
      },
    });

    this.bookingsApi.findAllForStaff().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.calculateStats();
      },
    });
  }

  private handleReservationAction(action: string, item: ReservationTableRow): void {
    if (action !== 'cancel') {
      return;
    }

    this.bookingsApi.cancel(item.raw.id).subscribe({
      next: () => this.reloadReservations(),
    });
  }

  private handleRoomAction(action: string, item: RoomTableRow): void {
    if (action === 'available') {
      this.roomsApi.update(item.raw.id, { status: RoomStatus.AVAILABLE }).subscribe({
        next: () => this.reloadRooms(),
      });
    }

    if (action === 'occupied') {
      this.roomsApi.checkin(item.raw.id).subscribe({
        next: () => this.reloadRooms(),
      });
    }

    if (action === 'clean') {
      this.roomsApi.clean(item.raw.id).subscribe({
        next: () => this.reloadRooms(),
      });
    }
  }

  private handleAdminAction(action: string, item: Employee): void {
    switch (action) {
      case 'activate':
        this.toggleEmployeeStatus(item.id, 'active');
        break;
      case 'deactivate':
        this.toggleEmployeeStatus(item.id, 'inactive');
        break;
      case 'delete':
        this.deleteEmployee(item.id);
        break;
    }

    this.openAdminModal();
  }

  private reloadRooms(): void {
    this.roomsApi.findAll().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.calculateStats();
        if (this.isModalOpen && this.activeModal === 'rooms') {
          this.openRoomsModal();
        }
      },
    });
  }

  private reloadReservations(): void {
    this.bookingsApi.findAllForStaff().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.calculateStats();
        if (this.isModalOpen && this.activeModal === 'reservations') {
          this.openReservationsModal();
        }
      },
    });
  }

  private getRoomColumns(): TableColumn[] {
    return [
      { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'capacity', label: 'Capacité', width: '100px', sortable: true },
      { key: 'price', label: 'Prix', type: 'currency', sortable: true },
      { key: 'statusLabel', label: 'Statut', type: 'status', sortable: true }
    ];
  }

  private getReservationColumns(): TableColumn[] {
    return [
      { key: 'id', label: 'ID', width: '110px', sortable: true },
      { key: 'guestName', label: 'Client', sortable: true },
      { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
      { key: 'checkInDate', label: 'Arrivée', type: 'date', sortable: true },
      { key: 'totalPrice', label: 'Prix', type: 'currency', sortable: true },
      { key: 'statusLabel', label: 'Statut', type: 'status', sortable: true }
    ];
  }

  private toRoomRows(): RoomTableRow[] {
    return this.rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      type: getRoomLabel(room),
      capacity: room.capacity,
      price: room.price,
      status: room.status,
      statusLabel: getRoomStatusLabel(room.status),
      raw: room,
    }));
  }

  private toReservationRows(): ReservationTableRow[] {
    return this.reservations.map((reservation) => ({
      id: reservation.id.slice(0, 8).toUpperCase(),
      guestName: `${reservation.guestFirstName} ${reservation.guestLastName}`.trim(),
      roomNumber: reservation.room.roomNumber,
      checkInDate: reservation.checkInDate,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      statusLabel: this.getReservationStatusLabel(reservation.status),
      raw: reservation,
    }));
  }

  private getReservationStatusLabel(status: BookingStatus): string {
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

  private toggleEmployeeStatus(id: number, status: EmployeeStatus): void {
    this.employees = this.employees.map(employee =>
      employee.id === id ? { ...employee, status } : employee
    );
  }

  private deleteEmployee(id: number): void {
    this.employees = this.employees.filter(employee => employee.id !== id);
  }
}
