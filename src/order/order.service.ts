import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order } from './order.model';
import { UsersService } from 'src/users/users.service';
import { ArchiveService } from 'src/archive/archive.service';
import {
  IOherOrders,
  ICountAndRowsOrdersResponse,
  IMyOrders,
  IOrderQuery,
  IOrderResponse,
  IOrdersResponse,
  IValidateStocks,
} from './types';
import { ErrorService } from 'src/errors/errors.service';
import { BarnService } from 'src/barn/barn.service';
import { NewOrderDto } from './dto/new-order.dto';
import { ConfirmBarnUserDto } from './dto/confirm-barn-user.dto';

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
      if (!orders.length) return { error_message: 'Sifariş siyahısı boşdur !' };
      return { orders };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск всех заказов клиента который он заказал
  async findMyOrdersByClientIdAndClientUserName({
    clientId,
    clientUserName,
  }: IMyOrders): Promise<IOrdersResponse> {
    try {
      const filterUser = {
        where: {
          id: clientId,
          username: clientUserName,
        },
      };

      const { username } = await this.usersService.findOne(filterUser);

      if (!username?.length) return { error_message: 'istifadeci tapılmadı !' };

      const orders = await this.orderModel.findAll({
        where: {
          clientId,
          clientUserName,
        },
      });

      if (!orders.length) return { error_message: 'Sifariş siyahısı boşdur !' };

      return { orders };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Поиск всех заказов складчика у  которого заказывают
  async findOrderByBarnUserNameAndByBarnUserId({
    barnUsername,
    barnUserId,
  }: IOherOrders): Promise<IOrdersResponse> {
    try {
      if (!barnUsername && !barnUserId) {
        return {
          error_message: 'not vxodnix dannix',
        };
      }

      const ordersBarnUser = await this.orderModel.findAll({
        where: {
          barnUsername,
          barnUserId,
        },
      });

      const message: string =
        ordersBarnUser.length === 0
          ? 'Anbarınız üçün sifariş yoxdur'
          : `Anbarınızda ${ordersBarnUser.length}  sifariş tapıldı`;

      console.log(ordersBarnUser);

      return { orders: ordersBarnUser, message };
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
      if (!order) return { error_message: 'Sifariş tapılmadı!' };
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
    } else {
      return 'anbar yoxdur!';
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
        barn,
        newStock,
        usedStock,
        brokenStock,
      });

      if (validateError) return { error_message: validateError };

      // Подсчет общего количества и общей цены
      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +barn.price * +totalStock;

      // Sifariş təsvirini yaratma
      const info: string = `Sifariş edən şəxs: ${client.username} (ID: ${client.id}); ${clientLocation} - dən sifariş etdi Anbardar: ${barn.username} (ID: ${barn.userId}) tərəfindən ${barn.location} - dən ${
        newStock ? ` | yeni - ${+newStock}` : ''
      } ${usedStock ? ` | işlənmiş - ${+usedStock}` : ''} ${
        brokenStock ? ` | yararsız - ${+brokenStock}` : ''
      } | ${barn.unit} ${barn.productName};`;

      // Создание заказа
      const order = await this.orderModel.create({
        status: 'yeni_sifariş',
        clientId: +client.id,
        clientUserName: client.username,
        clientLocation,
        clientMessage,

        barnUserId: barn.userId,
        barnId: +barn.id,
        barnUsername: barn.username,
        barnLocation: barn.location,
        barnUserMessage: '',

        productId: barn.productId,
        productName: barn.productName,
        azencoCode: barn.azencoCode,
        price: +barn.price,
        unit: barn.unit,
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        lostNewStock: 0,
        lostUsedStock: 0,
        lostBrokenStock: 0,
        lostTotalStock: 0,
        totalStock: +totalStock,
        totalPrice: +totalPrice,
        info,
        //
        driverName: '',
        carNumber: '',
      });

      // Создание записи в истории
      const message: string = `Yeni sifariş №${order.id}! ${info} | status: ${order.status} | ${order.clientMessage}`;

      await this.archiveService.createArchive({
        barnId: +barn.id,
        userId: +client.id,
        username: client.username,
        userSelectedDate: new Date(`${order.createdAt}`).toLocaleString(),
        movementType: order.status,
        fromLocation: barn.location,
        toLocation: clientLocation,
        productName: barn.productName,
        azencoCode: barn.azencoCode,
        unit: barn.unit,
        price: +barn.price,
        newStock: +newStock || 0,
        usedStock: +usedStock || 0,
        brokenStock: +brokenStock || 0,
        totalStock,
        totalPrice,
        message,
        driverName: '',
        carNumber: '',
        recipientName: client.username,
        senderName: barn.username,
        // Для потерянные
        lostNewStock: 0,
        lostUsedStock: 0,
        lostBrokenStock: 0,
        lostTotalStock: 0,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод для подтверждения заказа складчиком
  async confirmOrderBarnUser(
    confirmBarnUserDto: ConfirmBarnUserDto,
  ): Promise<IOrderResponse> {
    try {
      const {
        barnId,
        orderId,
        barnUsername,
        barnUserId,
        barnUserMessage,
        userSelectedDate,
      } = confirmBarnUserDto;

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

      if (barn.orderStatus) return { message: 'artıq sifariş olunub' };

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
      const message = `Anbardar: ${order.barnUsername} sifarişi qəbul etdi №${order.id}; Sifariş edən şəxs ${order.clientUserName} | status: ${order.status}`;

      order.status = 'anbardar_sifarişi_qəbul_etdi';
      order.info = message;
      order.barnUserMessage = barnUserMessage;

      barn.orderStatus = true;

      // Сохранение обновленного заказа
      await order.save();
      await barn.save();

      await this.archiveService.createArchive({
        message,
        barnId: +barnId,
        userId: +barnUserId,
        username: barnUsername,
        userSelectedDate,
        movementType: order.status,
        fromLocation: barn.location,
        toLocation: order.clientLocation,
        productName: barn.productName,
        azencoCode: barn.azencoCode,
        unit: barn.unit,
        price: +barn.price,
        newStock: +order.newStock || 0,
        usedStock: +order.usedStock || 0,
        brokenStock: +order.brokenStock || 0,
        totalStock: +order.totalStock,
        totalPrice: +order.totalPrice,
        driverName: '',
        carNumber: '',
        recipientName: order.clientUserName,
        senderName: barn.username,
        // Для потерянные
        lostNewStock: 0,
        lostUsedStock: 0,
        lostBrokenStock: 0,
        lostTotalStock: 0,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }
}
