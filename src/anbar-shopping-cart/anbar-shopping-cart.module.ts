import { SequelizeModule } from '@nestjs/sequelize';
import { Module } from '@nestjs/common';
import { AnbarShoppingCartController } from './anbar-shopping-cart.controller';
import { AnbarShoppingCartService } from './anbar-shopping-cart.service';
import { AnbarShoppingCart } from './anbar-shopping-cart.model';
import { UsersModule } from 'src/users/users.module';
import { BoilerPartsModule } from 'src/boiler-parts/boiler-parts.module';

@Module({
  imports: [
    SequelizeModule.forFeature([AnbarShoppingCart]),
    UsersModule,
    BoilerPartsModule,
  ],
  controllers: [AnbarShoppingCartController],
  providers: [AnbarShoppingCartService],
})
export class ShoppingCartModule {}
