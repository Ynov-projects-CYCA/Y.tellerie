import { HttpEventType, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { BackendResponse } from '../models/backend-response.model';

export const backendEnvelopeInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    map((event) => {
      if (event.type !== HttpEventType.Response) {
        return event;
      }

      const response = event as HttpResponse<unknown>;

      if (!isBackendResponse(response.body)) {
        return response;
      }

      return response.clone({
        body: response.body.data,
      });
    }),
  );

function isBackendResponse(body: unknown): body is BackendResponse<unknown> {
  if (body === null || typeof body !== 'object') {
    return false;
  }

  return 'data' in body && 'timestamp' in body;
}
