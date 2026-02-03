import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckAvailabilityUseCase } from '../reservations/application/use-cases/check-availability.use-case';

@ApiTags('Availability')
@Controller('rooms')
export class AvailabilityController {
  constructor(private readonly checkAvailability: CheckAvailabilityUseCase) {}

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check availability of a room for a given period' })
  @ApiQuery({ name: 'start', description: 'Start date (inclusive) in ISO format, e.g. 2026-03-01', required: true })
  @ApiQuery({ name: 'end', description: 'End date (exclusive) in ISO format, e.g. 2026-03-05', required: true })
  @ApiResponse({ status: 200, description: 'Availability result', schema: { example: { available: true, conflicts: [] } } })
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
