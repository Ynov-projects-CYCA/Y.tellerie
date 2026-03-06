import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Roles } from './auth/infrastructure/decorators/roles.decorator';
import { Role } from './auth/domain/role.vo';
import { RolesGuard } from './auth/infrastructure/guards/roles.guard';
import { JwtAuthGuard } from './auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile/client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Get client profile' })
  @ApiBearerAuth()
  getClientProfile(): string {
    return 'This is a client profile';
  }

  @Get('profile/personnel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PERSONNEL)
  @ApiOperation({ summary: 'Get personnel profile' })
  @ApiBearerAuth()
  getPersonnelProfile(): string {
    return 'This is a personnel profile';
  }
}
