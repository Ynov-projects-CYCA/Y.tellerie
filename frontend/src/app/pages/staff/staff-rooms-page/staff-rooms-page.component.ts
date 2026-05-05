import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsApiService, Room, RoomStatus, RoomType } from '../../../core/api';
import {
  GenericDataTableComponent,
  GenericTableAction,
  GenericTableColumn
} from '../../../shared/components/generic-data-table/generic-data-table.component';

type RoomForm = {
  roomNumber: string;
  type: RoomType;
  capacity: number;
  price: number;
  currency: string;
};

@Component({
  selector: 'app-staff-rooms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GenericDataTableComponent],
  templateUrl: './staff-rooms-page.component.html',
  styleUrls: ['./staff-rooms-page.component.scss']
})
export class StaffRoomsPageComponent implements OnInit {
  private roomsApi = inject(RoomsApiService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  readonly RoomStatus = RoomStatus;
  readonly RoomType = RoomType;
  
  rooms = signal<Room[]>([]);
  isAddDialogOpen = false;
  isLoading = signal(false);
  isSaving = false;
  addRoomError = '';
  editingRoomId: string | null = null;

  newRoom = this.getInitialRoomForm();

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.roomsApi.findAll().subscribe({
      next: (rooms: Room[]) => {
        this.rooms.set([...rooms]);
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des chambres:', err);
        this.isLoading.set(false);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  get availableCount(): number {
    return this.rooms().filter(r => r.status === RoomStatus.AVAILABLE).length;
  }

  get occupiedCount(): number {
    return this.rooms().filter(r => r.status === RoomStatus.OCCUPIED).length;
  }

  openAddDialog(): void {
    this.editingRoomId = null;
    this.newRoom = this.getInitialRoomForm();
    this.addRoomError = '';
    this.isAddDialogOpen = true;
  }

  openEditDialog(room: Room): void {
    this.editingRoomId = room.id;
    this.newRoom = {
      roomNumber: room.roomNumber,
      type: room.type,
      capacity: room.capacity,
      price: Number(room.price),
      currency: room.currency
    };
    this.addRoomError = '';
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.isSaving = false;
    this.addRoomError = '';
    this.editingRoomId = null;
    this.newRoom = this.getInitialRoomForm();
  }

  saveRoom(): void {
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
    if (this.editingRoomId) {
      this.roomsApi.update(this.editingRoomId, roomPayload).subscribe({
        next: (room: Room) => {
          this.rooms.set(this.rooms().map(current => current.id === room.id ? room : current));
          this.closeAddDialog();
          this.loadRooms();
        },
        error: (err: any) => {
          console.error('Erreur lors de la modification de la chambre:', err);
          this.addRoomError = err?.message ?? 'Impossible de modifier la chambre pour le moment.';
          this.isSaving = false;
        }
      });
      return;
    }

    this.roomsApi.create(roomPayload).subscribe({
      next: (room: Room) => {
        this.rooms.set([...this.rooms(), room]);
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
      next: (room: Room) => {
        this.rooms.set(this.rooms().map(current => current.id === room.id ? room : current));
        this.loadRooms();
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour de la chambre:', err)
    });
  }

  toggleRoomStatus(room: Room): void {
    const nextStatus = room.status === RoomStatus.OCCUPIED
      ? RoomStatus.AVAILABLE
      : RoomStatus.OCCUPIED;

    this.updateRoomStatus(room.id, nextStatus);
  }

  getStatusLabel(status: RoomStatus): string {
    return status === RoomStatus.AVAILABLE ? 'Disponible' : 'Occupée';
  }

  getStatusClass(status: RoomStatus): string {
    return status === RoomStatus.AVAILABLE ? 'badge badge--success' : 'badge badge--danger';
  }

  get tableRooms() {
    return this.rooms();
  }

  roomColumns: GenericTableColumn<Room>[] = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'roomNumber', label: 'Chambre' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacité', type: 'number' },
    { key: 'price', label: 'Prix', type: 'currency' },
    {
      key: 'status',
      label: 'Statut',
      type: 'toggle',
      toggle: {
        action: 'toggle-status',
        checkedValue: RoomStatus.OCCUPIED,
        checkedLabel: 'Occupée',
        uncheckedLabel: 'Disponible'
      }
    }
  ];

  roomActions: GenericTableAction<Room>[] = [
    {
      label: 'Modifier',
      action: 'edit',
      color: 'secondary'
    },
    {
      label: 'Supprimer',
      action: 'delete',
      color: 'danger'
    }
  ];

  onTableAction(event: { action: string; row: Room }): void {
    if (event.action === 'toggle-status') {
      this.toggleRoomStatus(event.row);
    }

    if (event.action === 'edit') {
      this.openEditDialog(event.row);
    }

    if (event.action === 'delete') {
      this.deleteRoom(event.row.id);
    }
  }

  get isEditingRoom(): boolean {
    return this.editingRoomId !== null;
  }

  private getInitialRoomForm(): RoomForm {
    return {
      roomNumber: '',
      type: RoomType.SIMPLE,
      capacity: 1,
      price: 0,
      currency: 'EUR'
    };
  }
}
