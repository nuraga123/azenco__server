import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Barn } from '../model/barn.model';
import {
  IBarnResponce,
  IBarnsResponce,
  IBarnsUsernamesResponse,
  IBarnText,
  IMinusAnbarOrder,
  IUserIdAndProductId,
} from '../types';

import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { ErrorService } from 'src/errors/errors.service';
import { CreatedBarnDto } from '../dto/create-barn.dto';
import { UpdatedBarnDto } from '../dto/update-barn.dto';

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

  barnText: IBarnText = {
    ID_ERROR: 'ID Меньше или равно 0 !',
    NOT_BARN: 'Нет Амбара !',
    NOT_BARNS: 'Нетy Амбаров !',
    NOT_ID_BARN: 'В базе данных нет амбара с ID:',
    NOT_USERNAME_BARNS: 'Нет имен амбаров !',
    NOT_PRODUCT_ID: 'нет user ID  или продукта ID',
  };

  // получение всех амбаров
  async findAll(): Promise<IBarnsResponce> {
    try {
      const barns = await this.barnModel.findAll();
      if (!barns?.length) return { message: this.barnText.NOT_BARNS };
      return { barns };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // поиск амбара по id
  async findOneAnbarId(id: number): Promise<IBarnResponce> {
    try {
      if (+id <= 0) return { error_message: this.barnText.ID_ERROR };

      const barn = await this.barnModel.findOne({ where: { id } });
      if (!barn?.id) return { message: `${this.barnText.NOT_ID_BARN} ${id}!` };

      return { barn };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // данные об имен пользователей анбара
  async getAnbarsUsernames(
    myUserNameBarn: string,
  ): Promise<IBarnsUsernamesResponse> {
    try {
      const barns = await this.barnModel.findAll({
        attributes: ['username', 'userId'],
      });

      if (!barns.length) return { message: this.barnText.NOT_USERNAME_BARNS };

      const barnsMapValues = [
        ...new Map(barns.map((barn) => [barn.userId, barn])).values(),
      ];

      if (!barnsMapValues.length)
        return { message: this.barnText.NOT_USERNAME_BARNS };

      const usernames = barnsMapValues.filter(
        (barn) => barn.username !== myUserNameBarn,
      );

      return { usernames };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск продуктов по userId в анбаре
  async findAllByUserId(userId: number): Promise<IBarnsResponce> {
    try {
      const barns = await this.barnModel.findAll({ where: { userId } });
      if (barns.length <= 0) return { message: this.barnText.NOT_BARNS };
      return { barns };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  async findBarnByUserIdAndProductId({
    userId,
    productId,
  }: IUserIdAndProductId) {
    try {
      if (!userId || !productId) {
        return {
          error_message: this.barnText.ID_ERROR,
        };
      }

      const options = { where: { userId, productId } };
      const barn = await this.barnModel.findOne(options);
      if (!barn?.id) return { error_message: this.barnText.NOT_BARN };
      return { barn };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Добавить товар в амбар
  async createNewAnbar(createdBarnDto: CreatedBarnDto) {
    try {
      const {
        userId,
        productId,
        location,
        newStock,
        usedStock,
        brokenStock,
        lostStock,
      } = createdBarnDto;

      // Проверка на корректность значений
      if (!userId || !productId) {
        return { error_message: 'Некорректные данные для добавления в амбар' };
      }

      // Поиск пользователя укоратить метод
      const user = await this.usersService.findOne({ where: { id: userId } });
      if (!user?.id) return { error_message: `Пользователь не найден` };

      // Поиск продукта
      const { product } = await this.productsService.findOneProduct(+productId);

      if (!product)
        return { error_message: `Товар с ID ${productId} не найден` };

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
      const existingAnbar = await this.findBarnByUserIdAndProductId({
        userId,
        productId,
      });

      this.logger.log(existingAnbar);

      if (existingAnbar) {
        return { error_message: 'такой анбар уже существует' };
      }

      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +totalStock * +product.price;

      const barn: Barn = await this.barnModel.create<Barn>({
        username: user.username,
        azencoCode: product.azencoCode,
        name: product.name,
        type: product.type,
        img: product.img,
        unit: product.unit,
        price: +product.price,
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        lostStock: +lostStock || 0,
        previousStock: 0,
        previousTotalPrice: 0,
        userId,
        productId,
        location,
        totalStock,
        totalPrice,
      });

      const message: string = `Новый Амбар! Складчик: ${barn.username} Товар: ${barn.productName} | новые - ${barn.newStock} | использованные - ${barn.usedStock} | сломанные - ${barn.brokenStock} | потерянные - ${barn.lostStock} | ${barn.unit}`;

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

    const { barn, error_message } = await this.findOneAnbarId(anbarId);

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
        error_message: `Недостаточное количество товара "${barn.productName}" на складе.`,
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

  async updateAnbar(updatedAnbarDto: UpdatedBarnDto): Promise<IBarnResponce> {
    const { id, ...updateData } = updatedAnbarDto;
    const { barn, error_message } = await this.findOneAnbarId(+id);
    if (error_message) return { error_message };

    barn.update(updateData);
    const message: string = `Складчик: ${barn.username} обновил амбар №${barn.id}!`;
    return { barn, message };
  }

  async removeAnbar(id: number): Promise<IBarnResponce> {
    const { barn, error_message } = await this.findOneAnbarId(id);

    if (error_message) return { error_message };

    const { userId, username, productName, unit, azencoCode, totalStock } =
      barn;

    if (+totalStock !== 0) {
      const message: string = `Амбар №${id} успешно удален! Складчик: ${username} | Товар: ${productName} | KOD: ${azencoCode} | Общий запас: ${totalStock} ${unit}`;
      await this.historyService.createHistory({ message, userId, username });

      await barn.destroy();

      return { message };
    }
  }
}
