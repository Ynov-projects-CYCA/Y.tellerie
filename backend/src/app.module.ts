import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import mailjetConfig from './config/mailjet.config';
import stripeConfig from './config/stripe.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { MailjetModule } from './mailjet/mailjet.module';
import { RoomsModule } from './rooms/rooms.module';
import { RolesGuard } from './auth/infrastructure/guards/roles.guard';

@Module({
  imports: [
    AuthModule,
    StripeModule,
    MailjetModule,
    RoomsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, stripeConfig, mailjetConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false, // Set to false for production
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
