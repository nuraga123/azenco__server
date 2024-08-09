import { Injectable } from '@nestjs/common';
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
  IUserIdAndProductId,
} from './types';

import { UsersService } from 'src/users/users.service';
import { ArchiveService } from 'src/archive/archive.service';
import { ProductsService } from 'src/products/products.service';
import { ErrorService } from 'src/errors/errors.service';
import { CreatedBarnDto } from './dto/create-barn.dto';
import { UpdatedBarnDto } from './dto/update-barn.dto';
import { StocksBarnDto } from './dto/stocks-barn.dto';
import { barnText } from './text/barnText';

@Injectable()
export class BarnService {
  constructor(
    @InjectModel(Barn)
    private barnModel: typeof Barn,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly archiveService: ArchiveService,
    private readonly errorService: ErrorService,
  ) {
    /**/
  }

  validateStockForUnit(barn: Barn): { message: string } {
    let message: string = '';

    const {
      unit,
      newStock,
      usedStock,
      brokenStock,

      // lost
      lostNewStock,
      lostBrokenStock,
      lostUsedStock,
    } = barn;

    const stocks = [
      { stock: newStock, type: 'новый' },
      { stock: usedStock, type: 'использованный' },
      { stock: brokenStock, type: 'не пригодный' },
      // lost
      { stock: lostNewStock, type: 'потерянно-новый' },
      { stock: lostBrokenStock, type: 'потерянно-новый' },
      { stock: lostUsedStock, type: 'потерянно-новый' },
    ];

    const checkIntegerStocks = (
      stocks: { stock: number; type: string }[],
    ): { message: string } => {
      const nonIntegerStocks = stocks.filter(
        (item) => !Number.isInteger(item.stock),
      );

      if (nonIntegerStocks.length) {
        const message = nonIntegerStocks
          .map((item) => `${item.type}: ${item.stock}`)
          .join(', ');

        return { message: `Нецелые числа: ${message}` };
      }
    };

    if (unit === 'штук') {
      return checkIntegerStocks(stocks);
    }

    // кг
    if (unit === 'набор') {
      const invalidStock = Object.entries(stocks).filter((stock) => stock);

      if (invalidStock) {
        message +=
          'Минимальное количество для единицы измерения килограмм должно быть больше или равно нулю! ';
      }
    }

    // литр
    if (unit === 'литр' || unit === 'см') {
      const invalidStock = Object.entries(stocks).find((stock) => stock);

      if (invalidStock !== undefined) {
        message = `Минимальное количество для единицы измерения ${unit} должно быть больше или равно нулю!`;
      } else {
        const invalidStockBelowMin = Object.entries(stocks).find(
          (stock) => stock,
        );

        if (invalidStockBelowMin !== undefined) {
          message = `Минимальное количество для единицы измерения ${unit} должно быть не менее 0.001!`;
        }
      }
    } else {
      message = 'Неизвестная единица измерения';
    }
    return { message };
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
      if (+id <= 0) return { message: barnText.ID_ERROR };

      const barn = await this.barnModel.findOne({ where: { id } });

      if (!barn?.id) {
        return { message: `${barnText.NOT_ID_BARN} - ${id}` };
      }

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
  async createBarn(createdBarnDto: CreatedBarnDto): Promise<IBarnResponce> {
    try {
      const {
        userId,
        productId,
        location,
        newStock,
        usedStock,
        brokenStock,
        senderName,
        driverName,
        carNumber,
        userSelectedDate,
        fromLocation,
      } = createdBarnDto;

      // Проверка на корректность значений
      if (!userId || !productId || !location) {
        return { error_message: barnText.WRONG_DATA };
      }

      if (+newStock + +usedStock + +brokenStock <= 0) {
        return { error_message: barnText.STOCKS_ERROR };
      }

      // Поиск пользователя укоратить метод
      const { username } = await this.usersService.findOne({
        where: { id: +userId },
      });

      if (!username) return { error_message: `anbardar tapılmadı !` };

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
        return {
          error_message: `Material artıq ${existingBarn.barn.username} anbarında yaradılıb !`,
        };
      }

      if (existingBarn?.error_message) {
        return { error_message: existingBarn.error_message };
      }

      // !!! переименовать name на productName
      const { name, azencoCode, price, unit } = product;

      // для реального количества
      const newTotalPrice: number = +newStock * +price;
      const usedTotalPrice: number = +usedStock * +price;
      const brokenTotalPrice: number = +brokenStock * +price;

      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +totalStock * +price;

      const barn: Barn = await this.barnModel.create<Barn>({
        productName: name,
        userId,
        username,
        productId,
        azencoCode,
        price,
        unit,
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
        lostNewStock: 0,
        lostUsedStock: 0,
        lostBrokenStock: 0,
        lostTotalStock: 0,
        // lost total price
        lostNewTotalPrice: 0,
        lostUsedTotalPrice: 0,
        lostBrokenTotalPrice: 0,
        lostTotalPrice: 0,
        orderStatus: false,
      });

      // Создание сообщения о создании амбара для истории
      const message = `Material yaradılmışdır! Anbardar: ${
        //
        barn.username
      } Məhsul: ${
        //
        barn.productName
      } - ${barn.unit}; ${
        //
        barn.newStock ? `Yenilər: ${barn.newStock};` : ''
      } ${
        //
        barn.usedStock ? `İstifadə olunmuşlar: ${barn.usedStock};` : ''
      } ${
        //
        barn.brokenStock ? `Sınıqlar: ${barn.brokenStock};` : ''
      } ${
        //
        senderName ? `Göndərən: ${senderName};` : ''
      } ${
        //
        driverName ? `Sürücü: ${driverName};` : ''
      } ${
        //
        carNumber ? `Avtomobil nömrəsi: ${carNumber};` : ''
      } ${
        //
        fromLocation ? `Haradan: ${fromLocation};` : ''
      } ${
        //
        location ? `material ünvanı: ${location};` : ''
      } ${
        //
        userSelectedDate ? `Tarix: ${userSelectedDate};` : ''
      }`;

      await this.archiveService.createArchive({
        movementType: 'создан__yaradılmışdır',
        message,
        // göndərən - Отправитель
        senderName: senderName ? senderName : 'Yazılmayıb',
        // номер и водител
        driverName: driverName ? driverName : 'Yazılmayıb',
        carNumber: carNumber ? carNumber : 'Yazılmayıb',
        // откуда и где будет материал и дата
        fromLocation: fromLocation ? fromLocation : 'Yazılmayıb',
        toLocation: barn.location,
        userSelectedDate,
        // данные амбара
        barnId: barn.id,
        userId,
        username,
        azencoCode,
        unit,
        price,
        productName: barn.productName,
        newStock: +barn.newStock,
        usedStock: +barn.usedStock,
        brokenStock: +barn.brokenStock,
        totalStock: +barn.totalStock,
        lostNewStock: +barn.lostNewStock,
        lostUsedStock: +barn.lostUsedStock,
        lostBrokenStock: +barn.lostBrokenStock,
        lostTotalStock: +barn.lostTotalStock,
      });

      return { barn, message };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  async addStocksBarn(stocksBarnDto: StocksBarnDto): Promise<IBarnResponce> {
    try {
      const {
        barnId,
        userSelectedDate,
        fromLocation,
        toLocation,
        newStock,
        usedStock,
        brokenStock,
        driverName,
        carNumber,
        senderName,
      } = stocksBarnDto;

      if (!barnId || !userSelectedDate || !fromLocation || !toLocation) {
        return { error_message: barnText.NOT_INPUT_DATA };
      }

      if (
        newStock < 0 ||
        typeof newStock !== 'number' ||
        usedStock < 0 ||
        typeof usedStock !== 'number' ||
        brokenStock < 0 ||
        typeof brokenStock !== 'number'
      ) {
        return { error_message: barnText.STOCKS_ERROR };
      }

      const {
        message: FindMessage,
        error_message: FindErrorMessage,
        barn,
      } = await this.findOneBarnId(barnId);

      if (FindMessage) return { message: FindMessage };
      if (FindErrorMessage) return { error_message: FindErrorMessage };

      const { userId, username, azencoCode, productName, unit, price } = barn;

      // Обновление количества материала
      barn.newStock = +barn.newStock + +newStock;
      barn.usedStock = +barn.usedStock + +usedStock;
      barn.brokenStock = +barn.brokenStock + +brokenStock;
      barn.totalStock = +barn.newStock + +barn.usedStock + +barn.brokenStock;

      // Обновление итоговых цен материала
      barn.newTotalPrice = +barn.newStock * +price;
      barn.usedTotalPrice = +barn.usedStock * +price;
      barn.brokenTotalPrice = +barn.brokenStock * +price;
      barn.totalPrice = +barn.totalStock * +barn.price;

      await barn.save();

      const message = `Material Anbara əlavə olundu! Anbardar: ${username} | material: ${productName} - ${unit} | ${
        newStock ? `Yeni: ${newStock} | ` : ''
      }${usedStock ? `İstifadə olunmuş: ${usedStock} | ` : ''}${brokenStock ? `Sındırılmış: ${brokenStock}` : ''}`;

      await this.archiveService.createArchive({
        movementType: 'приход__gələn',
        barnId,
        userId,
        username,
        userSelectedDate,
        fromLocation,
        toLocation,
        message,
        productName,
        azencoCode,
        unit,
        price,
        newStock: +barn.newStock,
        usedStock: +barn.usedStock,
        brokenStock: +barn.brokenStock,
        totalStock: +barn.totalStock,
        lostNewStock: +barn.lostNewStock,
        lostUsedStock: +barn.lostUsedStock,
        lostBrokenStock: +barn.lostBrokenStock,
        lostTotalStock: +barn.lostTotalStock,
        carNumber,
        driverName,
        senderName,
        recipientName: barn.username,
      });

      return { message, barn };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
  }

  async reduceStocksBarn(stocksBarnDto: StocksBarnDto): Promise<IBarnResponce> {
    try {
      const {
        barnId,
        userSelectedDate,
        fromLocation,
        toLocation,
        newStock,
        usedStock,
        brokenStock,
        driverName,
        carNumber,
        recipientName,
      } = stocksBarnDto;

      if (!barnId || !userSelectedDate || !fromLocation || !toLocation) {
        return { error_message: barnText.NOT_INPUT_DATA };
      }

      if (
        newStock < 0 ||
        typeof newStock !== 'number' ||
        usedStock < 0 ||
        typeof usedStock !== 'number' ||
        brokenStock < 0 ||
        typeof brokenStock !== 'number'
      ) {
        return { error_message: barnText.STOCKS_ERROR };
      }

      const {
        message: FindMessage,
        error_message: FindErrorMessage,
        barn,
      } = await this.findOneBarnId(barnId);

      if (FindMessage) return { message: FindMessage };
      if (FindErrorMessage) return { error_message: FindErrorMessage };

      const { userId, username, azencoCode, productName, unit, price } = barn;

      if (
        newStock > barn.newStock ||
        usedStock > barn.usedStock ||
        brokenStock > barn.brokenStock
      ) {
        return { error_message: barnText.STOCKS_EXCEED_ERROR };
      }

      barn.newStock -= Number(newStock);
      barn.usedStock -= Number(usedStock);
      barn.brokenStock -= Number(brokenStock);
      barn.totalStock = +barn.newStock + +barn.usedStock + +barn.brokenStock;

      barn.newTotalPrice = +barn.newStock * +price;
      barn.usedTotalPrice = +barn.usedStock * +price;
      barn.brokenTotalPrice = +barn.brokenStock * +price;
      barn.totalPrice = +barn.totalStock * +barn.price;

      //const sumTotalStocks = +barn.totalStock + +barn.lostTotalStock;

      const message = `Material Anbardan azaldıldı! Anbardar: ${username} | Material: ${productName} - ${unit} | ${
        newStock ? `Yeni: ${newStock} | ` : ''
      }${usedStock ? `İstifadə olunmuş: ${usedStock} | ` : ''}${brokenStock ? `Sındırılmış: ${brokenStock}` : ''}`;

      await barn.save();

      await this.archiveService.createArchive({
        barnId,
        userId,
        username,
        userSelectedDate,
        movementType: 'расход__xərc',
        fromLocation,
        toLocation,
        message,
        productName,
        azencoCode,
        unit,
        price,
        newStock: barn.newStock,
        usedStock: barn.usedStock,
        brokenStock: barn.brokenStock,
        totalStock: barn.totalStock,
        carNumber,
        driverName,
        senderName: barn.username,
        recipientName,
      });

      return { message, barn };

      /* спросить если материал закончился делать ли  его списание */
      // const { message: removeMessage, error_message: removeErrorMessage } =
      //   await this.removeBarn(barn.id);
      // if (removeErrorMessage) return { error_message: removeErrorMessage };
      // return { message: `${message} və ${removeMessage}` };
    } catch (error) {
      return this.errorService.errorsMessage(error);
    }
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

    const {
      userId,
      username,
      productId,
      productName,
      azencoCode,
      unit,
      price,
      newStock,
      usedStock,
      brokenStock,
      totalStock,
      newTotalPrice,
      usedTotalPrice,
      brokenTotalPrice,
      totalPrice,
      lostNewStock,
      lostUsedStock,
      lostBrokenStock,
      lostTotalStock,
      lostNewTotalPrice,
      lostUsedTotalPrice,
      lostBrokenTotalPrice,
      lostTotalPrice,
    } = barn;

    const message: string = `Anbar №${id} uğurla silindi! Anbarçı: ${username} | Məhsul: ${productName} | KOD: ${azencoCode} | Ümumi ehtiyat: ${totalStock} - ${unit}`;

    await this.archiveService.createArchive({
      message,
      movementType: 'списание__silinmə',
      userId,
      username,
      productName,
      unit,
      barnId: id,
      productId,
      azencoCode,
      price,
      newStock,
      usedStock,
      brokenStock,
      totalStock,
      newTotalPrice,
      usedTotalPrice,
      brokenTotalPrice,
      totalPrice,
      lostNewStock,
      lostUsedStock,
      lostBrokenStock,
      lostTotalStock,
      lostNewTotalPrice,
      lostUsedTotalPrice,
      lostBrokenTotalPrice,
      lostTotalPrice,
    });

    await barn.destroy();

    return { message };
  }
}
