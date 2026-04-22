import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {ApiClient} from '../http/api-client.service';
import {Room} from './models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomsApiService {
  private readonly apiClient = inject(ApiClient);

  findAll(): Observable<Room[]> {
    return this.apiClient.get<Room[]>('/rooms');
  }

  findOne(id: string): Observable<Room> {
    return this.apiClient.get<Room>(`/rooms/${id}`);
  }
}
