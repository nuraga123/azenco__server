import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArchiveController } from './archive.controller';
import { ArchiveService } from './archive.service';
import { Archive } from './archive.model';
import { ErrorsModule } from 'src/errors/errors.module';

@Module({
  imports: [SequelizeModule.forFeature([Archive]), ErrorsModule],
  controllers: [ArchiveController],
  providers: [ArchiveService],
  exports: [ArchiveService],
})
export class HistoryModule {}
