import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@core/api/models';
import { ApiClient } from '@core/http';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly apiClient = inject(ApiClient);

  findAll(): Observable<User[]> {
    return this.apiClient.get<User[]>('/users');
  }

  findOne(id: string): Observable<User> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.apiClient.post<User, Partial<User>>('/users', user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.apiClient.put<User, Partial<User>>(`/users/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }
}
