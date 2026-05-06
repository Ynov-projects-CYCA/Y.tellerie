import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Room, RoomStatus, RoomType } from '@core/api/models';
import { ApiClient } from '@core/http';

export interface CreateRoomPayload {
  roomNumber: string;
  type: RoomType;
  capacity: number;
  price: number;
  currency?: string;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  type?: RoomType;
  capacity?: number;
  price?: number;
  currency?: string;
  status?: RoomStatus;
}

@Injectable({ providedIn: 'root' })
export class RoomsApiService {
  private readonly apiClient = inject(ApiClient);

  findAll(): Observable<Room[]> {
    return this.apiClient.get<Room[]>('/rooms');
  }

  findOne(id: string): Observable<Room> {
    return this.apiClient.get<Room>(`/rooms/${id}`);
  }

  create(payload: CreateRoomPayload): Observable<Room> {
    return this.apiClient.post<Room, CreateRoomPayload>('/rooms', payload);
  }

  update(id: string, payload: UpdateRoomPayload): Observable<Room> {
    return this.apiClient.put<Room, UpdateRoomPayload>(`/rooms/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`/rooms/${id}`);
  }

  checkin(id: string): Observable<Room> {
    return this.apiClient.post<Room, Record<string, never>>(`/rooms/${id}/checkin`, {});
  }

  checkout(id: string): Observable<Room> {
    return this.apiClient.post<Room, Record<string, never>>(`/rooms/${id}/checkout`, {});
  }

  clean(id: string): Observable<Room> {
    return this.apiClient.post<Room, Record<string, never>>(`/rooms/${id}/clean`, {});
  }
}
