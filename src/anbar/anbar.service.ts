import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';

import { IAnbarsUsername, IAnbarsUsernameResponse } from './types';
import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { TransferStockDto } from './dto/transfer-stock-anbar.dto';
import { NewAnbarDto } from './dto/new-anbar.dto';

@Injectable()
export class AnbarService {
  private readonly logger = new Logger('AnbarService');

  constructor(
    @InjectModel(Anbar)
    private anbarModel: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
  ) {}

  // получение всех анбаров
  async findAll(): Promise<Anbar[]> {
    try {
      return await this.anbarModel.findAll();
    } catch (error) {
      // Обработка ошибок, если они возникнут при выполнении запроса
      this.logger.log((error as Error).message);
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
  ): Promise<IAnbarsUsernameResponse> {
    try {
      const anbars: IAnbarsUsername[] = await this.anbarModel.findAll({
        attributes: ['username', 'userId'],
      });

      if (!anbars.length) {
        return {
          usernamesArray: [],
          errorMessage: 'Нет данных',
        };
      }

      const uniqueEntries: IAnbarsUsername[] = [
        ...new Map(anbars.map((item) => [item.userId, item])).values(),
      ];

      if (!uniqueEntries.length) {
        return {
          usernamesArray: [],
          errorMessage: 'Нет уникальных записей',
        };
      }

      const filteredEntries: IAnbarsUsername[] = uniqueEntries.filter(
        (item) => item.username !== nameToDelete,
      );

      this.logger.log(
        `Уникальные имена пользователей из Anbars (за исключением «${nameToDelete}»)`,
        filteredEntries,
      );

      return { usernamesArray: filteredEntries };
    } catch (error) {
      const errorMessage = (error as AxiosError).message;
      this.logger.log(`Ошибка getAnbarsUsername: ${errorMessage}`);

      return {
        usernamesArray: [],
        errorMessage: `Ошибка getAnbarsUsername: ${errorMessage}`,
      };
    }
  }

  // Поиск продуктов по userId в анбаре
  async findAllByUserId(userId: number): Promise<Anbar[]> {
    return await this.anbarModel.findAll({ where: { userId } });
  }

  // Добавить товар в амбар
  async createNewAnbar(
    newAnbarDto: NewAnbarDto,
  ): Promise<{ message: string; newAnbar?: Anbar }> {
    try {
      const { stock, userId, productId } = newAnbarDto;

      if (typeof stock !== 'number' || isNaN(stock)) {
        return {
          message: `Некорректное значение для поля stock`,
        };
      }

      if (typeof userId !== 'number' || isNaN(userId)) {
        return {
          message: `Некорректное значение для поля userId`,
        };
      }

      if (typeof productId !== 'number' || isNaN(productId)) {
        return {
          message: `Некорректное значение для поля productId`,
        };
      }

      const user = await this.usersService.findOne({ where: { id: userId } });
      if (!user) {
        return {
          message: `Пользователь с ID ${userId} не найден`,
        };
      }

      const { product } = await this.productsService.findOneProduct(productId);

      if (!product) {
        return {
          message: `Товар с ID ${productId} не найден`,
        };
      }

      const isPieceUnit = product.unit === 'ədəd';
      const isWeightUnit = product.unit === 'kg';
      const isLengthUnit = product.unit === 'metr';

      // Получаем дробную часть числа
      const decimalPart = stock.toString().split('.')[1];
      this.logger.log(decimalPart);

      if (decimalPart && decimalPart.length >= 4) {
        this.logger.log(
          `decimalPart.length >= 4: ${decimalPart.length >= 4} ${stock}`,
        );
      }

      if (decimalPart && decimalPart.length >= 3) {
        this.logger.log(
          `decimalPart.length >= 3: ${decimalPart.length >= 3} ${stock}`,
        );
      }

      if (isWeightUnit && stock <= 0.001 && decimalPart.length < 4) {
        return {
          message: `Минимальное количество для единицы измерения 0.001 kg (1 грамм)`,
        };
      }

      if (isLengthUnit && stock <= 0.01 && decimalPart.length < 3) {
        return {
          message: `Минимальное количество для единицы измерения 0.01 metr (1 см)`,
        };
      }

      if (isPieceUnit && !Number.isInteger(stock)) {
        return {
          message:
            'Количество товара должно быть целым числом из за того что товар тип штучный',
        };
      }

      if (stock <= 0) {
        return {
          message: 'Количество товара должно быть больше 0',
        };
      }

      const newAnbar = await this.anbarModel.create({
        userId: user.id,
        username: user.username,
        productId: product.id,
        azenco__code: product.azencoCode,
        name: product.name,
        type: product.type,
        img: product.img,
        unit: product.unit,
        price: +product.price,
        stock,
        total_price: +product.price * stock,
        createdAt: new Date(),
        updatedAt: new Date(),
        previous_stock: 0,
        previous_total_price: 0,
        ordered: false,
        isComeProduct: true,
      });

      return {
        message: `Товар добавлен в анбар ${newAnbar.username} | ${newAnbar.name} | ${newAnbar.stock} ${product.unit}`,
        newAnbar,
      };
    } catch (error) {
      this.logger.error(error.message);
      return { message: error.message };
    }
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

      const { product } = await this.productsService.findOneProduct(
        transferStockDto.productId,
      );

      const fromAnbar = await this.anbarModel.findOne({
        where: {
          userId: fromUser.id,
          username: fromUser.username,
          productId: product.id,
          // Проверяем, что товар не заказан
          ordered: false,
        },
      });

      if (!!fromAnbar.ordered === false) {
        fromAnbar.ordered = true;
      }

      const previousStock = fromAnbar.stock;
      const previousTotalPrice = fromAnbar.totalPrice;

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
          ...product,
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
        Number(product.price) * Number(transferStockDto.quantity);

      // Обновление статуса и количества в "отправляющем" амбаре
      fromAnbar.previousStock = Number(previousStock);
      fromAnbar.previousTotalPrice = Number(previousTotalPrice);
      fromAnbar.stock =
        Number(fromAnbar.stock) - Number(transferStockDto.quantity);
      fromAnbar.totalPrice =
        Number(fromAnbar.totalPrice) - Number(priceAndQuantity);

      await fromAnbar.save({ transaction });

      // Обновление данных в "получающем" амбаре
      toAnbar.name = product.name;
      toAnbar.azencoCode = product.azencoCode;
      toAnbar.type = product.type;
      toAnbar.img = product.img;
      toAnbar.price = Number(product.price);
      toAnbar.unit = product.unit;

      toAnbar.stock = Number(toAnbar.stock) + Number(transferStockDto.quantity);
      toAnbar.totalPrice =
        Number(toAnbar.totalPrice) + Number(priceAndQuantity);
      await toAnbar.save({ transaction: transaction });

      await transaction.commit();

      const successMessage = `${toAnbar.username} заказал у ${fromAnbar.username} | ${product.name}: ${transferStockDto.quantity} ${product.unit}`;

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
      anbar.previousStock = 0;
      anbar.previousTotalPrice = 0;

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
      anbar.stock = Number(anbar.previousStock);
      anbar.totalPrice = Number(anbar.previousTotalPrice);

      // Сбрасываем статус заказа
      anbar.ordered = false;
      anbar.previousStock = 0;
      anbar.previousTotalPrice = 0;

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
