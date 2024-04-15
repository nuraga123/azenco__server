import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';

import {
  IAnbarsUsernamesResponse,
  IAnbarsResponce,
  IAnbarResponce,
  IAnbarUsernameItem,
  IAnbarErrorMessage,
} from './types';
import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { NewAnbarDto } from './dto/new-anbar.dto';

@Injectable()
export class AnbarService {
  private readonly logger = new Logger(AnbarService.name);

  constructor(
    @InjectModel(Anbar)
    private anbarModel: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
  ) {
    /**/
  }

  async errorsMessage(error: any): Promise<IAnbarErrorMessage> {
    this.logger.log({ ...error });
    return {
      error_message: `Anbar Error: ${(error as AxiosError).message}!`,
    };
  }

  // получение всех анбаров
  async findAll(): Promise<IAnbarsResponce> {
    try {
      const anbars = await this.anbarModel.findAll();
      if (!anbars?.length) return { error_message: 'Нет Анбаров!' };
      return { anbars };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // поиск амбара по id
  async findOneAnbarId(id: number): Promise<IAnbarResponce> {
    try {
      const anbar = await this.anbarModel.findOne({ where: { id } });
      if (!anbar) return { error_message: `не найден анбар по ID: ${id}` };
      return { anbar };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // данные об имен пользователей анбара
  async getAnbarsUsernames(name: string): Promise<IAnbarsUsernamesResponse> {
    try {
      const anbars: IAnbarUsernameItem[] = await this.anbarModel.findAll({
        attributes: ['username', 'userId'],
      });

      if (!anbars.length) return { error_message: 'Нет Имен амбаров' };

      const uniqueEntries: IAnbarUsernameItem[] = [
        ...new Map(anbars.map((item) => [item.userId, item])).values(),
      ];

      if (!uniqueEntries.length) return { error_message: 'Нет Имен амбаров' };

      const usernames: IAnbarUsernameItem[] = uniqueEntries.filter(
        (item) => item.username !== name,
      );
      return { usernames };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // Поиск продуктов по userId в анбаре
  async findAllByUserId(userId: number): Promise<IAnbarsResponce> {
    try {
      const anbars = await this.anbarModel.findAll({ where: { userId } });
      return { anbars };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // Добавить товар в амбар
  async createNewAnbar(newAnbarDto: NewAnbarDto): Promise<IAnbarResponce> {
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
      const existingAnbar = await this.anbarModel.findOne({
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

      const anbar: Anbar = await this.anbarModel.create({
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
        message: `Товар добавлен в анбар ${anbar.username} | ${anbar.name} | ${anbar.stock} ${product.unit}`,
        anbar,
      };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // переместить товар с одного склада на другой
}
