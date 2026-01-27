import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateCheckoutDto } from '../application/dtos/create-checkout.dto';
import { CreateCheckoutSessionUseCase } from '../application/use-cases/create-checkout-session.use-case';
import { HandleWebhookUseCase } from '../application/use-cases/handle-webhook.use-case';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Créer une session de paiement Stripe Checkout' })
  @ApiBody({
    required: true,
    schema: {
      example: {
        amount: 1999,
        currency: 'usd',
        description: 'Réservation chambre deluxe',
        customerEmail: 'client@example.com',
      },
    },
  })
  async createCheckout(@Body() body: CreateCheckoutDto) {
    const result = await this.createCheckoutSessionUseCase.execute({
      amount: body.amount,
      currency: body.currency ?? 'usd',
      description: body.description,
      customerEmail: body.customerEmail,
    });
    return result;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      throw new BadRequestException('Missing raw body for Stripe webhook');
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }
    return this.handleWebhookUseCase.execute(payload, signature);
  }
}
