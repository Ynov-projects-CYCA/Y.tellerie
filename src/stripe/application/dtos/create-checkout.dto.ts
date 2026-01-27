import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Montant en plus petite unité (ex: cents).',
    example: 1999,
  })
  @IsInt()
  @IsPositive()
  amount!: number; // amount in smallest currency unit (e.g. cents)

  @ApiPropertyOptional({
    description: 'Devise ISO 4217',
    example: 'usd',
    default: 'usd',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Description courte du paiement',
    example: 'Réservation chambre deluxe',
  })
  @IsString()
  @IsOptional()
  @Length(0, 140)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "Email du payeur (pré-rempli dans Stripe Checkout)",
    example: 'client@example.com',
  })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;
}
