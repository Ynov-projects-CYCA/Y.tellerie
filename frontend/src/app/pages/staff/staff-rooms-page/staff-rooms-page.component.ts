import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsApiService, Room, RoomStatus, RoomType } from '../../../core/api';
import {
  GenericDataTableComponent,
  GenericTableAction,
  GenericTableColumn
} from '../../../shared/components/generic-data-table/generic-data-table.component';

@Component({
  selector: 'app-staff-rooms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericDataTableComponent],
  templateUrl: './staff-rooms-page.component.html',
  styleUrls: ['./staff-rooms-page.component.scss']
})
export class StaffRoomsPageComponent implements OnInit {
  private roomsApi = inject(RoomsApiService);
  readonly RoomStatus = RoomStatus;
  readonly RoomType = RoomType;
  
  rooms: Room[] = [];
  isAddDialogOpen = false;
  isLoading = false;
  isSaving = false;
  addRoomError = '';

  newRoom = this.getInitialRoomForm();

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomsApi.findAll().subscribe({
      next: (rooms: Room[]) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des chambres:', err);
        this.isLoading = false;
      }
    });
  }

  get availableCount(): number {
    return this.rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  }

  get occupiedCount(): number {
    return this.rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  }

  openAddDialog(): void {
    this.addRoomError = '';
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.isSaving = false;
    this.addRoomError = '';
    this.newRoom = this.getInitialRoomForm();
  }

  addRoom(): void {
    this.addRoomError = '';

    const roomPayload = {
      ...this.newRoom,
      roomNumber: this.newRoom.roomNumber.trim(),
      capacity: Number(this.newRoom.capacity),
      price: Number(this.newRoom.price),
      currency: this.newRoom.currency.trim().toUpperCase() || 'EUR'
    };

    if (!roomPayload.roomNumber || roomPayload.capacity < 1 || roomPayload.price < 0) {
      this.addRoomError = 'Veuillez renseigner un numéro, une capacité et un prix valides.';
      return;
    }

    this.isSaving = true;
    this.roomsApi.create(roomPayload).subscribe({
      next: (room: Room) => {
        this.rooms = [...this.rooms, room];
        this.closeAddDialog();
        this.loadRooms();
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout de la chambre:', err);
        this.addRoomError = err?.message ?? 'Impossible d\'ajouter la chambre pour le moment.';
        this.isSaving = false;
      }
    });
  }

  deleteRoom(id: string): void {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      this.roomsApi.delete(id).subscribe({
        next: () => this.loadRooms(),
        error: (err: any) => console.error('Erreur lors de la suppression de la chambre:', err)
      });
    }
  }

  updateRoomStatus(id: string, status: RoomStatus): void {
    this.roomsApi.update(id, { status }).subscribe({
      next: () => this.loadRooms(),
      error: (err: any) => console.error('Erreur lors de la mise à jour de la chambre:', err)
    });
  }

  getStatusLabel(status: RoomStatus): string {
    return status === RoomStatus.AVAILABLE ? 'Disponible' : 'Occupée';
  }

  getStatusClass(status: RoomStatus): string {
    return status === RoomStatus.AVAILABLE ? 'badge badge--success' : 'badge badge--danger';
  }

  get tableRooms() {
    return this.rooms;
  }

  roomColumns: GenericTableColumn<Room>[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'roomNumber', label: 'Chambre' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacité', type: 'number' },
    { key: 'price', label: 'Prix', type: 'currency' },
    { key: 'status', label: 'Statut', type: 'status' }
  ];

  roomActions: GenericTableAction<Room>[] = [
    {
      label: 'Disponible',
      action: 'available',
      color: 'success',
      condition: row => row.status !== RoomStatus.AVAILABLE
    },
    {
      label: 'Occupée',
      action: 'occupied',
      color: 'danger',
      condition: row => row.status !== RoomStatus.OCCUPIED
    },
    {
      label: 'Supprimer',
      action: 'delete',
      color: 'danger'
    }
  ];

  onTableAction(event: { action: string; row: Room }): void {
    if (event.action === 'available') {
      this.updateRoomStatus(event.row.id, RoomStatus.AVAILABLE);
    }

    if (event.action === 'occupied') {
      this.updateRoomStatus(event.row.id, RoomStatus.OCCUPIED);
    }

    if (event.action === 'delete') {
      this.deleteRoom(event.row.id);
    }
  }

  private getInitialRoomForm(): {
    roomNumber: string;
    type: RoomType;
    capacity: number;
    price: number;
    currency: string;
  } {
    return {
      roomNumber: '',
      type: RoomType.SIMPLE,
      capacity: 1,
      price: 0,
      currency: 'EUR'
    };
  }
}
