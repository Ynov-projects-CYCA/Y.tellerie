import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from '../../../../src/common/filters/http-exception.filter';

describe('AllExceptionsFilter', () => {
  it('returns a clearer message for malformed JSON payloads', () => {
    const filter = new AllExceptionsFilter();
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = { status, json } as unknown as Response;
    const request = { url: '/auth/register/personnel' } as Request;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    filter.catch(
      new BadRequestException({
        message: 'Bad control character in string literal in JSON at position 80',
        error: 'Bad Request',
        statusCode: 400,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        path: '/auth/register/personnel',
        error: expect.objectContaining({
          message:
            'Corps JSON invalide. Verifiez les retours a la ligne, tabulations ou guillemets non echappes dans les chaines.',
          details:
            'Bad control character in string literal in JSON at position 80',
        }),
      }),
    );
  });
});
