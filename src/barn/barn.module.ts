import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { ArchiveModule } from 'src/archive/archive.module';
import { ErrorsModule } from 'src/errors/errors.module';
import { Barn } from './barn.model';
import { BarnService } from './barn.service';
import { BarnController } from './barn.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Barn]),
    UsersModule,
    ProductsModule,
    ArchiveModule,
    ErrorsModule,
  ],
  controllers: [BarnController],
  providers: [BarnService],
  exports: [BarnService],
})
export class BarnModule {}
