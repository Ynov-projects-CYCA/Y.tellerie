import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomsApiService, BookingsApiService, UsersApiService, Room, Booking, User, RoomStatus, BookingStatus } from '../../../core/api';
import { AuthSessionService } from '@core';

@Component({
  selector: 'app-staff-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './staff-dashboard-page.component.html',
  styleUrls: ['./staff-dashboard-page.component.scss']
})
export class StaffDashboardPageComponent implements OnInit {
  private roomsApi = inject(RoomsApiService);
  private bookingsApi = inject(BookingsApiService);
  private usersApi = inject(UsersApiService);
  private authSession = inject(AuthSessionService);

  availableRooms = 0;
  occupiedRooms = 0;
  activeReservations = 0;
  totalRevenue = 0;
  occupancyRate = 0;

  rooms: Room[] = [];
  reservations: Booking[] = [];
  employees: User[] = [];
  currentUser = this.authSession.currentUser();

  isLoading = false;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    let loadCount = 0;
    const totalToLoad = 3;

    // Charger les chambres
    this.roomsApi.findAll().subscribe({
      next: (rooms: Room[]) => {
        this.rooms = rooms;
        loadCount++;
        if (loadCount === totalToLoad) {
          this.calculateStats();
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des chambres:', err);
        loadCount++;
        if (loadCount === totalToLoad) this.isLoading = false;
      }
    });

    // Charger les réservations
    this.bookingsApi.findAll().subscribe({
      next: (bookings: Booking[]) => {
        this.reservations = bookings;
        loadCount++;
        if (loadCount === totalToLoad) {
          this.calculateStats();
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des réservations:', err);
        loadCount++;
        if (loadCount === totalToLoad) this.isLoading = false;
      }
    });

    // Charger les employés
    this.usersApi.findAll().subscribe({
      next: (users: User[]) => {
        this.employees = users.filter(
          (u) => u.roles.includes('personnel') || u.roles.includes('admin'),
        );
        loadCount++;
        if (loadCount === totalToLoad) {
          this.calculateStats();
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des employés:', err);
        loadCount++;
        if (loadCount === totalToLoad) this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.availableRooms = this.rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
    this.occupiedRooms = this.rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
    this.activeReservations = this.reservations.filter(r => r.status === BookingStatus.CONFIRMED).length;
    this.totalRevenue = this.reservations
      .filter(r => r.status === BookingStatus.CONFIRMED || r.status === BookingStatus.REFUNDED)
      .reduce((sum, r) => sum + (r.room?.price || 0), 0);
    this.occupancyRate = this.rooms.length > 0 ? Math.round((this.occupiedRooms / this.rooms.length) * 100) : 0;
  }

  getActiveEmployees() {
    return this.employees.filter((e) => e.isActive).slice(0, 3);
  }

  getPendingReservations() {
    return this.reservations.filter(r => r.status === BookingStatus.PENDING_PAYMENT).length;
  }
}
