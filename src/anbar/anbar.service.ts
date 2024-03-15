import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { HistoryService } from 'src/history/history.service';
import { TransferStockDto } from './dto/transfer-stock-anbar.dto';
import { AddToAnbarDto } from './dto/add-to-anbar';
import { AxiosError } from 'axios';

interface IAnbarUsername {
  username: string;
  userId: number;
}

@Injectable()
export class AnbarService {
  private logger = new Logger('AnbarService');

  constructor(
    @InjectModel(Anbar)
    private anbarModel: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
  ) {}

  // получение всех анбаров
  async findAll(): Promise<Anbar[] | { errorMessage: string }> {
    try {
      return await this.anbarModel.findAll();
    } catch (error) {
      // Обработка ошибок, если они возникнут при выполнении запроса
      this.logger.log((error as Error).message);
      return { errorMessage: `${(error as AxiosError).message}` };
    }
  }

  // поиск амбара по id
  async findOneAnbarId(anbarId: number): Promise<Anbar> {
    return this.anbarModel.findOne({
      where: {
        id: anbarId,
      },
    });
  }

  // данные об имен пользователей анбара
  async getAnbarsUsername(
    nameToDelete: string,
  ): Promise<IAnbarUsername[] | { errorMessage: string }> {
    try {
      const anbars: IAnbarUsername[] = await this.anbarModel.findAll({
        attributes: ['username', 'userId'],
      });

      if (!anbars.length) {
        return { errorMessage: 'Нет данных' };
      }

      const uniqueEntries: IAnbarUsername[] = [
        ...new Map(anbars.map((item) => [item.userId, item])).values(),
      ];

      if (!uniqueEntries.length) {
        return { errorMessage: 'Нет уникальных записей' };
      }

      const filteredEntries: IAnbarUsername[] = uniqueEntries.filter(
        (item) => item.username !== nameToDelete,
      );

      this.logger.log(
        `Уникальные имена пользователей из Anbars (за исключением «${nameToDelete}»)`,
        filteredEntries,
      );

      return filteredEntries;
    } catch (error) {
      const errorMessage = (error as AxiosError).message;
      this.logger.log(`Ошибка getAnbarsUsername: ${errorMessage}`);

      return {
        errorMessage: 'Невозможно получить имена пользователей',
      };
    }
  }

  // поиск амбара по userId
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

    if (!user) {
      return {
        message: 'Неверные данные пользователя!',
      };
    }

    const product = await this.productsService.findOneProduct({
      where: { id: addToAnbarDto.productId },
    });

    if (!product) {
      return {
        message: 'Неверные данные товара!',
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
          'Запись в амбаре уже существует для данного пользователя и продукта!',
      };
    }

