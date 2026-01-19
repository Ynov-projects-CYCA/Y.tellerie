import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const method = request?.method;
    const url = request?.url;

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        console.log(`[HTTP] ${method} ${url} - ${elapsed}ms`);
      }),
    );
  }
}



