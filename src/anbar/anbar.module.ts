import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Anbar } from './anbar.model';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { AnbarController } from './anbar.controller';
import { AnbarService } from './anbar.service';

@Module({
  imports: [SequelizeModule.forFeature([Anbar]), UsersModule, ProductsModule],
  controllers: [AnbarController],
  providers: [AnbarService],
  exports: [AnbarService],
})
export class AnbarModule {}
