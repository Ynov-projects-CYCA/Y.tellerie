import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@core/http';
import { CreateUserPayload, UpdateUserPayload, User } from './models';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly apiClient = inject(ApiClient);

  findAll(): Observable<User[]> {
    return this.apiClient.get<User[]>('/users');
  }

  findOne(id: string): Observable<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.apiClient.post<User, CreateUserPayload>('/users', payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.apiClient.patch<User, UpdateUserPayload>(`/users/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }
}
