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
  IFindOrderBarnUser,
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

  // Поиск всех заказов клиента
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
      if (!order) return { error_message: errorText.NOT_ORDER };
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

  async findOrderBarnUser(
    findOrderBarnUser: IFindOrderBarnUser,
  ): Promise<IOrderResponse> {
    try {
      const order = await this.orderModel.findOne(findOrderBarnUser);

      if (!order) return { error_message: errorText.NOT_ORDER };
      return { order };
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

  /* движения клиента */

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

  // клиент отменил заказ
  // 'müştəri_sifarişi_ləğv_etdi';
  async cancelOrderClient({
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

      const test = orderStatus === 'yeni_sifariş';

      if (!test) return { error_message: errorText.STATUS_NEW };

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
        const message: string = `Sifariş №${order.id} müştəri: ${order.clientUserName} (ID: ${
          //
          order.clientId
        }) tərəfindən ləğv etdi !`;

        order.info = message;

        order.status = 'müştəri_sifarişi_ləğv_etdi';
        order.save();

        await this.archiveService.createArchive({
          barnId: order.barnId,
          userId: clientId,
          username: clientUserName,
          message,
        });

        return { message };
      }
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // клиент удалил заказ
  async deletedOrderFromClient({
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

      const orderStatusClient = orderStatus === 'müştəri_sifarişi_ləğv_etdi';
      const orderStatusBarnUser =
        orderStatus === 'sifariş_anbardar_tərəfindən_ləğv_edildi';

      const validStatus = Boolean(orderStatusClient || orderStatusBarnUser);

      if (!validStatus) return { error_message: errorText.STATUS_DELETE };

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

  // принят заказ успешно полностью
  // async acceptedOrderClientSuccess({
  //   orderId,
  //   // client
  //   clientId,
  //   clientUserName,

  //   // barn
  //   barnId,
  //   barnUserId,
  //   barnUsername,

  //   // car
  //   driverName,
  //   carNumber,

  //   // product
  //   productId,
  //   productName,
  //   azencoCode,
  //   newStock,
  //   usedStock,
  //   brokenStock,
  //   updatePrice,
  //   clientLocation,
  //   clientMessage,
  // }: {
  // }): Promise<IOrderResponse> {
  //   try {
  //     // Поиск заказа по ID
  //     const { order, error_message: orderError } =
  //       await this.findOrderById(orderId);

  //     // Если возникла ошибка при поиске заказа, возвращаем её
  //     if (orderError) return { error_message: orderError };

  //     // Проверка, что текущий статус заказа позволяет его доставить
  //     const validStatuses = [
  //       'anbardar_sifarişi_qəbul_etdi',
  //       'anbardar_tam_sifarişi_müştəriyə_göndərdi',
  //     ];
  //     if (!validStatuses.includes(order.status)) {
  //       return { message: 'Bu sifarişin statusunu dəyişmək olmaz.' }; // Сообщение об ошибке статуса
  //     }

  //     // Обновляем информацию о заказе на статус "sifariş_uğurla_çatdırıldı"
  //     order.status = 'sifariş_uğurla_çatdırıldı';
  //     order.deliveryDate = deliveryInfo.deliveryDate; // Указываем дату доставки
  //     order.driverName = deliveryInfo.driverName; // Указываем имя водителя
  //     order.carNumber = deliveryInfo.carNumber; // Указываем номер машины
  //     order.barnUserMessage = deliveryInfo.barnUserMessage || ''; // Сообщение от складчика, если есть

  //     // Формируем информационное сообщение о заказе
  //     const info = `Sifariş uğurla çatdırıldı! Sifariş ID: ${order.id}, Çatdırılma tarixi: ${deliveryInfo.deliveryDate}, Sürücü: ${deliveryInfo.driverName}, Maşın nömrəsi: ${deliveryInfo.carNumber}.`;

  //     order.info = info; // Сохраняем информацию о заказе

  //     // Возвращаем обновленный заказ с информацией о доставке
  //     return { order, message: info };
  //   } catch (e) {
  //     // Обрабатываем возможные ошибки
  //     this.errorService.errorsMessage(e);
  //   }
  // }

  /* движения складчика */

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
  // status = 'anbardar_tam_sifarişi_müştəriyə_göndərdi'
  async sendFullOrderBarnUser(sendBarnUserDto: SendBarnUserDto) {
    try {
      const {
        orderId,
        // barn
        barnId,
        barnUserId,
        barnUsername,

        barnLocationProduct,
        driverName,
        carNumber,
        userSelectedDate,
        updatePrice,
      } = sendBarnUserDto;

      const { barn, error_message: barnError } =
        await this.barnService.findOneBarnIdAndBarnUsername({
          id: barnId,
          userId: barnUserId,
          username: barnUsername,
        });

      if (barnError) return { error_message: barnError };

      const findOrderFilter: IFindOrderBarnUser = {
        where: {
          orderId,
          barnId,
          barnUserId,
          barnUsername,
        },
      };

      const { order, error_message } =
        await this.findOrderBarnUser(findOrderFilter);

      if (error_message) return { error_message };

      return { resOrder: order, resBarn: barn };
    } catch (e) {
      this.errorService.errorsMessage(e);
    }
  }
}
