import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';

import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { NewOrderDto } from './dto/new-order.dto';
import {
  ICountAndRowsOrdersResponse,
  IOrderQuery,
  IOrderResponse,
  IOrdersResponse,
} from './types';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    private readonly usersService: UsersService,
    private readonly anbarService: AnbarService,
    private readonly historyService: HistoryService,
  ) {
    /**/
  }

  // возврашает ошибку
  async errorsMessage(e: any): Promise<{ error_message: string }> {
    this.logger.log(e);
    return { error_message: (e as AxiosError).message };
  }

  async findAllOrders(): Promise<IOrdersResponse> {
    try {
      const orders = await this.orderModel.findAll();
      if (!orders.length) return { error_message: 'нет амбаров!' };
      return { orders };
    } catch (error) {
      return this.errorsMessage(error);
    }
  }

  // Получение всех записей заказов
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
      return this.errorsMessage(e);
    }
  }

  // поиск по ID заказа
  async findOrderId(orderId: number): Promise<IOrderResponse> {
    try {
      const order = await this.orderModel.findByPk(orderId);
      if (!order) return { error_message: 'Заказ не найден!' };
      return { order };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // все заказы одного клиента
  async findOrderByClientId(clientId: number) {
    try {
      return await this.orderModel.findAll({
        where: { clientId },
      });
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // создаеться заказ
  async create(newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    try {
      const { anbarId, clientId, quantity, clientLocation } = newOrderDto;

      // находим анбар с продуктом по anbarId в базе данных
      const { anbar, error_message: anbarError } =
        await this.anbarService.findOneAnbarId(anbarId);

      if (anbarError) return { error_message: anbarError };

      // находим клиента  в базе данных
      const { user: client, error_message: clientError } =
        await this.usersService.findOneById(clientId);

      if (clientError) return { error_message: clientError };

      // проверка сток не равен 0 и не больше чем просит заказчик
      if (anbar && anbar?.stock && +anbar?.stock < quantity) {
        return {
          error_message: `заказ невозможен, так как число товара всего ${+anbar.stock}`,
        };
      }

      const message: string = `Новый Заказ! Заказчик: ${client.username} из ${clientLocation} просит у Складчика: ${anbar.username} | ${quantity} ${anbar.unit} ${anbar.name} находиться в ${anbar.location}`;

      const order = await this.orderModel.create({
        status: 'new',
        clientId: +client.id,
        clientUserName: client.username,
        anbarId: +anbar.id,
        anbarUsername: anbar.username,
        name: anbar.name,
        azencoCode: anbar.azencoCode,
        price: +anbar.price,
        totalPrice: +quantity * +anbar.price,
        unit: anbar.unit,
        img: anbar.img,
        description: message,
        quantity: +quantity,
        anbarLocation: anbar.location,
        clientLocation,
      });

      await this.historyService.createHistory({
        message,
        userId: +client.id,
        username: client.username,
      });

      return {
        message,
        order,
      };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  async remove(id: number) {
    const { order, error_message } = await this.findOrderId(+id);
    if (error_message) return { error_message };
    await order.destroy();
    return { message: `заказ № ${order.id} удален !` };
  }
}
