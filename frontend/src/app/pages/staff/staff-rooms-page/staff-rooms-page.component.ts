import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CreateRoomPayload,
  getRoomLabel,
  getRoomStatusLabel,
  Room,
  RoomsApiService,
  RoomStatus,
  RoomType,
} from '@core';
import {
  DataTableModalComponent,
  TableAction,
  TableColumn,
  TableConfig,
} from '../../../shared/components/data-table-modal/data-table-modal.component';

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

type RoomAction = 'available' | 'occupied' | 'clean' | 'maintenance' | 'delete';

@Component({
  selector: 'app-staff-rooms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableModalComponent],
  templateUrl: './staff-rooms-page.component.html',
  styleUrls: ['./staff-rooms-page.component.scss']
})
export class StaffRoomsPageComponent implements OnInit {
  private readonly roomsApi = inject(RoomsApiService);

  protected readonly roomTypes = Object.values(RoomType);
  protected readonly roomStatuses = Object.values(RoomStatus);
  protected readonly getRoomStatusLabel = getRoomStatusLabel;

  rooms: Room[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  isAddDialogOpen = false;
  isModalOpen = false;
  modalConfig!: TableConfig;

  newRoom: CreateRoomPayload = this.getInitialRoomForm();

  ngOnInit(): void {
    this.loadRooms();
  }

  get availableCount(): number {
    return this.rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  }

  get occupiedCount(): number {
    return this.rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  }

  get dirtyCount(): number {
    return this.rooms.filter(r => r.status === RoomStatus.DIRTY).length;
  }

  openAddDialog(): void {
    this.errorMessage = null;
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.newRoom = this.getInitialRoomForm();
  }

  addRoom(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.roomsApi.create(this.newRoom).subscribe({
      next: () => {
        this.closeAddDialog();
        this.loadRooms();
      },
      error: () => {
        this.errorMessage = 'Impossible de créer la chambre pour le moment.';
        this.isLoading = false;
      },
    });
  }

  openRoomsModal(): void {
    this.initializeModalConfig();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onActionClick(event: { action: string; item: RoomTableRow }): void {
    const action = event.action as RoomAction;
    const room = event.item.raw;

    if (action === 'delete') {
      this.deleteRoom(room.id);
      return;
    }

    if (action === 'occupied') {
      this.runRoomMutation(this.roomsApi.checkin(room.id));
      return;
    }

    if (action === 'clean') {
      this.runRoomMutation(this.roomsApi.clean(room.id));
      return;
    }

    if (action === 'available') {
      this.runRoomMutation(this.roomsApi.update(room.id, { status: RoomStatus.AVAILABLE }));
      return;
    }

    this.runRoomMutation(this.roomsApi.update(room.id, { status: RoomStatus.MAINTENANCE }));
  }

  protected getRoomTypeLabel(type: RoomType): string {
    return getRoomLabel({ type });
  }

  private loadRooms(): void {
    this.isLoading = true;

    this.roomsApi.findAll().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
        if (this.isModalOpen) {
          this.initializeModalConfig();
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les chambres.';
        this.isLoading = false;
      },
    });
  }

  private deleteRoom(id: string): void {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      return;
    }

    this.isLoading = true;
    this.roomsApi.delete(id).subscribe({
      next: () => this.loadRooms(),
      error: () => {
        this.errorMessage = 'Impossible de supprimer la chambre.';
        this.isLoading = false;
      },
    });
  }

  private runRoomMutation(request: ReturnType<RoomsApiService['update']>): void {
    this.isLoading = true;
    this.errorMessage = null;

    request.subscribe({
      next: () => this.loadRooms(),
      error: () => {
        this.errorMessage = 'Impossible de mettre à jour cette chambre.';
        this.isLoading = false;
      },
    });
  }

  private initializeModalConfig(): void {
    const columns: TableColumn[] = [
      { key: 'roomNumber', label: 'Chambre', width: '100px', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'capacity', label: 'Capacité', width: '100px', sortable: true },
      { key: 'price', label: 'Prix', type: 'currency', sortable: true },
      { key: 'statusLabel', label: 'Statut', type: 'status', sortable: true },
    ];

    const actions: TableAction[] = [
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
      {
        label: 'Maintenance',
        action: 'maintenance',
        color: 'secondary',
        condition: (item: RoomTableRow) => item.status !== RoomStatus.MAINTENANCE,
      },
      {
        label: 'Supprimer',
        action: 'delete',
        color: 'danger',
      },
    ];

    this.modalConfig = {
      title: 'Tableau des chambres',
      subtitle: 'Gère les chambres depuis les données backend',
      columns,
      actions,
      data: this.toTableRows(),
      loading: this.isLoading,
      emptyMessage: 'Aucune chambre disponible',
      useDropdownForActions: true,
    };
  }

  private toTableRows(): RoomTableRow[] {
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

  private getInitialRoomForm(): CreateRoomPayload {
    return {
      roomNumber: '',
      type: RoomType.SIMPLE,
      capacity: 1,
      price: 100,
      currency: 'EUR',
    };
  }
}
