import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ShoppingCart } from './shopping-cart.model';
import { UsersService } from 'src/users/users.service';
import { BoilerPartsService } from 'src/boiler-parts/boiler-parts.service';
import { AddToCartDto } from './dto/add-to-cart';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectModel(ShoppingCart)
    private shoppingCartModal: typeof ShoppingCart,
    private readonly usersService: UsersService,
    private readonly boilerPartsService: BoilerPartsService,
  ) {}

  async findAll(userId: number | string): Promise<ShoppingCart[]> {
    return this.shoppingCartModal.findAll({ where: { userId } });
  }

  async add(addToCartDto: AddToCartDto): Promise<ShoppingCart> {
    const cart = new ShoppingCart();

    const user = await this.usersService.findOne({
      where: {
        username: addToCartDto.username,
      },
    });

    const part = await this.boilerPartsService.findOne(addToCartDto.partId);

    cart.userId = user.id;
    cart.partId = part.id;
    cart.boiler_manufacturer = part.boiler_manufacturer;
    cart.parts_manufacturer = part.parts_manufacturer;
    cart.price = part.price;
    cart.in_stock = part.in_stock;
    cart.image = JSON.parse(part.images)[0];
    cart.name = part.name;
    cart.total_price = part.price;

    cart.createdAt = new Date();
    cart.updatedAt = new Date();

    return cart.save();
  }

  async updateCount(
    count: number,
    partId: number | string,
  ): Promise<{ count: number }> {
    await this.shoppingCartModal.update({ count }, { where: { partId } });

    const part = await this.shoppingCartModal.findOne({ where: { partId } });

    return { count: part.count };
  }

  async updateTotalPrice(
    total_price: number,
    partId: number | string,
  ): Promise<{ total_price: number }> {
    await this.shoppingCartModal.update({ total_price }, { where: { partId } });

    const part = await this.shoppingCartModal.findOne({ where: { partId } });

    return { total_price: part.total_price };
  }

  async remove(partId: number | string): Promise<void> {
    const part = await this.shoppingCartModal.findOne({ where: { partId } });

    await part.destroy();
  }

  async removeAll(userId: number | string): Promise<void> {
    await this.shoppingCartModal.destroy({ where: { userId } });
  }
}
