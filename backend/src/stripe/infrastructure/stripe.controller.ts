import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateCheckoutDto } from '@/stripe/application/dtos/create-checkout.dto';
import { PaymentStatusResponseDto } from '@/stripe/application/dtos/payment-status-response.dto';
import { CancelBookingPaymentUseCase } from '@/stripe/application/use-cases/cancel-booking-payment.use-case';
import { CreateCheckoutSessionUseCase } from '@/stripe/application/use-cases/create-checkout-session.use-case';
import { GetBookingPaymentStatusUseCase } from '@/stripe/application/use-cases/get-booking-payment-status.use-case';
import { HandleWebhookUseCase } from '@/stripe/application/use-cases/handle-webhook.use-case';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
    private readonly getBookingPaymentStatusUseCase: GetBookingPaymentStatusUseCase,
    private readonly cancelBookingPaymentUseCase: CancelBookingPaymentUseCase,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Créer une session de paiement Stripe Checkout' })
  @ApiBody({
    required: true,
    schema: {
      example: {
        bookingId: '2f885cc5-2bcb-473b-95d1-14e6a25d97c8',
        description: 'Réservation chambre deluxe',
      },
    },
  })
  async createCheckout(@Body() body: CreateCheckoutDto) {
    const result = await this.createCheckoutSessionUseCase.execute({
      bookingId: body.bookingId,
      description: body.description,
    });
    return result;
  }

  @Get('bookings/:bookingId/payment-status')
  async getBookingPaymentStatus(
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentStatusResponseDto> {
    const result = await this.getBookingPaymentStatusUseCase.execute(bookingId);
    return this.toPaymentStatusResponse(result.booking.getId(), result.booking.getStatus().getValue(), result.payment ?? null);
  }

  @Post('bookings/:bookingId/cancel')
  async cancelBookingPayment(
    @Param('bookingId') bookingId: string,
  ): Promise<PaymentStatusResponseDto> {
    const result = await this.cancelBookingPaymentUseCase.execute(bookingId);
    return this.toPaymentStatusResponse(
      result.booking.getId(),
      result.booking.getStatus().getValue(),
      result.payment,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody;
    if (!payload) {
      throw new BadRequestException('Le corps brut est manquant pour le webhook Stripe.');
    }
    if (!signature) {
      throw new BadRequestException('La signature Stripe est manquante.');
    }
    return this.handleWebhookUseCase.execute(payload, signature);
  }

  private toPaymentStatusResponse(
    bookingId: string,
    bookingStatus: PaymentStatusResponseDto['bookingStatus'],
    payment: {
      getProperties(): {
        id: string;
        status: PaymentStatusResponseDto['paymentStatus'];
        checkoutSessionId?: string;
        amount: { getAmount(): number; getCurrency(): string };
        failureReason?: string;
      };
    } | null,
  ): PaymentStatusResponseDto {
    const dto = new PaymentStatusResponseDto();
    dto.bookingId = bookingId;
    dto.bookingStatus = bookingStatus;

    if (!payment) {
      return dto;
    }

    const props = payment.getProperties();
    dto.paymentId = props.id;
    dto.paymentStatus = props.status;
    dto.checkoutSessionId = props.checkoutSessionId;
    dto.amount = props.amount.getAmount();
    dto.currency = props.amount.getCurrency();
    dto.failureReason = props.failureReason;
    return dto;
  }
}
