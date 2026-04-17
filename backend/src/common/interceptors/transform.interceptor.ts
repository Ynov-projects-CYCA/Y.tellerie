import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // On normalise toutes les reponses de succes derriere la meme enveloppe
      // pour simplifier les intercepteurs et les tests cote frontend.
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
