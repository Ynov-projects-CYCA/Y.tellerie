import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRoomDto } from '../application/dtos/create-room.dto';
import { UpdateRoomDto } from '../application/dtos/update-room.dto';
import { RoomResponseDto } from '../application/dtos/room-response.dto';
import { CreateRoomUseCase } from '../application/use-cases/create-room.use-case';
import { CheckAvailabilityUseCase } from '../../reservations/application/use-cases/check-availability.use-case';
import { UpdateRoomUseCase } from '../application/use-cases/update-room.use-case';
import { DeleteRoomUseCase } from '../application/use-cases/delete-room.use-case';
import { GetRoomUseCase } from '../application/use-cases/get-room.use-case';
import { ListRoomsUseCase } from '../application/use-cases/list-rooms.use-case';
import { CheckoutRoomUseCase } from '../application/use-cases/checkout-room.use-case';
import { CleanRoomUseCase } from '../application/use-cases/clean-room.use-case';
import { CheckinRoomUseCase } from '../application/use-cases/checkin-room.use-case';

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
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  @Get(':id/availability')
  async availability(
    @Param('id') id: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<{ available: boolean; conflicts: any[] }> {
    const start = new Date(from);
    const end = new Date(to);
    const result = await this.checkAvailabilityUseCase.execute(id, start, end);
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    const room = await this.updateRoomUseCase.execute(id, dto);
    return RoomResponseDto.fromDomain(room);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteRoomUseCase.execute(id);
  }

  @Post(':id/checkout')
  async checkout(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.checkoutRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }

  @Post(':id/clean')
  async clean(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.cleanRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }

  @Post(':id/checkin')
  async checkin(@Param('id') id: string): Promise<RoomResponseDto> {
    const room = await this.checkinRoomUseCase.execute(id);
    return RoomResponseDto.fromDomain(room);
  }
}
