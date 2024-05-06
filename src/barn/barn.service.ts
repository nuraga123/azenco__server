import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Barn } from './barn.model';
import {
  IBarnResponce,
  IBarnsFilter,
  IBarnsQuery,
  IBarnsResponce,
  IBarnsUsernamesResponse,
  ICountAndRowsBarnsResponce,
  IMinusAnbarOrder,
  IUserIdAndProductId,
} from './types';

import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { ErrorService } from 'src/errors/errors.service';
import { CreatedBarnDto } from './dto/create-barn.dto';
import { UpdatedBarnDto } from './dto/update-barn.dto';
import { barnText } from './text/barnText';

@Injectable()
export class BarnService {
  private readonly logger = new Logger(BarnService.name);

  constructor(
    @InjectModel(Barn)
    private barnModel: typeof Barn,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly historyService: HistoryService,
    private readonly errorService: ErrorService,
  ) {
    /**/
  }

  // получение всех амбаров
  async findAllBarns(): Promise<IBarnsResponce> {
    try {
      const barns = await this.barnModel.findAll();
      if (!barns?.length) return { message: barnText.NOT_BARNS };
      return { barns };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // получение всех амбаров с параметрами
  async paginateBarns(query: IBarnsQuery): Promise<ICountAndRowsBarnsResponce> {
    try {
      const { limit, offset, sortBy, priceFrom, priceTo } = query;

      if (!limit && !offset) {
        const { count, rows } = await this.barnModel.findAndCountAll({
          limit: 10,
          offset: 0,
        });

        return { count, rows };
      }

      const filter: Partial<IBarnsFilter> = {};

      if (+priceFrom && +priceTo) {
        filter.price = {
          [Op.between]: [+priceFrom, +priceTo],
        };
      }

      const barnSortBy = sortBy === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows } = await this.barnModel.findAndCountAll({
        limit: +limit,
        offset: +offset * 10,
        where: filter,
        order: [['price', barnSortBy]],
      });

      return { count, rows };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  // поиск амбара по id
  async findOneBarnId(id: number): Promise<IBarnResponce> {
    try {
      if (+id <= 0) return { error_message: barnText.ID_ERROR };

      const barn = await this.barnModel.findOne({ where: { id } });
      if (!barn?.id) return { message: `${barnText.NOT_ID_BARN} ${id}!` };

      return { barn };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // данные об имен пользователей всех амбаров
  async findAllBarnsUsername(noname: string): Promise<IBarnsUsernamesResponse> {
    try {
      const barns = await this.barnModel.findAll({
        attributes: ['username', 'userId'],
      });

      if (!barns.length) return { message: barnText.NOT_USERNAME_BARNS };

      const barnsMapValues = [
        ...new Map(barns.map((barn) => [barn.userId, barn])).values(),
      ];

      if (!barnsMapValues.length)
        return { message: barnText.NOT_USERNAME_BARNS };

      const usernames = barnsMapValues.filter(
        (barn) => barn.username !== noname,
      );

      return { usernames };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск продуктов по userId в амбаре
  async findAllBarnsUserId(userId: number): Promise<IBarnsResponce> {
    try {
      const barns = await this.barnModel.findAll({ where: { userId } });
      if (barns.length <= 0) return { message: barnText.NOT_BARNS };
      return { barns };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // поиск амбара по userId и productId
  async findOneBarnUserIdAndProductId({
    userId,
    productId,
  }: IUserIdAndProductId): Promise<IBarnResponce> {
    try {
      if (!userId || !productId) {
        return {
          error_message: barnText.ID_ERROR,
        };
      }

      const options = { where: { userId, productId } };
      const barn = await this.barnModel.findOne(options);
      if (!barn?.id) return { message: barnText.NOT_BARN };
      return { barn };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Добавить товар в амбар
  async createBarn(createdBarnDto: CreatedBarnDto) {
    try {
      const {
        userId,
        productId,
        location,
        newStock,
        usedStock,
        brokenStock,
        lostNewStock,
        lostBrokenStock,
        lostUsedStock,
      } = createdBarnDto;

      // Проверка на корректность значений
      if (!userId || !productId || !location) {
        return { error_message: 'Неправельные данные для создания амбара!' };
      }

      // Поиск пользователя укоратить метод
      const { username } = await this.usersService.findOne({
        where: { id: +userId },
      });
      if (!username) return { message: `Пользователь не найден` };

      // Поиск продукта
      const { product, error_message: productError } =
        await this.productsService.findOneProduct(+productId);

      if (productError) return { error_message: productError };

      // Проверка единиц измерения и другие проверки...
      // const isPieceUnit = product.unit === 'ədəd';
      // const isWeightUnit = product.unit === 'kg';
      // const isLengthUnit = product.unit === 'metr';

      // if (isWeightUnit && newStock <= 0.001) {
      //   return {
      //     error_message: `Минимальное количество для единицы измерения 0.001 kg (1 грамм)`,
      //   };
      // }

      // if (isLengthUnit && newStock <= 0.01) {
      //   return {
      //     error_message: `Минимальное количество для единицы измерения 0.01 metr (1 см)`,
      //   };
      // }

      // if (isPieceUnit && !Number.isInteger(newStock)) {
      //   return {
      //     error_message:
      //       'Количество товара должно быть целым числом из-за того, что товар тип штучный',
      //   };
      // }

      // Поиск записи в анбаре для данного пользователя и продукта
      const existingBarn = await this.findOneBarnUserIdAndProductId({
        userId,
        productId,
      });

      if (existingBarn?.barn) {
        return { message: `Уже есть амбар №${existingBarn.barn.id} !` };
      }

      if (existingBarn?.error_message) {
        return { error_message: existingBarn.error_message };
      }

      const { name, azencoCode, price, type, img, unit } = product;

      // для реального количества
      const newTotalPrice: number = +newStock * +price;
      const usedTotalPrice: number = +usedStock * +price;
      const brokenTotalPrice: number = +brokenStock * +price;

      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +totalStock * +price;

      // для потерянного количества
      const lostNewTotalPrice = +lostNewStock * +price;
      const lostUsedTotalPrice = +lostUsedStock * +price;
      const lostBrokenTotalPrice = +lostBrokenStock * +price;

      const lostTotalStock: number =
        +lostNewStock + +lostUsedStock + +lostBrokenStock;

      const lostTotalPrice: number = +lostTotalStock * +price;

      const barn: Barn = await this.barnModel.create<Barn>({
        userId,
        username,
        productId,
        name,
        azencoCode,
        price,
        type,
        unit,
        img,
        location,

        // stock
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        totalStock,

        // price total stock
        newTotalPrice,
        usedTotalPrice,
        brokenTotalPrice,
        totalPrice,

        // lost
        lostNewStock: +lostNewStock || 0,
        lostUsedStock: +lostUsedStock || 0,
        lostBrokenStock: +lostBrokenStock || 0,
        lostTotalStock,

        // lost total price
        lostNewTotalPrice,
        lostUsedTotalPrice,
        lostBrokenTotalPrice,
        lostTotalPrice,
      });

      // Создание сообщения о создании амбара для истории
      const message: string = `Новый aмбар №${barn.id} !  
      Складчик: ${barn.username}; 
      Товар: ${barn.name}; 
      Новые: ${barn.newStock}; 
      Использованные: ${barn.usedStock}; 
      Сломанные: ${barn.brokenStock}; 
      Потерянно-новые: ${barn.lostNewStock}; 
      Потерянные-использованные: ${barn.lostUsedStock}; 
      Потерянно-сломанные: ${barn.lostBrokenStock};
      - ${barn.unit};`;

      await this.historyService.createHistory({
        message,
        userId,
        username: barn.username,
      });

      return { barn, message };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  // вычитание с анбара
  async minusAnbarOrder({
    anbarId,
    newStock,
    usedStock,
    brokenStock,
  }: IMinusAnbarOrder) {
    if (!anbarId) return { error_message: 'нет anbarId!' };
    if (!newStock || !usedStock || !brokenStock) {
      return { error_message: 'Количество в заказе не указано!' };
    }

    const { barn, error_message } = await this.findOneBarnId(anbarId);

    if (error_message) return { error_message };
    if (!barn) return { error_message: 'Склад не найден.' };
    if (!barn.newStock) return { error_message: 'нет запаса на складе' };
    if (!barn.newStock) return { error_message: 'нет запаса на складе' };
    if (!barn.newStock) return { error_message: 'нет запаса на складе' };
    if (!barn.newStock) return { error_message: 'нет запаса на складе' };
    if (!barn.price) return { error_message: 'Цена не указана.' };

    if (newStock <= 0) {
      return { error_message: 'Неверное количество товара для заказа.' };
    }

    if (+barn.newStock < +newStock) {
      return {
        error_message: `Недостаточное количество товара "${barn.name}" на складе.`,
      };
    }

    // operation minus
    barn.newStock = +barn.newStock - +newStock;
    barn.usedStock = +barn.usedStock - +usedStock;
    barn.brokenStock = +barn.brokenStock - +brokenStock;

    const totalStock = +barn.newStock + +barn.usedStock + +barn.brokenStock;
    barn.totalStock = +totalStock;

    barn.totalPrice = +totalStock * barn.price;

    barn.save();
    return { barn };
  }

  // обновление амбара
  async updateBarn(updatedAnbarDto: UpdatedBarnDto): Promise<IBarnResponce> {
    const { id, ...updateData } = updatedAnbarDto;
    const { barn, error_message } = await this.findOneBarnId(+id);
    if (error_message) return { error_message };

    barn.update(updateData);
    const message: string = `Складчик: ${barn.username} обновил амбар №${barn.id}!`;
    return { barn, message };
  }

  // удаление амбара
  async removeBarn(id: number): Promise<IBarnResponce> {
    const { barn, error_message } = await this.findOneBarnId(id);

    if (error_message) return { error_message };

    const { userId, username, name, unit, azencoCode, totalStock } = barn;

    const message: string = `Амбар №${id} успешно удален! Складчик: ${username} | Товар: ${name} | KOD: ${azencoCode} | Общий запас: ${totalStock} ${unit}`;

    await this.historyService.createHistory({ message, userId, username });

    await barn.destroy();

    return { message };
  }
}
