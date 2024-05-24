import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { History } from './history.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ErrorsModule } from 'src/errors/errors.module';

@Module({
  imports: [SequelizeModule.forFeature([History]), ErrorsModule],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
