import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModalComponent, TableConfig, TableColumn, TableAction } from '../../../shared/components/data-table-modal/data-table-modal.component';
import { mockRooms, Room, RoomStatus } from '../../../data/mockData';

@Component({
  selector: 'app-staff-rooms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableModalComponent],
  templateUrl: './staff-rooms-page.component.html',
  styleUrls: ['./staff-rooms-page.component.scss']
})
export class StaffRoomsPageComponent {
  rooms: Room[] = [...mockRooms];
  isAddDialogOpen = false;
  isModalOpen = false;
  modalConfig!: TableConfig;

  newRoom: { status: RoomStatus } = {
    status: 'available'
  };

  get availableCount(): number {
    return this.rooms.filter(r => r.status === 'available').length;
  }

  get occupiedCount(): number {
    return this.rooms.filter(r => r.status === 'occupied').length;
  }

  openAddDialog(): void {
    this.isAddDialogOpen = true;
  }

  closeAddDialog(): void {
    this.isAddDialogOpen = false;
    this.newRoom = { status: 'available' };
  }

  addRoom(): void {
    const newId = Math.max(...this.rooms.map(r => r.id), 0) + 1;

    this.rooms = [
      ...this.rooms,
      {
        id: newId,
        status: this.newRoom.status
      }
    ];

    this.closeAddDialog();
  }

  deleteRoom(id: number): void {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      this.rooms = this.rooms.filter(room => room.id !== id);
    }
  }

  updateRoomStatus(id: number, status: string): void {
    this.rooms = this.rooms.map(room =>
      room.id === id ? { ...room, status: status as RoomStatus } : room
    );
  }

  initializeModalConfig() {
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID', width: '80px', sortable: true },
      { key: 'status', label: 'Statut', type: 'status', sortable: true }
    ];

    const actions: TableAction[] = [
      {
        label: 'Disponible',
        action: 'available',
        color: 'success',
        condition: item => item.status !== 'available'
      },
      {
        label: 'Occupée',
        action: 'occupied',
        color: 'danger',
        condition: item => item.status !== 'occupied'
      },
      {
        label: 'Supprimer',
        action: 'delete',
        color: 'danger'
      }
    ];

    this.modalConfig = {
      title: 'Tableau des chambres',
      subtitle: 'Gère le statut des chambres',
      columns,
      actions,
      data: this.rooms,
      emptyMessage: 'Aucune chambre disponible'
    };
  }

  openRoomsModal(): void {
    this.initializeModalConfig();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onActionClick(event: { action: string; item: any }): void {
    switch (event.action) {
      case 'available':
        this.updateRoomStatus(event.item.id, 'available');
        break;
      case 'occupied':
        this.updateRoomStatus(event.item.id, 'occupied');
        break;
      case 'delete':
        this.deleteRoom(event.item.id);
        break;
    }

    this.initializeModalConfig();
  }

  getStatusLabel(status: RoomStatus): string {
    return status === 'available' ? 'Disponible' : 'Occupée';
  }

  getStatusClass(status: RoomStatus): string {
    return status === 'available' ? 'badge badge--success' : 'badge badge--danger';
  }

  getRoomNumber(id: number): number {
    return 100 + id;
  }
}