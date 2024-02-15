import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.model';
import { UsersModule } from 'src/users/users.module';
import { AnbarModule } from 'src/anbar/anbar.module';

@Module({
  imports: [SequelizeModule.forFeature([Order]), UsersModule, AnbarModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
