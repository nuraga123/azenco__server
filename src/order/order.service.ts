import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order } from './order.model';
import { AnbarService } from 'src/anbars/anbar.service';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { NewOrderDto } from './dto/new-order.dto';
import {
  ICountAndRowsOrdersResponse,
  IOrderQuery,
  IOrderResponse,
  IOrdersResponse,
} from './types';
import { ErrorService } from 'src/errors/errors.service';

@Injectable()
export class OrderService {
  // Инициализация логгера

  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    private readonly usersService: UsersService,
    private readonly anbarService: AnbarService,
    private readonly errorService: ErrorService,
    private readonly historyService: HistoryService,
  ) {
    /**/
  }

  // Поиск всех заказов
  async findAllOrders(): Promise<IOrdersResponse> {
    try {
      const orders = await this.orderModel.findAll();
      if (!orders.length) return { error_message: 'Нет заказов!', orders: [] };
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

  // Создание заказа
  async createOrder(newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    try {
      const {
        anbarId,
        clientId,
        clientLocation,
        newStock,
        usedStock,
        brokenStock,
      } = newOrderDto;

      // Поиск склада по ID
      const { anbar, error_message: anbarError } =
        await this.anbarService.findOneAnbarId(anbarId);
      if (anbarError) return { error_message: anbarError };

      // Поиск клиента по ID
      const { user: client, error_message: clientError } =
        await this.usersService.findOneById(clientId);
      if (clientError) return { error_message: clientError };

      // Проверка на правильность количества
      if (typeof newStock !== 'number' || newStock <= 0) {
        return { error_message: 'Неверное количество заказа!' };
      }

      // Проверка наличия товара на складе
      if (anbar && anbar.newStock && +anbar.newStock < newStock) {
        return {
          error_message: `Товара "${anbar.name}" недостаточно на складе!`,
        };
      }

      // Создание описания заказа
      const description: string = ` Заказчик: ${client.username} из ${clientLocation} заказал ${newStock} ${anbar.unit} товара ${anbar.name} у ${anbar.username}`;

      const totalStock: number = +newStock + +usedStock + +brokenStock;
      const totalPrice: number = +anbar.price * +totalStock;

      // Создание заказа
      const order = await this.orderModel.create({
        status: 'новый_заказ',
        description,
        clientLocation,
        clientId: +client.id,
        clientUserName: client.username,
        anbarId: +anbar.id,
        anbarUsername: anbar.username,
        name: anbar.name,
        azencoCode: anbar.azencoCode,
        price: +anbar.price,
        unit: anbar.unit,
        img: anbar.img,
        anbarLocation: anbar.location,
        newStock: newStock ? +newStock : 0,
        usedStock: usedStock ? +usedStock : 0,
        brokenStock: brokenStock ? +brokenStock : 0,
        lostStock: 0,
        totalStock,
        totalPrice,
      });

      // Создание записи в истории
      const message: string = `Создан новый заказ № ${order.id}! ${description}`;

      await this.historyService.createHistory({
        userId: +client.id,
        username: client.username,
        message,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // Отмена заказа клиентом
  async cancelOrderClient(id: number) {
    const { order, error_message } = await this.findOrderById(+id);
    if (error_message) return { error_message };

    await this.historyService.createHistory({
      message: `Заказ № ${+order.id} отменен клиентом: ${order.clientUserName}!`,
      username: order.clientUserName,
      userId: +order.clientId,
    });

    await order.destroy();
    return { message: `Заказ № ${order.id} успешно отменен!` };
  }

  // заказ принял складчик
  async confirmAnbarUserOrder(id: number): Promise<IOrderResponse> {
    try {
      const { order, error_message } = await this.findOrderById(id);
      const message = `Cкладчик: ${order.anbarUsername} принял заказ №${order.id} ${order.clientUserName}`;
      order.status = 'заказ_принял_складчик';
      order.description = message;
      return error_message ? { error_message } : { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }

  // отправка заказа
  async sendOrderToClient(id: number) {
    try {
      const { order, error_message: orderError } = await this.findOrderById(id);

      if (orderError) return { error_message: orderError };

      const { anbar, error_message: anbarError } =
        await this.anbarService.minusAnbar({
          anbarId: order.anbarId,
          quantity: order.newStock,
        });

      if (anbarError) return { error_message: anbarError };

      const message: string = `Заказ ${order.id} успешно отправлен! Складчик: ${order.anbarUsername} из ${order.anbarLocation} отправил Клиенту: ${order.clientUserName} по адресу: ${order.clientLocation}`;
      order.status = 'заказ_отправлен_клиенту';
      order.description = message;

      await order.save();
      await anbar.save();

      await this.historyService.createHistory({
        userId: anbar.userId,
        username: anbar.username,
        message,
      });

      return { order, message };
    } catch (e) {
      return this.errorService.errorsMessage(e);
    }
  }
}
