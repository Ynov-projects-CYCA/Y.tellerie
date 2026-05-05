import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponse,
} from '@/auth/application/dtos';
import {
  IPasswordHasher,
  IPasswordHasher as IPasswordHasherSymbol,
  IUserRepository,
  IUserRepository as IUserRepositorySymbol,
} from '@/auth/application/ports';
import { Email, UserAggregate, UserFactory, UserId } from '@/auth/domain';
import { Roles } from '@/auth/infrastructure/decorators';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/infrastructure/guards/roles.guard';
import { Role } from '@/shared/model';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    @Inject(IUserRepositorySymbol)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordHasherSymbol)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse, isArray: true })
  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.mapUserResponse(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.findUser(id);
    return this.mapUserResponse(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResponse })
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    const email = Email.from(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe deja.');
    }

    const roles = dto.roles?.length ? dto.roles : [Role.CLIENT];
    const user = await UserFactory.create(
      {
        firstname: dto.firstname,
        lastname: dto.lastname,
        phoneNumber: dto.phoneNumber,
        email,
        phone: dto.phone,
        rawPassword: dto.password,
      },
      this.passwordHasher,
      roles[0],
    );

    user.updateByAdmin({
      roles,
      isActive: dto.isActive ?? true,
    });

    await this.userRepository.save(user);
    return this.mapUserResponse(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.findUser(id);
    const updateData: Parameters<UserAggregate['updateByAdmin']>[0] = {
      firstname: dto.firstname,
      lastname: dto.lastname,
      phoneNumber: dto.phoneNumber,
      phone: dto.phone,
      roles: dto.roles,
      isActive: dto.isActive,
    };

    if (dto.email) {
      const email = Email.from(dto.email);
      const existingUser = await this.userRepository.findByEmail(email);

      if (
        existingUser &&
        !existingUser.getProperties().id.equals(user.getProperties().id)
      ) {
        throw new ConflictException('Un utilisateur avec cet email existe deja.');
      }

      updateData.email = email;
    }

    user.updateByAdmin(updateData);
    await this.userRepository.save(user);
    return this.mapUserResponse(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: UserAggregate },
  ): Promise<void> {
    const user = await this.findUser(id);

    if (user.getProperties().id.equals(req.user.getProperties().id)) {
      throw new ConflictException('Vous ne pouvez pas supprimer votre propre compte.');
    }

    await this.userRepository.delete(user.getProperties().id);
  }

  private async findUser(id: string): Promise<UserAggregate> {
    const user = await this.userRepository.findById(UserId.from(id));

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  private mapUserResponse(user: UserAggregate): UserResponse {
    const properties = user.getProperties();

    return {
      id: properties.id.toString(),
      firstname: properties.firstname,
      lastname: properties.lastname,
      phoneNumber: properties.phoneNumber,
      isActive: properties.isActive,
      email: properties.email.toString(),
      phone: properties.phone,
      roles: properties.roles,
    };
  }
}