    // Создаем запись о товаре в амбаре
    const newAnbar: Anbar = await this.anbarModel.create({
      userId: user.id,
      username: user.username,
      productId: product.id,
      azenco__code: product.azenco__code,
      name: product.name,
      type: product.type,
      images: product.images,
      unit: product.unit,
      price: Number(product.price),
      stock: Number(addToAnbarDto.stock),
      total_price: Number(product.price) * Number(addToAnbarDto.stock),
      createdAt: new Date(),
      updatedAt: new Date(),
      // сосотояния до заказа
      previous_stock: 0,
      previous_total_price: 0,
      // по умолчанию новый анбар не может быть заказан
      ordered: false,
      isComeProduct: false,
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
          ...currentProduct,
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
      toAnbar.azenco__code = currentProduct.azenco__code;
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
    const anbar = await this.findOneAnbarId(+anbarId);

    if (!anbar) {
      return {
        message: `Амбар ID: ${anbarId} не найден!`,
        orderedState: false,
      };
    }

    if (anbar.ordered && anbar.userId === userId) {
      // Подтверждаем получение товара
      anbar.ordered = false;
      anbar.previous_stock = 0;
      anbar.previous_total_price = 0;

      // Создаем запись в истории
      await this.historyService.createHistory(
        `товар ${anbar.name} подтвержден полученным !`,
        anbar.username,
        userId,
      );

      // Если весь товар из амбара был заказан и подтвержден,
      // удаляем запись амбара
      const Logger = this.logger;
      Logger.log(`anbar.stock === 0`);
      Logger.log(anbar.stock === 0);
      if (+anbar.stock === 0) {
        await anbar.destroy();

        return {
          message: `Амбар для товара ${anbar.name} удален, так как весь товар был заказан и подтвержден полученным!`,
          orderedState: false,
        };
      } else {
        await anbar.save();
        return {
          message: `товар ${anbar.name} подтвержден полученным !`,
          orderedState: false,
        };
      }
    }
  }

  // отмена заказа
  async cancelOrder(
    anbarId: number,
  ): Promise<{ message: string; orderedState: boolean }> {
    const anbar = await this.anbarModel.findOne({
      where: {
        id: anbarId,
      },
    });
    Logger.log(anbar);
    Logger.log(anbarId);

    if (!anbar) {
      return {
        message: `Амбар с anbarId ${anbarId}  не найден`,
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

  async requestStockTransfer(
    fromUsername: string,
    toUsername: string,
    productId: number,
    quantity: number,
  ): Promise<{ message: string }> {
    try {
      // Получаем информацию о пользователях и товаре
      const fromUser = await this.usersService.findOne({
        where: { username: fromUsername },
      });

      const toUser = await this.usersService.findOne({
        where: { username: toUsername },
      });
      const product = await this.productsService.findOneProduct({
        where: { id: productId },
      });

      if (!fromUser || !toUser || !product) {
        throw new Error('Invalid user or product');
      }

      // Создаем запись о заказе на передачу товара
      // и отправляем запрос второму пользователю
      const newRequest = await this.historyService.createHistory(
        `Request to transfer ${quantity} ${product.name} from ${fromUser.username} to ${toUser.username}`,
        fromUser.username,
        toUser.id,
        true, // Здесь можно добавить статус ожидания подтверждения
      );

      return { message: 'Transfer request sent' };
    } catch (error) {
      this.logger.error(`Error requesting stock transfer: ${error.message}`);
      throw new Error('Failed to request stock transfer');
    }
  }

  async confirmStockTransfer(
    fromUsername: string,
    toUsername: string,
    productId: number,
    quantity: number,
    confirmation: boolean,
  ): Promise<{ message: string }> {
    try {
      // Обрабатываем ответ от второго пользователя
      // о согласии или отказе на передачу товара
      if (confirmation) {
        // Если пользователь согласен, выполняем передачу товара
        // Например, можно вызвать метод для фактической передачи товара
        return { message: 'Stock transfer confirmed' };
      } else {
        // Если пользователь отказывается, отменяем передачу товара
        // Например, можно вызвать метод для отмены заказа на передачу товара
        return { message: 'Stock transfer declined' };
      }
    } catch (error) {
      this.logger.error(`Error confirming stock transfer: ${error.message}`);
      throw new Error('Failed to confirm stock transfer');
    }
  }

  async confirmStockReceived(
    username: string,
    productId: number,
    quantityReceived: number,
  ): Promise<{ message: string }> {
    try {
      // Обрабатываем подтверждение получения товара
      // и обновляем количество товара у обоих пользователей
      // Например, можно вызвать метод для обновления количества товара в амбаре
      return { message: 'Stock received confirmed' };
    } catch (error) {
      this.logger.error(`Error confirming stock received: ${error.message}`);
      throw new Error('Failed to confirm stock received');
    }
  }

  async cancelStockTransfer(
    fromUsername: string,
    toUsername: string,
    productId: number,
    quantity: number,
  ): Promise<{ message: string }> {
    try {
      // Отменяем заказ на передачу товара
      // и возвращаем товар обратно в амбар отправителя
      // Например, можно вызвать метод для отмены заказа и возврата товара
      return { message: 'Stock transfer canceled' };
    } catch (error) {
      this.logger.error(`Error canceling stock transfer: ${error.message}`);
      throw new Error('Failed to cancel stock transfer');
    }
  }
}
