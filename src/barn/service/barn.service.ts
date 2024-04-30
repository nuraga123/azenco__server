import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Barn } from '../model/barn.model';
import { IBarnText, IUserIdAndProductId } from '../types';

import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { ProductsService } from 'src/products/products.service';
import { ErrorService } from 'src/errors/errors.service';

// import { CreatedAnbarDto } from '../dto/create-anbar.dto';
// import { UpdatedAnbarDto } from '../dto/update-anbar.dto';

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
  async findAll() {
    try {
      const barns = await this.barnModel.findAll();
      if (!barns?.length) return { message: this.barnText.NOT_BARNS };
      return { barns };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // поиск амбара по id
  async findOneAnbarId(id: number) {
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
  async getAnbarsUsernames(myUserNameBarn: string) {
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
  async findAllByUserId(userId: number) {
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

/*
  // Добавить товар в амбар
  async createNewAnbar(createdAnbarDto: CreatedAnbarDto) {
    try {
      const {
        userId,
        productId,
        location,
        newStock,
        usedStock,
        brokenStock,
        lostStock,
      } = createdAnbarDto;

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
      const existingAnbar = await this.findAnbarByUserIdAndProductId({
        userId,
        productId,
      });

      this.logger.log(existingAnbar.anbar);

      if (existingAnbar.anbar) {
        return { error_message: 'такой анбар уже существует' };
      }

      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +totalStock * +product.price;

      const anbar: Barn = await this.anbarModel.create<Barn>({
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
      const message: string = `Новый Амбар! Складчик: ${anbar.username} Товар: ${anbar.name} | новые - ${anbar.newStock} | использованные - ${anbar.usedStock} | сломанные - ${anbar.brokenStock} | потерянные - ${anbar.lostStock} | ${anbar.unit}`;

      await this.historyService.createHistory({
        message,
        userId,
        username: anbar.username,
      });

      return { anbar, message };
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
  }: {
    anbarId: number;
    newStock: number;
    usedStock: number;
    brokenStock: number;
  }) {
    if (!anbarId) return { error_message: 'нет anbarId!' };
    if (!newStock || !usedStock || !brokenStock) {
      return { error_message: 'Количество в заказе не указано!' };
    }

    const { anbar, error_message } = await this.findOneAnbarId(anbarId);

    if (error_message) return { error_message };
    if (!anbar) return { error_message: 'Склад не найден.' };
    if (!anbar.newStock) return { error_message: 'нет запаса на складе' };
    if (!anbar.newStock) return { error_message: 'нет запаса на складе' };
    if (!anbar.newStock) return { error_message: 'нет запаса на складе' };
    if (!anbar.newStock) return { error_message: 'нет запаса на складе' };
    if (!anbar.price) return { error_message: 'Цена не указана.' };

    if (newStock <= 0) {
      return { error_message: 'Неверное количество товара для заказа.' };
    }

    if (+anbar.newStock < +newStock) {
      return {
        error_message: `Недостаточное количество товара "${anbar.name}" на складе.`,
      };
    }

    // save prev state
    anbar.previousStock = +anbar.totalStock;
    anbar.previousTotalPrice = +anbar.totalPrice;

    // operation minus
    anbar.newStock = +anbar.newStock - +newStock;
    anbar.usedStock = +anbar.usedStock - +usedStock;
    anbar.brokenStock = +anbar.brokenStock - +brokenStock;

    const totalStock = +anbar.newStock + +anbar.usedStock + +anbar.brokenStock;
    anbar.totalStock = +totalStock;

    anbar.totalPrice = +totalStock * anbar.price;

    anbar.save();
    return { anbar };
  }

  async updateAnbar(updatedAnbarDto: UpdatedAnbarDto): Promise<IBarnResponce> {
    const { id, ...updateData } = updatedAnbarDto;
    const { anbar, error_message } = await this.findOneAnbarId(+id);
    if (error_message) return { error_message };

    anbar.update(updateData);
    const message: string = `Складчик: ${anbar.username} обновил амбар №${anbar.id}!`;
    return { anbar, message };
  }

  async removeAnbar(id: number): Promise<IBarnResponce> {
    const { anbar, error_message } = await this.findOneAnbarId(id);

    if (error_message) return { error_message };

    const { userId, username, name, unit, azencoCode, totalStock } = anbar;

    if (+totalStock !== 0) {
      const message: string = `Амбар №${id} успешно удален! Складчик: ${username} | Товар: ${name} | KOD: ${azencoCode} | Общий запас: ${totalStock} ${unit}`;
      await this.historyService.createHistory({ message, userId, username });

      await anbar.destroy();

      return { message };
    }
  }

  */
}
