import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnbarShoppingCart } from './anbar-shopping-cart.model';
import { UsersService } from 'src/users/users.service';
import { AddAnbarToCartDto } from './dto/add-anbar-to-cart';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class AnbarShoppingCartService {
  constructor(
    @InjectModel(AnbarShoppingCart)
    private anbarShoppingCartModal: typeof AnbarShoppingCart,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(userId: number | string): Promise<AnbarShoppingCart[]> {
    return this.anbarShoppingCartModal.findAll({ where: { userId } });
  }

  async add(addAnbarToCartDto: AddAnbarToCartDto): Promise<AnbarShoppingCart> {
    const cart = new AnbarShoppingCart();

    const user = await this.usersService.findOne({
      where: {
        username: addAnbarToCartDto.username,
      },
    });

    const product = await this.productsService.findOneProduct(
      addAnbarToCartDto.productId,
    );

    cart.userId = user.id;
    cart.productId = product.id;
    cart.price = product.price;
    cart.image = JSON.parse(product.images)[0];
    cart.name = product.name;
    cart.total_price = product.price;

    cart.createdAt = new Date();
    cart.updatedAt = new Date();

    return cart.save();
  }

  async updateCount(
    count: number,
    partId: number | string,
  ): Promise<{ count: number }> {
    await this.anbarShoppingCartModal.update({ count }, { where: { partId } });

    const part = await this.anbarShoppingCartModal.findOne({
      where: { partId },
    });

    return { count: part.count };
  }

  async updateTotalPrice(
    total_price: number,
    partId: number | string,
  ): Promise<{ total_price: number }> {
    await this.anbarShoppingCartModal.update(
      { total_price },
      { where: { partId } },
    );

    const part = await this.anbarShoppingCartModal.findOne({
      where: { partId },
    });

    return { total_price: part.total_price };
  }

  async remove(partId: number | string): Promise<void> {
    const part = await this.anbarShoppingCartModal.findOne({
      where: { partId },
    });

    await part.destroy();
  }

  async removeAll(userId: number | string): Promise<void> {
    await this.anbarShoppingCartModal.destroy({ where: { userId } });
  }
}
