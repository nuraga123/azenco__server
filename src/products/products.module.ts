import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './product.model';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ErrorsModule } from 'src/errors/errors.module';

@Module({
  imports: [SequelizeModule.forFeature([Product]), ErrorsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
