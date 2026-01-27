import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  to!: string;

  @ApiPropertyOptional({ example: 'Client Name' })
  @IsString()
  @IsOptional()
  toName?: string;

  @ApiProperty({ example: 'Confirmation de réservation' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiPropertyOptional({
    example: 'Bonjour {{name}}, votre réservation est confirmée.',
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    example: '<h1>Bonjour {{name}}</h1><p>Votre réservation est confirmée.</p>',
  })
  @IsString()
  @IsOptional()
  html?: string;

  @ApiPropertyOptional({
    description: 'Variables pour templating Mailjet',
    example: { name: 'Alice', room: 'Deluxe' },
  })
  @IsOptional()
  variables?: Record<string, string | number | boolean>;
}

