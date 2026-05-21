import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
    imports: [ConfigModule],
})
export class DashboardModule {}
