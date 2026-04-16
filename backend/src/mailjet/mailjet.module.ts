import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IMailProvider as IMailProviderSymbol } from './application/ports/mail-provider.port';
import { SendTransactionalEmailUseCase } from './application/use-cases/send-transactional-email.use-case';
import { MailjetProvider } from './infrastructure/adapters/mailjet.provider';
import { MailjetController } from './infrastructure/mailjet.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MailjetController],
  providers: [
    SendTransactionalEmailUseCase,
    {
      provide: IMailProviderSymbol,
      useClass: MailjetProvider,
    },
  ],
  exports: [IMailProviderSymbol, SendTransactionalEmailUseCase],
})
export class MailjetModule {}
