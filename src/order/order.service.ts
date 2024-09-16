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
  IFilterOptions,
  IDeleteOptions,
  StatusOrderType,
} from './types';
import { ErrorService } from 'src/errors/errors.service';
import { BarnService } from 'src/barn/barn.service';
import { errorText } from 'src/errors/text';

import { NewOrderDto } from './dto/new-order.dto';
import { ConfirmBarnUserDto } from './dto/confirm-barn-user.dto';
import { SendBarnUserDto } from './dto/send-barn-user.dto';

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

  /* поиски */
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

  /* движения */

  // Создание заказа
  // status: 'yeni_sifariş',
  async createOrder(newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    try {
      const {
        barnId,
        clientId,
        clientLocation,
        clientMessage,
        newStock,
        usedStock,
        brokenStock,
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
      const info: string = `Sifariş edən şəxs: ${client.username} (ID: ${client.id}); Müştəri Yeri: ${clientLocation}. | Anbardar: ${barn.username} (ID: ${barn.userId}); Anbardar Yeri: ${barn.location} ${
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
      const message: string = `Status: ${order.status} | №${order.id}! ${info} | ${order.clientMessage}`;

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
  // status = 'anbardar_sifarişi_qəbul_etdi';
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
      const barnUser = await this.usersService.findOne({
        where: {
          username: barnUsername,
          id: barnUserId,
        },
      });

      if (!barnUser) return { error_message: errorText.NOT_BARN_USER };

      // Поиск склада по ID
      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnId(barnId);

      if (barnError) return { error_message: barnError };

      // Поиск заказа по ID
      const { order, error_message } = await this.findOrderById(orderId);
      if (error_message) return { error_message };

      const orderStatus: StatusOrderType = order.status;

      const orderStatusNew = orderStatus !== 'yeni_sifariş';

      const orderStatusConfirm = orderStatus === 'anbardar_sifarişi_qəbul_etdi';

      if (orderStatusNew) {
        if (orderStatusConfirm) {
          return { error_message: errorText.STATUS_CONFIRMED };
        } else return { error_message: errorText.STATUS_NEW };
      }

      // Проверка, что пользователь существует и соответствует складчику в заказе
      if (
        barnUser.username !== order.barnUsername &&
        order.barnUserId !== barnUserId &&
        barn.username !== order.barnUsername
      ) {
        return {
          error_message: 'siz sifarişdə göstərilən anbardar deyilsiniz',
        };
      }

      // Обновление статуса и описания заказа
      order.status = 'anbardar_sifarişi_qəbul_etdi';
      order.barnUserMessage = barnUserMessage;

      const message = `Anbardar: ${order.barnUsername} sifarişi №${order.id} qəbul etdi № ${order.id} | Anbardar Mesajı: ${barnUserMessage}`;
      order.info = message;

      // Обновление склада
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
        recipientName: order.clientUserName,
        senderName: barn.username,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Метод складчик отправляет заказ складчику клиенту
  // status = 'anbardar_sifarişi_qəbul_etdi';
  async sendOrderBarnUser(
    sendBarnUserDto: SendBarnUserDto,
  ): Promise<IOrderResponse> {
    try {
      const {
        orderId,
        userSelectedDate,
        barnUserId,
        barnUsername,
        barnUserMessage,
        barnLocationProduct,

        // car
        driverName,
        carNumber,

        // stock
        newStockSend,
        usedStockSend,
        brokenStockSend,
      } = sendBarnUserDto;

      if (!driverName) return { error_message: errorText.NOT_DRIVER_NAME };

      if (!carNumber) return { error_message: errorText.NOT_CAR_NUMBER };

      // Поиск заказа по ID
      const { order, error_message: orderError } =
        await this.findOrderById(orderId);

      if (orderError) return { error_message: orderError };

      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnIdAndBarnUsername({
          id: +barnUserId,
          username: barnUsername,
        });

      if (barnError) return { error_message: barnError };

      // Проверка, что заказ находится в статусе "anbardar_sifarişi_qəbul_etdi"
      const testCheck = order.status === 'anbardar_sifarişi_qəbul_etdi';

      if (!testCheck) return { message: errorText.STATUS_SEND };

      // Проверка достаточности товара в складе
      const validSendOrderStock = this.validateStockValues({
        barn,
        newStock: +newStockSend,
        usedStock: +usedStockSend,
        brokenStock: +brokenStockSend,
      });

      if (validSendOrderStock) return { error_message: validSendOrderStock };

      // проверка на полный закак
      const checkOrderAndSendStockBarn =
        Boolean(+order.newStock === +newStockSend) &&
        Boolean(+order.usedStock === +usedStockSend) &&
        Boolean(+order.brokenStock === +brokenStockSend);

      if (checkOrderAndSendStockBarn) {
        const { price } = barn;
        // обновляем амбар складчика
        barn.newStock -= +newStockSend;
        barn.usedStock -= +usedStockSend;
        barn.brokenStock -= -+brokenStockSend;

        barn.totalStock = +barn.newStock + +barn.usedStock + +barn.brokenStock;

        barn.newTotalPrice = +price * +barn.newStock;
        barn.usedTotalPrice = +price * +barn.usedStock;
        barn.brokenTotalPrice = +price * +barn.brokenStock;

        barn.totalPrice =
          +barn.newTotalPrice + +barn.usedTotalPrice + +barn.brokenTotalPrice;

        // обновляем заказ складчика

        // устоновим полную отправку
        order.status = 'anbardar_tam_sifarişi_müştəriyə_göndərdi';
        order.barnUserMessage = barnUserMessage;
        order.barnLocation = barnLocationProduct || barn.location;
        order.driverName = driverName;
        order.carNumber = carNumber;

        const info = `Status: ${order.status}! Sifarişi №${order.id} Göndərmə tarixi: ${
          // выбранная пользователем дата
          userSelectedDate
        }; Anbardar: ${barnUsername} (ID: ${barnUserId})  ${
          // локация склада
          order.barnLocation
        }-dan getdi Müştəri: ${order.clientUserName} ünvanına ${
          order.clientLocation
        }; Material: ${order.productName}, AZENCO Kod: ${order.azencoCode}, ${
          +newStockSend ? `yeni: ${+newStockSend}` : ''
        }, ${+usedStockSend ? `işlənmiş: ${+usedStockSend}` : ''}, yararsız: ${
          +brokenStockSend ? `yararsız: ${+brokenStockSend}` : ''
        }; Sürücü: ${driverName} - nömrə: ${carNumber}! Anbarda qalıb yeni: ${
          barn.newStock || 0
        }, işlənmiş: ${
          //
          barn.usedStock || 0
        }, yararsız: ${barn.brokenStock || 0}, cəmi: ${barn.totalStock} `;

        order.info = info;

        return {
          order,
          message: info,
        };
      }
    } catch (e) {
      this.errorService.errorsMessage(e);
    }
  }

  async deleteOrderFromClient({
    orderId,
    clientId,
    productId,
    azencoCode,
    productName,
    clientUserName,
  }: IDeleteOptions) {
    const dataVerification = Boolean(
      orderId &&
        clientId &&
        productId &&
        azencoCode &&
        productName &&
        clientUserName,
    );

    if (!dataVerification) return { error_message: errorText.WRONG_DATA };

    try {
      const { order, error_message: orderError } =
        await this.findOrderById(orderId);

      if (orderError) return { error_message: orderError };

      const orderStatus: StatusOrderType = order.status;

      const testStatusNewOrder = orderStatus === 'yeni_sifariş';

      const testStatusCanceledBarn =
        orderStatus === 'sifariş_anbardar_tərəfindən_ləğv_edildi';

      const test = testStatusNewOrder || testStatusCanceledBarn;

      if (!test) return { error_message: errorText.STATUS_CANCELED };

      const findClientOptions: IFilterOptions = {
        where: {
          id: +clientId,
          username: clientUserName,
        },
      };

      const clientUser = await this.usersService.findOne(findClientOptions);

      if (!clientUser) return { error_message: errorText.NOT_USERNAME };

      const testProductName = order.productName !== productName;
      const testProductId = order.productId !== productId;
      const testAzencoCode = order.azencoCode !== azencoCode;
      const testClientId = order.clientId !== clientUser?.id;
      const testClientUserName = order.clientUserName !== clientUser?.username;

      const deleteDateOrder = Boolean(
        testProductName &&
          testProductId &&
          testAzencoCode &&
          testClientId &&
          testClientUserName,
      );

      if (deleteDateOrder) {
        return { error_message: errorText.NOT_REQUIRED_USER_ACTION };
      } else {
        const message = `Sifariş №${order.id} müştəri: ${order.clientUserName} (ID: ${
          //
          order.clientId
        }) tərəfindən silindi !`;

        await this.archiveService.createArchive({
          barnId: order.barnId,
          userId: clientId,
          username: clientUserName,
          message,
        });

        await order.destroy();

        return { message };
      }
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }
}
