import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../http/api-client.service';

@Injectable({ providedIn: 'root' })
export class SystemApiService {
  private readonly apiClient = inject(ApiClient);

  getWelcome(): Observable<string> {
    return this.apiClient.get<string>('/');
  }
}
