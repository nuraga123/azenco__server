import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import {
  IAnbarsUsernamesResponse,
  IAnbarsResponce,
  IAnbarResponce,
  IAnbarUsernameItem,
} from './types';
import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { CreateAnbarDto } from './dto/create-anbar.dto';
import { ErrorService } from 'src/errors/errors.service';

@Injectable()
export class AnbarService {
  private readonly logger = new Logger(AnbarService.name);

  constructor(
    @InjectModel(Anbar)
    private anbarModel: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
    private readonly errorService: ErrorService,
  ) {
    /**/
  }

  // получение всех анбаров
  async findAll(): Promise<IAnbarsResponce> {
    try {
      const anbars = await this.anbarModel.findAll();
      if (!anbars?.length) return { error_message: 'Нет Анбаров!' };
      return { anbars };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  // поиск амбара по id
  async findOneAnbarId(id: number): Promise<IAnbarResponce> {
    try {
      const anbar = await this.anbarModel.findOne({ where: { id } });
      if (!anbar) return { error_message: `не найден анбар по ID: ${id}` };
      return { anbar };
    } catch (error) {
      return this.errorService.errorsMessage(error);
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
      return this.errorService.errorsMessage(error);
    }
  }

  // Поиск продуктов по userId в анбаре
  async findAllByUserId(userId: number): Promise<IAnbarsResponce> {
    try {
      const anbars = await this.anbarModel.findAll({ where: { userId } });
      return { anbars };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  async findAnbarByUserIdAndProductId({
    userId,
    productId,
  }: {
    userId: number;
    productId: number;
  }): Promise<IAnbarResponce> {
    try {
      if (!userId || !productId) {
        return { error_message: 'нет user ID  или продукта ID' };
      }

      const find = { where: { userId, productId } };
      const anbar = await this.anbarModel.findOne(find);
      if (!anbar?.id) return { error_message: 'не найден амбар' };
      return { anbar };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Добавить товар в амбар
  async createNewAnbar(
    createAnbarDto: CreateAnbarDto,
  ): Promise<IAnbarResponce> {
    try {
      const {
        userId,
        productId,
        location,
        newStock,
        usedStock,
        brokenStock,
        lostStock,
      } = createAnbarDto;

      // Проверка на корректность значений
      if (!userId || !productId) {
        return { error_message: 'Некорректные данные для добавления в амбар' };
      }

      // Поиск пользователя укоратить метод
      const user = await this.usersService.findOne({ where: { id: userId } });

      if (!user) {
        return { error_message: `Пользователь с ID ${userId} не найден` };
      }

      // Поиск продукта
      const { product } = await this.productsService.findOneProduct(+productId);
      if (!product) {
        return { error_message: `Товар с ID ${productId} не найден` };
      }

      // Проверка единиц измерения и другие проверки...
      const isPieceUnit = product.unit === 'ədəd';
      const isWeightUnit = product.unit === 'kg';
      const isLengthUnit = product.unit === 'metr';

      if (isWeightUnit && newStock <= 0.001) {
        return {
          error_message: `Минимальное количество для единицы измерения 0.001 kg (1 грамм)`,
        };
      }

      if (isLengthUnit && newStock <= 0.01) {
        return {
          error_message: `Минимальное количество для единицы измерения 0.01 metr (1 см)`,
        };
      }

      if (isPieceUnit && !Number.isInteger(newStock)) {
        return {
          error_message:
            'Количество товара должно быть целым числом из-за того, что товар тип штучный',
        };
      }

      // Поиск записи в анбаре для данного пользователя и продукта
      const existingAnbar = await this.findAnbarByUserIdAndProductId({
        userId,
        productId,
      });

      this.logger.log(existingAnbar.anbar);

      if (existingAnbar.anbar) {
        return { error_message: 'такой анбар уже существует' };
      }

      const totalStock: number = +newStock + +usedStock + +brokenStock;

      // Создание записи в анбаре
      const anbar: Anbar = await this.anbarModel.create({
        userId,
        productId,
        username: user.username,
        location,
        azencoCode: product.azencoCode,
        name: product.name,
        type: product.type,
        img: product.img,
        unit: product.unit,
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        lostStock: +lostStock || 0,
        totalStock,
        previousStock: 0,
        previousTotalPrice: 0,
        price: +product.price,
        totalPrice: +product.price * +totalStock,
      });

      return {
        message: `Товар добавлен в анбар ${anbar.username} | ${anbar.name} | ${anbar.newStock} ${product.unit}`,
        anbar,
      };
    } catch (error) {
      return this.errorService.errorsMessage(error);
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
