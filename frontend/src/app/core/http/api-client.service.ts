import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type Primitive = string | number | boolean;

interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  params?: HttpParams | Record<string, Primitive | readonly Primitive[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(url: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<T>(url, options);
  }

  post<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: RequestOptions = {},
  ): Observable<TResponse> {
    return this.http.post<TResponse>(url, body, options);
  }

  put<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: RequestOptions = {},
  ): Observable<TResponse> {
    return this.http.put<TResponse>(url, body, options);
  }

  patch<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    options: RequestOptions = {},
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(url, body, options);
  }

  delete<TResponse>(url: string, options: RequestOptions = {}): Observable<TResponse> {
    return this.http.delete<TResponse>(url, options);
  }
}
