import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const allowedOrigins = configService.get<string[]>('app.corsOrigins') ?? [];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );

        return new BadRequestException([...new Set(messages)]);
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Archi Hotel API')
    .setDescription('Backend pour la gestion hôtelière - Infrastructure & Auth')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Default')
    .addTag('Auth')
    .addTag('Stripe')
    .addTag('Mailjet')
    .addTag('Bookings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') ?? 3000;
  const apiBaseUrl = configService.get<string>('app.apiBaseUrl');
  await app.listen(port);

  console.log(
    apiBaseUrl
      ? `Application is running on ${apiBaseUrl}`
      : `Application is running on port ${port}`,
  );
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  console.log(
    apiBaseUrl
      ? `Swagger UI available at ${apiBaseUrl.replace(/\/$/, '')}/api/docs`
      : 'Swagger UI available at /api/docs',
  );
}

void bootstrap();
