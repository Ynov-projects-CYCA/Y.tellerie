import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@core/http';

@Injectable({ providedIn: 'root' })
export class SystemApiService {
  private readonly apiClient = inject(ApiClient);

  getWelcome(): Observable<string> {
    return this.apiClient.get<string>('/');
  }
}
