import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { CheckAvailabilityUseCase } from '../reservations/application/use-cases/check-availability.use-case';

@Controller('rooms')
export class AvailabilityController {
  constructor(private readonly checkAvailability: CheckAvailabilityUseCase) {}

  @Get(':id/availability')
  async availability(@Param('id') id: string, @Query('start') startStr: string, @Query('end') endStr: string) {
    if (!startStr || !endStr) throw new BadRequestException('start and end query parameters are required');
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('start and end must be valid ISO dates');
    }

    return await this.checkAvailability.execute(id, start, end);
  }
}
