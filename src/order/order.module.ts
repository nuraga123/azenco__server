import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './order.model';
import { UsersModule } from 'src/users/users.module';

import { HistoryModule } from 'src/history/history.module';
import { ErrorsModule } from 'src/errors/errors.module';
import { BarnModule } from 'src/barn/barn.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order]),
    UsersModule,
    BarnModule,
    HistoryModule,
    ErrorsModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
