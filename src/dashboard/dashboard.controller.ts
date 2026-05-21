import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}


  @Get('manutencao/count')
  manutencaoCount() {
    return this.dashboardService.manutencaoCount();
  }

  @Get('oficina/count')
  oficinaCount() {
    return this.dashboardService.oficinaCount();
  }

  @Get('oficina/countOne/:id')
  oficinaCountOne(@Param('id') id: string) {
    return this.dashboardService.oficinaCountOne(+id);
  }

  @Get('caminhao/count')
  caminhaoCount() {
    return this.dashboardService.caminhaoCount();
  }
  
  @Get('caminhao/countOne/:id')
  caminhaoCountOne(@Param('id') id: string) {
    return this.dashboardService.caminhaoCountOne(+id);
  }
}
