import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BrokenAnbarController } from './broken_anbar.controller';
import { BrokenAnbarService } from './broken_anbar.service';
import { BrokenAnbar } from './broken_anbar.model';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [
    SequelizeModule.forFeature([BrokenAnbar]),
    UsersModule,
    ProductsModule,
    HistoryModule,
  ],
  controllers: [BrokenAnbarController],
  providers: [BrokenAnbarService],
  exports: [BrokenAnbarService],
})
export class AnbarModule {}
