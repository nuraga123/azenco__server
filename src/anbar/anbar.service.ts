import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { AddToAnbarDto } from './dto/add-to-anbar';
import { TransferStockDto } from './dto/transfer-stock-anbar.dto';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';

@Injectable()
export class AnbarService {
  private logger = new Logger('AnbarService');

  constructor(
    @InjectModel(Anbar)
    private anbarModel: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  // получение всех анбаров
  async findAll(): Promise<Anbar[]> {
    try {
      return await this.anbarModel.findAll();
    } catch (error) {
      // Обработка ошибок, если они возникнут при выполнении запроса
      throw new Error(`Unable to fetch all Anbars: ${error.message}`);
    }
  }

  // Получить все записи в амбаре для указанного пользователя
  async findOne(userId: number | string): Promise<Anbar[]> {
    return this.anbarModel.findAll({ where: { userId } });
  }

  // Добавить товар в амбар
  async addAnbar(
    addToAnbarDto: AddToAnbarDto,
  ): Promise<{ message: string; newAnbar?: Anbar }> {
    const user = await this.usersService.findOne({
      where: { username: addToAnbarDto.username },
    });

    const product = await this.productsService.findOneProduct({
      where: { id: addToAnbarDto.productId },
    });

    if (!user || !product) {
      return {
        message: 'Неверные данные пользователя или товара.',
      };
    }

    const existingAnbar = await this.anbarModel.findOne({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (existingAnbar) {
      return {
        message:
          'Запись в амбаре уже существует для данного пользователя и продукта.',
      };
    }

    // Создаем запись о товаре в амбаре
    const newAnbar = await this.anbarModel.create({
      userId: user.id,
      username: user.username,
      productId: product.id,
      name: product.name,
      type: product.type,
      img: product.images,
      createdAt: new Date(),
      updatedAt: new Date(),
      unit: product.unit,
      price: Number(product.price),
      // настоящее время
      stock: Number(addToAnbarDto.stock),
      total_price: Number(product.price) * Number(addToAnbarDto.stock),
      // по умолчанию гу нового товара нет прошлой истории заказов
      previous_stock: 0,
      previous_total_price: 0,
      // Изначально товар не заказан
      ordered: false,
    });

    newAnbar.save();
    return {
      message: `Товар добавлен в анбар ${newAnbar.username} | ${newAnbar.name} ${newAnbar.stock} ${product.unit}`,
      newAnbar,
    };
  }

  // Передача товара между амбарами
  async transferStock(transferStockDto: TransferStockDto): Promise<{
    message: string;
    fromAnbar?: Anbar;
    toAnbar?: Anbar;
  }> {
    const transaction = await this.anbarModel.sequelize.transaction();

    try {
      const fromUser = await this.usersService.findOne({
        where: { username: transferStockDto.fromUsername },
      });

      const currentProduct = await this.productsService.findOneProduct({
        where: { id: transferStockDto.productId },
      });

      const fromAnbar = await this.anbarModel.findOne({
        where: {
          userId: fromUser.id,
          username: fromUser.username,
          productId: currentProduct.id,
          // Проверяем, что товар не заказан
          ordered: false,
        },
      });

      if (!!fromAnbar.ordered === false) {
        fromAnbar.ordered = true;
      }

      const previousStock = fromAnbar.stock;
      const previousTotalPrice = fromAnbar.total_price;

      console.log(previousStock, previousTotalPrice);
      if (!fromAnbar || fromAnbar.stock < transferStockDto.quantity) {
        throw new Error(`Недостаточно товаров у ${fromUser.username}`);
      }

      // Находим или создаем амбар, куда передается товар
      const [toAnbar] = await this.anbarModel.findOrCreate({
        where: {
          userId: transferStockDto.toUserId,
          productId: transferStockDto.productId,
          username: transferStockDto.toUsername,
        },
        defaults: {
          userId: transferStockDto.toUserId,
          productId: transferStockDto.productId,
          stock: 0,
          total_price: 0,
          // Новый амбар, товар еще не заказан
          ordered: false,
        },
        transaction,
      });

      const priceAndQuantity =
        Number(currentProduct.price) * Number(transferStockDto.quantity);

      // Обновление статуса и количества в "отправляющем" амбаре

      fromAnbar.previous_stock = Number(previousStock);
      fromAnbar.previous_total_price = Number(previousTotalPrice);
      fromAnbar.stock =
        Number(fromAnbar.stock) - Number(transferStockDto.quantity);
      fromAnbar.total_price =
        Number(fromAnbar.total_price) - Number(priceAndQuantity);
      await fromAnbar.save({ transaction });

      // Обновление данных в "получающем" амбаре
      toAnbar.name = currentProduct.name;
      toAnbar.type = currentProduct.type;
      toAnbar.img = currentProduct.images;
      toAnbar.price = Number(currentProduct.price);
      toAnbar.unit = currentProduct.unit;

      toAnbar.stock = Number(toAnbar.stock) + Number(transferStockDto.quantity);
      toAnbar.total_price =
        Number(toAnbar.total_price) + Number(priceAndQuantity);
      await toAnbar.save({ transaction: transaction });

      await transaction.commit();

      const successMessage = `${toAnbar.username} заказал у ${fromAnbar.username} | ${currentProduct.name}: ${transferStockDto.quantity} ${currentProduct.unit}`;

      return {
        fromAnbar,
        toAnbar,
        message: successMessage,
      };
    } catch (error) {
      await transaction.rollback();

      return {
        message: `Ошибка: ${(error as Error).message}`,
      };
    }
  }

  // Подтверждение получения товара
  async confirmReceived(
    confirmReceivedDto: ConfirmReceivedDto,
  ): Promise<{ message: string; orderedState: boolean }> {
    const { userId, anbarId } = confirmReceivedDto;
    const anbar = await this.anbarModel.findByPk(anbarId);

    if (!anbar) {
      return {
        message: `Амбар с идентификатором ${anbarId} не найден.`,
        orderedState: false,
      };
    }

    if (anbar.ordered && anbar.userId === userId) {
      // Подтверждаем получение товара
      anbar.ordered = false;
      anbar.previous_stock = 0;
      anbar.previous_total_price = 0;
      await anbar.save();
      return {
        message: `товар ${anbar.name} подтвержден полученным !`,
        orderedState: false,
      };
    }
  }

  //
  async cancelOrder(
    anbarId: number,
  ): Promise<{ message: string; orderedState: boolean }> {
    const anbar = await this.anbarModel.findByPk(anbarId);

    if (!anbar) {
      return {
        message: `Амбар с идентификатором ${anbarId} не найден.`,
        orderedState: false,
      };
    }

    if (anbar.ordered) {
      // Возвращаем товар в исходный амбар
      anbar.stock = Number(anbar.previous_stock);
      anbar.total_price = Number(anbar.previous_total_price);

      // Сбрасываем статус заказа
      anbar.ordered = false;
      anbar.previous_stock = 0;
      anbar.previous_total_price = 0;

      await anbar.save();

      return {
        message: `Заказ для товара ${anbar.name} отменен. Товар возвращен в исходный амбар`,
        orderedState: false,
      };
    }

    return {
      message: `Заказ для товара ${anbar.name} не найден или уже отменен`,
      orderedState: false,
    };
  }
}
