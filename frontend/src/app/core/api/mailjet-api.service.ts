import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@core/http';

export interface SendMailRequest {
  to: string;
  toName?: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SendMailResponse {
  messageId: string;
}

@Injectable({ providedIn: 'root' })
export class MailjetApiService {
  private readonly apiClient = inject(ApiClient);

  send(payload: SendMailRequest): Observable<SendMailResponse> {
    return this.apiClient.post<SendMailResponse, SendMailRequest>(
      '/mailjet/send',
      payload,
    );
  }
}
