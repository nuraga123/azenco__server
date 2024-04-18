import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';

import {
  IBrokenAnbarsUsernamesResponse,
  IBrokenAnbarsResponce,
  IBrokenAnbarResponce,
  IBrokenAnbarUsernameItem,
  IBrokenAnbarErrorMessage,
} from './types';
import { BrokenAnbar } from './broken_anbar.model';
import { NewAnbarDto } from './dto/new-anbar.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { HistoryService } from 'src/history/history.service';

@Injectable()
export class BrokenAnbarService {
  private readonly logger = new Logger(BrokenAnbarService.name);

  constructor(
    @InjectModel(BrokenAnbar)
    private brokenAnbarModel: typeof BrokenAnbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
  ) {
    /**/
  }

  async errorsMessage(error: any): Promise<IBrokenAnbarErrorMessage> {
    this.logger.log({ ...error });
    return {
      error_message: `Anbar Error: ${(error as AxiosError).message}!`,
    };
  }

  // получение всех анбаров
  async findAll(): Promise<IBrokenAnbarsResponce> {
    try {
      const brokenAnbars = await this.brokenAnbarModel.findAll();
      if (!brokenAnbars?.length) return { error_message: 'Нет Анбаров!' };
      return { brokenAnbars };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // поиск амбара по id
  async findOneAnbarId(id: number): Promise<IBrokenAnbarResponce> {
    try {
      const brokenAnbar = await this.brokenAnbarModel.findOne({
        where: { id },
      });
      if (!brokenAnbar) return { error_message: `нет анбара по ID: ${id}` };
      return { brokenAnbar };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // данные об имен пользователей амбара
  async getAnbarsUsernames(
    name: string,
  ): Promise<IBrokenAnbarsUsernamesResponse> {
    try {
      const anbars: IBrokenAnbarUsernameItem[] =
        await this.brokenAnbarModel.findAll({
          attributes: ['username', 'userId'],
        });

      if (!anbars.length) return { error_message: 'Нет Имен амбаров' };

      const uniqueEntries: IBrokenAnbarUsernameItem[] = [
        ...new Map(anbars.map((item) => [item.userId, item])).values(),
      ];

      if (!uniqueEntries.length) return { error_message: 'Нет Имен амбаров' };

      const usernames: IBrokenAnbarUsernameItem[] = uniqueEntries.filter(
        (item) => item.username !== name,
      );
      return { usernames };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // Поиск продуктов по userId в анбаре
  async findAllByUserId(userId: number): Promise<IBrokenAnbarsResponce> {
    try {
      const anbars = await this.brokenAnbarModel.findAll({ where: { userId } });
      return { anbars };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // Добавить товар в амбар
  async createNewAnbar(
    newAnbarDto: NewAnbarDto,
  ): Promise<IBrokenAnbarsResponce> {
    try {
      const { stock, userId, productId, location } = newAnbarDto;

      if (typeof stock !== 'number' || isNaN(stock)) {
        return {
          error_message: `Некорректное значение для поля stock`,
        };
      }

      if (typeof userId !== 'number' || isNaN(userId)) {
        return {
          error_message: `Некорректное значение для поля userId`,
        };
      }

      if (typeof productId !== 'number' || isNaN(productId)) {
        return {
          error_message: `Некорректное значение для поля productId`,
        };
      }

      if (location?.length < 3 || typeof location !== 'string') {
        return {
          error_message: `Некорректное значение для поля location или меньше 3 символов`,
        };
      }

      const user = await this.usersService.findOne({ where: { id: userId } });

      if (!user) {
        return {
          error_message: `Пользователь с ID ${userId} не найден`,
        };
      }

      const { product } = await this.productsService.findOneProduct(productId);

      if (!product) {
        return {
          error_message: `Товар с ID ${productId} не найден`,
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
          error_message: `Минимальное количество для единицы измерения 0.001 kg (1 грамм)`,
        };
      }

      if (isLengthUnit && stock <= 0.01 && decimalPart.length < 3) {
        return {
          error_message: `Минимальное количество для единицы измерения 0.01 metr (1 см)`,
        };
      }

      if (isPieceUnit && !Number.isInteger(stock)) {
        return {
          error_message:
            'Количество товара должно быть целым числом из за того что товар тип штучный',
        };
      }

      if (stock <= 0) {
        return {
          error_message: 'Количество товара должно быть больше 0',
        };
      }

      // Проверяем, существует ли уже запись в анбаре для данного пользователя и продукта
      const existingAnbar = await this.brokenAnbarModel.findOne({
        where: {
          userId: userId,
          productId: productId,
        },
      });

      // Если запись уже существует, возвращаем ошибку
      if (existingAnbar) {
        return {
          error_message: `У пользователя уже существует запись в анбаре для данного продукта`,
        };
      }

      const anbar: BrokenAnbar = await this.brokenAnbarModel.create({
        userId: user.id,
        username: user.username,
        productId: product.id,
        azencoCode: product.azencoCode,
        name: product.name,
        type: product.type,
        img: product.img,
        unit: product.unit,
        price: +product.price,
        totalPrice: +product.price * +stock,
        previousStock: 0,
        previousTotalPrice: 0,
        ordered: false,
        isComeProduct: true,
        location,
        stock,
      });

      return {
        message: `Товар добавлен в анбар ${anbar.username} | ${anbar.name} | ${anbar.brokenStock} ${product.unit}`,
        anbar,
      };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // вычитание с анбара
  async minusAnbar({
    anbarId,
    minusQuantity,
  }: {
    anbarId: number;
    minusQuantity: number;
  }) {
    if (!anbarId && !minusQuantity) {
      return { error_message: 'нет anbarId или количества!' };
    }

    const { anbar, error_message } = await this.findOneAnbarId(anbarId);

    if (error_message) return { error_message };

    // save prev state
    anbar.previousStock = +anbar.newStock;
    anbar.previousTotalPrice = +anbar.totalPrice;

    // operation minus
    const minusStock: number = +anbar.newStock - +minusQuantity;
    anbar.newStock = +minusStock;
    anbar.totalPrice = +anbar.price * +minusStock;

    anbar.save();
  }
}
