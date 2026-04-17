import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = normalizeExceptionMessage(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}

function normalizeExceptionMessage(exception: unknown): unknown {
  if (!(exception instanceof HttpException)) {
    return 'Erreur interne du serveur';
  }

  const response = exception.getResponse() as
    | string
    | { message?: unknown; error?: unknown; statusCode?: number };

  if (typeof response === 'string') {
    return response;
  }

  const rawMessage = extractMessage(response.message) ?? extractMessage(response.error);

  if (rawMessage && isMalformedJsonMessage(rawMessage)) {
    return {
      ...response,
      message:
        "Corps JSON invalide. Verifiez les retours a la ligne, tabulations ou guillemets non echappes dans les chaines.",
      details: rawMessage,
    };
  }

  return response;
}

function extractMessage(candidate: unknown): string | null {
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate.trim();
  }

  if (Array.isArray(candidate)) {
    const firstMessage = candidate.find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    );

    return firstMessage?.trim() ?? null;
  }

  return null;
}

function isMalformedJsonMessage(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('in json at position') ||
    normalizedMessage.includes('unexpected token') ||
    normalizedMessage.includes('bad control character')
  );
}
