import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';
import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';
import { NewOrderDto } from './dto/new-order.dto';
import { ConfirmSendOrderDto } from './dto/confirm-send-order.dto';
import { CancelSendOrderDto } from './dto/cancel-send-order.dto';
import { IOrderQuery, IOrderResponse, IOrdersResponse } from './types';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    private readonly usersService: UsersService,
    private readonly anbarService: AnbarService,
    private readonly historyService: HistoryService,
  ) {}

  // возврашает ошибку
  errorsMessage(e: any): { error_message: string } {
    this.logger.log(e);
    return { error_message: (e as AxiosError).message };
  }

  // Получение всех записей заказов
  async getCountAndRowsOrders(query: IOrderQuery): Promise<IOrdersResponse> {
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

  async findOrderByClientId(clientId: number) {
    try {
      return await this.orderModel.findAll({
        where: { clientId },
      });
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  async createOrderAnbar(newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    try {
      const { anbarId, clientId, quantity } = newOrderDto;

      const anbar = await this.anbarService.findOneAnbarId(anbarId);

      const client = await this.usersService.findOne({
        where: { id: +clientId },
      });

      if (anbar && +anbar.stock && +anbar.stock < quantity) {
        return {
          error_message: `заказ невозможен, так как число товара всего ${+anbar.stock}`,
        };
      }

      const message: string = `заказ создан! Заказчик: ${client.username} хочет у ${anbar.username}: ${quantity} ${anbar.unit} ${anbar.name}`;

      if (anbar && anbar?.username && client && client?.username && quantity) {
        const order = await this.orderModel.create({
          // статус заказа создан
          status: 'created',
          clientName: client.username,
          clientId: client.id,
          anbarUsername: anbar.username,
          anbarId: anbar.id,
          quantity: +quantity,
          price: +anbar.price,
          totalPrice: +quantity * +anbar.price,
          unit: anbar.unit,
          name: anbar.name,
          azencoCode: anbar.azencoCode,
          img: anbar.img,
          description: message,
        });

        order.save();

        await this.historyService.createHistory(
          message,
          client.username,
          client.id,
        );

        return { message, order };
      }
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  async confirmOrderAnbar(
    confirmSendOrderDto: ConfirmSendOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      const { orderId, anbarIdOrder } = confirmSendOrderDto;
      if (!orderId || !anbarIdOrder) return { error: 'пустые данные' };

      // Получить информацию о заказе из базы данных
      const order = await this.orderModel.findOne({
        where: { id: orderId },
      });

      if (!order) return { error: 'Заказ не найден' };

      // Получить информацию о товаре из сервера анбара
      const anbar = await this.anbarService.findOneAnbarId(anbarIdOrder);

      // Проверить, существует ли товар с указанным идентификатором
      if (!anbar) return { error: 'Товар не найден' };

      // Вычесть сумму, которую захотел заказчик, из остатков на складе
      if (+anbar.stock < +order.quantity) {
        return { error: 'Недостаточно товара на складе' };
      }

      if (order.status !== 'created') {
        return { error: 'статус должен новый заказ' };
      }
      anbar.previousStock = +anbar.stock;
      anbar.previousTotalPrice = +anbar.totalPrice;
      // Выполнить вычитание суммы из остатков на складе
      const sum = +anbar.stock - +order.quantity;
      anbar.stock = +sum;
      anbar.totalPrice = +sum * +anbar.price;
      anbar.ordered = true;
      await anbar.save();
      const message = `Заказ успешно подтвержден! Складчик: ${anbar.username} принял и отправил Заказчику: ${order.clientName}: ${+order.quantity} ${anbar.unit} ${anbar.name}`;
      // Обновить статус заказа на "отправил заказчику"
      order.status = 'sent_to_customer';
      order.description = message;
      await order.save();
      // Вернуть сообщение об успешном подтверждении заказа
      return { message, order };
    } catch (error) {
      // Обработать ошибку, если она возникла
      return { error: `Ошибка при подтверждении заказа: ${error.message}` };
    }
  }

  async cancelOrderAnbar(
    cancelOrderDto: CancelSendOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      const { orderId, cancelOrderText } = cancelOrderDto;
      if (!orderId || !cancelOrderText)
        return { error: 'вводные данные пустые' };
      // Найти заказ в базе данных
      const order = await this.orderModel.findOne({
        where: { id: orderId },
      });

      // Проверить, существует ли заказ с указанным идентификатором
      if (!order) return { error: 'Заказ не найден' };

      // Проверить, был ли заказ уже отправлен
      if (order.status !== 'created') {
        return {
          error: `Отмена невозможна, так как cтатус заказа: ${order.status}`,
        };
      }

      order.status = 'cancelled_by_anbar';

      await order.save();

      const message: string = `Заказ отменен! Сотрудник анбара ${order.anbarUsername} не принял заказ на ${order.quantity} ${order.unit} ${order.name} по причине: ${cancelOrderText}`;

      const { id } = await this.usersService.findOne({
        where: { username: order.clientName },
      });

      await this.historyService.createHistory(message, order.anbarUsername, id);

      // Вернуть сообщение об успешной отмене заказа
      return { message, order };
    } catch (error) {
      return {
        error: `Ошибка Сервера при отмене заказа: ${(error as Error).message}`,
      };
    }
  }
}
