import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Identifiant de la réservation à payer.',
    example: '2f885cc5-2bcb-473b-95d1-14e6a25d97c8',
  })
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @ApiPropertyOptional({
    description: 'Description courte du paiement',
    example: 'Réservation chambre deluxe',
  })
  @IsString()
  @IsOptional()
  @Length(0, 140)
  description?: string;

  @ApiPropertyOptional({
    description: "Envoie ou non l'e-mail contenant le lien de paiement.",
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  sendPaymentEmail?: boolean;
}
