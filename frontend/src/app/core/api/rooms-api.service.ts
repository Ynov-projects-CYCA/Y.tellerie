import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Room } from '@core/api/models';
import { ApiClient } from '@core/http';

@Injectable({ providedIn: 'root' })
export class RoomsApiService {
  private readonly apiClient = inject(ApiClient);

  findAll(): Observable<Room[]> {
    return this.apiClient.get<Room[]>('/rooms');
  }

  findOne(id: string): Observable<Room> {
    return this.apiClient.get<Room>(`/rooms/${id}`);
  }

  create(room: Partial<Room>): Observable<Room> {
    return this.apiClient.post<Room, Partial<Room>>('/rooms', room);
  }

  update(id: string, room: Partial<Room>): Observable<Room> {
    return this.apiClient.put<Room, Partial<Room>>(`/rooms/${id}`, room);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`/rooms/${id}`);
  }
}
