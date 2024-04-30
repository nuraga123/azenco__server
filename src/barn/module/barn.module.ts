import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { HistoryModule } from 'src/history/history.module';
import { ErrorsModule } from 'src/errors/errors.module';
import { Barn } from '../model/barn.model';
import { BarnService } from '../service/barn.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Barn]),
    UsersModule,
    ProductsModule,
    HistoryModule,
    ErrorsModule,
  ],
  providers: [BarnService],
  exports: [BarnService],
})
export class BarnModule {}
