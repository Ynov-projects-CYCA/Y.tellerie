import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPasswordHasher, IPasswordHasher as IPasswordHasherSymbol } from '@/auth/application/ports';
import {
  CreateManagedUserDto,
  UpdateManagedUserDto,
  UserManagementResponseDto,
} from '@/auth/application/dtos/user-management.dto';
import { Roles } from '@/auth/infrastructure/decorators';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/infrastructure/guards/roles.guard';
import {
  UserOrmEntity,
  UserSchema,
} from '@/auth/infrastructure/persistence/typeorm/user.schema';
import { Role } from '@/shared/model';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    @InjectRepository(UserSchema)
    private readonly usersRepository: Repository<UserOrmEntity>,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  @Get()
  async findAll(): Promise<UserManagementResponseDto[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.toResponse(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserManagementResponseDto> {
    const user = await this.findUserOrFail(id);
    return this.toResponse(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateManagedUserDto,
  ): Promise<UserManagementResponseDto> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe deja.');
    }

    const now = new Date();
    const user = this.usersRepository.create({
      id: randomUUID(),
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      phone: dto.phone ?? '',
      phoneNumber: dto.phoneNumber ?? dto.phone ?? '',
      passwordHash: await this.passwordHasher.hash(dto.password),
      roles: dto.roles.length > 0 ? dto.roles : [Role.CLIENT],
      isActive: dto.isActive ?? true,
      verifyEmailToken: null,
      resetPasswordToken: null,
      createdAt: now,
      updatedAt: now,
    });

    return this.toResponse(await this.usersRepository.save(user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateManagedUserDto,
  ): Promise<UserManagementResponseDto> {
    const user = await this.findUserOrFail(id);

    Object.assign(user, {
      firstname: dto.firstname ?? user.firstname,
      lastname: dto.lastname ?? user.lastname,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      phoneNumber: dto.phoneNumber ?? user.phoneNumber,
      roles: dto.roles ?? user.roles,
      isActive: dto.isActive ?? user.isActive,
      updatedAt: new Date(),
    });

    return this.toResponse(await this.usersRepository.save(user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
  }

  private async findUserOrFail(id: string): Promise<UserOrmEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  private toResponse(user: UserOrmEntity): UserManagementResponseDto {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
