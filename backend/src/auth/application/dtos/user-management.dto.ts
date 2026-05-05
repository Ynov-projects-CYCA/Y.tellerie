import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '@/shared/model';
import { StrongPassword } from './password-policy';

export class UserManagementResponseDto {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  phoneNumber: string;
  isActive: boolean;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export class CreateManagedUserDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @StrongPassword()
  password: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateManagedUserDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
