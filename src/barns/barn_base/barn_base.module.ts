import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { BarnController } from './barn-base.controller';
import { BarnService } from './barn_base.service';
import { Barn } from './barn_base.model';

import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { HistoryModule } from 'src/history/history.module';
import { ErrorsModule } from 'src/errors/errors.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Barn]),
    UsersModule,
    ProductsModule,
    HistoryModule,
    ErrorsModule,
  ],
  controllers: [BarnController],
  providers: [BarnService],
  exports: [BarnService],
})
export class BarnModule {}
