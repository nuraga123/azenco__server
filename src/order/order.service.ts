import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order } from './order.model';
import { UsersService } from 'src/users/users.service';
import { ArchiveService } from 'src/archive/archive.service';
import {
  IConfirmOrder,
  ICountAndRowsOrdersResponse,
  IOrderQuery,
  IOrderResponse,
  IOrdersResponse,
  ISendOrder,
  IValidateStocks,
} from './types';
import { ErrorService } from 'src/errors/errors.service';
import { BarnService } from 'src/barn/barn.service';
import { NewOrderDto } from './dto/new-order.dto';

@Injectable()
export class OrderService {
  // Инициализация зависимостей и логгера
  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    private readonly usersService: UsersService,
    private readonly barnService: BarnService,
    private readonly errorService: ErrorService,
    private readonly archiveService: ArchiveService,
  ) {
    /**/
  }

  // Поиск всех заказов
  async findAllOrders(): Promise<IOrdersResponse> {
    try {
      const orders = await this.orderModel.findAll();
      if (!orders.length) return { error_message: 'Список заказов пуст!' };
      return { orders };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Получение всех заказов с подсчетом
  async findAndCountAllOrders(
    query: IOrderQuery,
  ): Promise<ICountAndRowsOrdersResponse> {
    try {
      const { count, rows } = await this.orderModel.findAndCountAll({
        limit: +query.limit,
        offset: +query.offset * 10,
      });

      return { count, rows };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск заказа по ID
  async findOrderById(orderId: number): Promise<IOrderResponse> {
    try {
      const order = await this.orderModel.findByPk(orderId);
      if (!order) return { error_message: 'Заказ не найден!' };
      return { order };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск всех заказов одного клиента
  async findOrdersByClientId(clientId: number) {
    try {
      return await this.orderModel.findAll({
        where: { clientId },
      });
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // sayıların düzgünlüyünü yoxlama
  validateStockValues({
    newStock,
    usedStock,
    brokenStock,
    barn,
  }: IValidateStocks): string {
    const message: string = ' materialların sayı ';

    const messageNotNumber: string = ` ${message} rəqəm deyil!`;
    if (isNaN(+newStock)) return `Yeni ${messageNotNumber}`;
    if (isNaN(+usedStock)) return `İşlənmiş ${messageNotNumber}`;
    if (isNaN(+brokenStock)) return `Yararsız ${messageNotNumber}`;

    const messageMinusNumber: string = ` ${message} ola bilməz!`;
    if (+newStock < 0) return `Yeni ${messageMinusNumber}`;
    if (+usedStock < 0) return `İşlənmiş ${messageMinusNumber}`;
    if (+brokenStock < 0) return `Yararsız ${messageMinusNumber}`;

    const messageFC: (type: string) => string = (type: string) =>
      `daha çox ${type} material tələb edirsiniz`;

    if (barn) {
      if (+newStock > +barn.newStock) return messageFC('Yeni');
      if (+usedStock > +barn.usedStock) return messageFC('İşlənmiş');
      if (+brokenStock > +barn.brokenStock) return messageFC('Yararsız');
    }

    return '';
  }

  // Создание заказа
  async createOrder(newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    try {
      const {
        barnId,
        clientId,
        clientLocation,
        newStock,
        usedStock,
        brokenStock,
        clientMessage,
      } = newOrderDto;

      // Поиск клиента по ID
      const { user: client, error_message: clientError } =
        await this.usersService.findOneById(clientId);

      if (clientError) return { error_message: clientError };

      // Поиск склада по ID
      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnId(barnId);

      if (barnError) return { error_message: barnError };

      const validateError: string = this.validateStockValues({
        newStock,
        usedStock,
        brokenStock,
        barn,
      });

      if (validateError) return { error_message: validateError };

      // Подсчет общего количества и общей цены
      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +barn.price * +totalStock;

      // Sifariş təsvirini yaratma
      const info: string = `Sorğu edən Anbardar: ${client.username} ${clientLocation} - dən sifariş etdi: yeni - ${newStock} | işlənmiş - ${usedStock} | yararsız - ${brokenStock} | ${barn.unit} ${barn.productName}; ${barn.username} tərəfindən ${barn.location} - dən`;

      // Создание заказа
      const order = await this.orderModel.create({
        status: 'новый_заказ',
        clientLocation,
        clientId: +client.id,
        clientUserName: client.username,
        barnUserId: barn.userId,
        barnId: +barn.id,
        barnUsername: barn.username,
        productName: barn.productName,
        azencoCode: barn.azencoCode,
        price: +barn.price,
        unit: barn.unit,
        barnLocation: barn.location,
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        lostNewStock: 0,
        lostUsedStock: 0,
        lostBrokenStock: 0,
        totalStock,
        totalPrice,
        info,
        clientMessage,
      });

      // Создание записи в истории
      const message: string = `Yeni sifariş №${order.id}! ${info} | status: ${order.status} | `;

      await this.archiveService.createArchive({
        ...order,
        userId: +client.id,
        username: client.username,
        message,
        barnId,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод для подтверждения заказа складчиком
  async confirmOrder({
    orderId,
    barnUsername,
    barnUserId,
    barnId,
  }: IConfirmOrder): Promise<IOrderResponse> {
    try {
      // Поиск пользователя по имени
      const user = await this.usersService.findOne({
        where: {
          username: barnUsername,
          id: barnUserId,
        },
      });

      // Поиск склада по ID
      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnId(barnId);

      if (barn.orderStatus)
        return {
          message: 'artıq sifariş olunub',
        };

      if (barnError) return { error_message: barnError };

      // Поиск заказа по ID
      const { order, error_message } = await this.findOrderById(orderId);
      if (error_message) return { error_message };

      // Проверка, что пользователь существует и соответствует складчику в заказе
      if (
        user.username !== order.barnUsername &&
        order.barnUserId !== barnUserId &&
        barn.username !== order.barnUsername
      ) {
        return {
          message: 'siz sifarişdə göstərilən anbardar deyilsiniz',
        };
      }

      // Обновление статуса и описания заказа
      const message = `Anbardar: ${order.barnUsername} sifarişi qəbul etdi №${order.id} müştəridən ${order.clientUserName}`;

      order.status = 'заказ_принял_складчик';
      order.description = message;

      barn.orderStatus = true;

      // Сохранение обновленного заказа
      await order.save();
      await barn.save();

      await this.archiveService.createArchive({
        ...order,
        message,
        barnId: barnId,
        userId: barnUserId,
        username: barnUsername,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод для отправки заказа
  async sendOrder({
    orderId,
    barnUsername,
    barnUserId,
    barnId,
    driverName,
    carNumber,
    userSelectedDate,
  }: ISendOrder): Promise<IOrderResponse> {
    try {
      // Поиск пользователя по имени
      const user = await this.usersService.findOne({
        where: {
          username: barnUsername,
          id: barnUserId,
        },
      });

      // Поиск склада по ID
      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnId(barnId);

      if (barnError) return { error_message: barnError };

      // Поиск заказа по ID
      const { order, error_message } = await this.findOrderById(orderId);
      if (error_message) return { error_message };

      if (order.status !== 'заказ_принял_складчик') {
        return {
          message: 'zəhmət olmasa əvvəlcə sifarişi təsdiqləyin !',
        };
      }

      // Проверка, что пользователь существует и соответствует складчику в заказе
      if (
        user.username !== order.barnUsername &&
        order.barnUserId !== barnUserId &&
        barn.username !== order.barnUsername
      ) {
        return {
          message: 'siz sifarişdə göstərilən anbardar deyilsiniz',
        };
      }

      if (!barn.orderStatus) {
        return {
          message: 'zəhmət olmasa əvvəlcə sifarişi təsdiqləyin !',
        };
      }

      const { newStock, usedStock, brokenStock } = order;

      this.validateStockValues({
        barn,
        newStock,
        usedStock,
        brokenStock,
      });

      await this.barnService.reduceStocksBarn({
        barnId,
        newStock,
        usedStock,
        brokenStock,
        driverName,
        carNumber,
        userSelectedDate,
        recipientName: order.clientUserName,
        fromLocation: order.barnLocation,
        toLocation: order.clientLocation,
      });

      const info: string = `Заказ №${order.id} успешно отправлен! В вашем складе №${barn.id} на месте: новые - ${barn.newStock} | использованные - ${barn.usedStock} | сломанные - ${barn.brokenStock} | ${barn.unit} ${barn.name}`;

      order.status = 'заказ_отправлен_клиенту';
      order.info = info;

      const message: string = `${info} status: ${order.status} | senderName: ${barnUsername} - ${order.description}`;

      await order.save();
      await barn.save();

      this.archiveService.createArchive({
        userId: barn.userId,
        username: barn.username,
        message: info + ` status: ${order.status}`,
        barnId,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод для успешной доставки заказа
  async successDeliver({
    id,
    clientBarnId,
  }: {
    id: number;
    clientBarnId: number;
  }): Promise<IOrderResponse> {
    try {
      const { order, error_message } = await this.findOrderById(id);
      if (error_message) return { error_message };

      // Проверяем, существует ли у клиента склад с данным продуктом
      const { barn: clientBarn, error_message: barnError } =
        await this.barnService.findOneBarnId(+clientBarnId);

      if (barnError) return { error_message: barnError };

      if (!clientBarn) {
        const { clientId, newStock, brokenStock, usedStock, clientLocation } =
          order;

        // Если склада с данным продуктом не существует, создаем новый
        const createdBarnDto = {
          userId: +clientId,
          productId: order.productId,
          newStock,
          usedStock,
          brokenStock,
          location: clientLocation,
        };

        const { barn: newBarn, error_message } =
          await this.barnService.createBarn(createdBarnDto);

        if (error_message) return { error_message };

        newBarn.save();

        const message = `Новый склад №${newBarn.id} создан для клиента ${newBarn.username}. Заказ №${order.id} успешно доставлен! Клиент: ${order.clientUserName} по адресу: ${order.clientLocation}`;

        // Обновляем статус заказа и описание
        order.status = 'заказ_успешно_доставлен';
        order.description = message;

        await this.archiveService.createHistory({
          userId: newBarn.userId,
          username: newBarn.username,
          message,
        });

        return { order, message };
      } else {
        // Если склад с данным продуктом существует, увеличиваем количество продукта на складе
        clientBarn.newStock = +clientBarn.newStock + (+order.newStock || 0);
        clientBarn.usedStock = +clientBarn.usedStock + (+order.usedStock || 0);
        clientBarn.brokenStock =
          +clientBarn.brokenStock + (+order.brokenStock || 0);
        clientBarn.lostStock =
          +clientBarn.lostStock + (+order.lostNewStock || 0);

        const totalStock =
          +clientBarn.newStock +
          +clientBarn.usedStock +
          +clientBarn.brokenStock;

        const totalPrice = +totalStock * +clientBarn.price;

        clientBarn.totalStock = totalStock;
        clientBarn.totalPrice = totalPrice;

        await clientBarn.save();

        // Обновляем статус заказа и описание
        const message = `Заказ №${order.id} успешно доставлен! В складе клиента №${clientBarn.id} теперь: новые - ${clientBarn.newStock} | использованные - ${clientBarn.usedStock} | сломанные - ${clientBarn.brokenStock}`;

        order.status = 'заказ_успешно_доставлен';
        order.description = message;

        await order.save();
        await this.archiveService.createHistory({
          userId: clientBarn.userId,
          username: clientBarn.username,
          message,
        });

        return { order, message };
      }
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод для обработки заказа с потерей и повреждениями
  async deliverWithIssues(id: number, issues: any): Promise<IOrderResponse> {
    try {
      const { order, error_message } = await this.findOrderById(id);
      if (error_message) return { error_message };

      // Обработка потерь и повреждений
      // ...

      // Обновляем статус заказа и описание
      order.status = 'заказ_доставлен с потерей и повреждениями';
      order.description = `Заказ №${order.id} доставлен с потерей и повреждениями! ${issues}`;

      await order.save();

      // Создание записи в истории
      await this.archiveService.createHistory({
        userId: order.clientId,
        username: order.clientUserName,
        message: order.description,
      });

      return { order, message: order.description };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }
}
