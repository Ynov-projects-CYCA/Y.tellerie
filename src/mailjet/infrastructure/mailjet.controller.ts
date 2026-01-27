import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendMailDto } from '../application/dtos/send-mail.dto';
import { SendTransactionalEmailUseCase } from '../application/use-cases/send-transactional-email.use-case';

@ApiTags('Mailjet')
@Controller('mailjet')
export class MailjetController {
  constructor(
    private readonly sendMailUseCase: SendTransactionalEmailUseCase,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Envoyer un email transactionnel via Mailjet' })
  @ApiBody({
    schema: {
      example: {
        to: 'client@example.com',
        toName: 'Client',
        subject: 'Confirmation de réservation',
        text: 'Bonjour {{name}}, votre réservation est confirmée.',
        html: '<h1>Bonjour {{name}}</h1><p>Votre réservation est confirmée.</p>',
        variables: { name: 'Alice', room: 'Deluxe' },
      },
    },
    type: SendMailDto,
    required: true,
  })
  async sendMail(@Body() body: SendMailDto) {
    return this.sendMailUseCase.execute({
      to: { email: body.to, name: body.toName },
      subject: body.subject,
      text: body.text,
      html: body.html,
      variables: body.variables,
    });
  }
}

