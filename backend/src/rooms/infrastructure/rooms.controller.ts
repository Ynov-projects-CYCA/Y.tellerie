import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateRoomDto } from '@/rooms/application/dtos/create-room.dto';
import { UpdateRoomDto } from '@/rooms/application/dtos/update-room.dto';
import { RoomResponseDto } from '@/rooms/application/dtos/room-response.dto';
import { CreateRoomUseCase } from '@/rooms/application/use-cases/create-room.use-case';
import { UpdateRoomUseCase } from '@/rooms/application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from '@/rooms/application/use-cases/delete-room.use-case';
import { GetRoomUseCase } from '@/rooms/application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from '@/rooms/application/use-cases/list-rooms.use-case';
import { CheckoutRoomUseCase } from '@/rooms/application/use-cases/checkout-room.use-case';
import { CleanRoomUseCase } from '@/rooms/application/use-cases/clean-room.use-case';
import { CheckinRoomUseCase } from '@/rooms/application/use-cases/checkin-room.use-case';
import { Roles } from '@/auth/infrastructure/decorators';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/infrastructure/guards/roles.guard';
import { Role } from '@/shared/model';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
    private readonly getRoomUseCase: GetRoomUseCase,
    private readonly listRoomsUseCase: ListRoomsUseCase,
    private readonly checkoutRoomUseCase: CheckoutRoomUseCase,
    private readonly cleanRoomUseCase: CleanRoomUseCase,
    private readonly checkinRoomUseCase: CheckinRoomUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async create(@Body() dto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = await this.createRoomUseCase.execute(dto);
    return RoomResponseDto.fromDomain(room);
  }

  @Get()
  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.listRoomsUseCase.execute();
    return rooms.map((room) => RoomResponseDto.fromDomain(room));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.getRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    const room = await this.updateRoomUseCase.execute(id, dto);
    return RoomResponseDto.fromDomain(room);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteRoomUseCase.execute(id);
  }

  // Les mutations d'exploitation hoteliere restent reservees au personnel.
  // Les parcours de consultation ou de reservation publique demeurent ouverts.
  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async checkout(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.checkoutRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }

  @Post(':id/clean')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async clean(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.cleanRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }

  @Post(':id/checkin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  async checkin(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.checkinRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }
}
