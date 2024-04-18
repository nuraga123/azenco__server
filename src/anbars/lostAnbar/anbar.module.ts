import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnbarController } from './anbar.controller';
import { AnbarService } from './anbar.service';
import { Anbar } from './anbar.model';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Anbar]),
    UsersModule,
    ProductsModule,
    HistoryModule,
  ],
  controllers: [AnbarController],
  providers: [AnbarService],
  exports: [AnbarService],
})
export class AnbarModule {}
