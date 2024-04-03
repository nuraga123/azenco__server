import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { UsersService } from 'src/users/users.service';
import { HistoryService } from 'src/history/history.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmSendOrderDto } from './dto/confirm-send-order.dto';
import { CancelSendOrderDto } from './dto/cancel-send-order.dto';
import { StatusOrderText } from './status';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectModel(Order)
    private readonly OrderModel: typeof Order,
    private readonly anbarService: AnbarService,
    private readonly usersService: UsersService,
    private readonly historyService: HistoryService,
  ) {}

  // Получение всех записей истории заказов
  async getAllOrders(): Promise<Order[]> {
    return this.OrderModel.findAll();
  }

  async createOrderAnbar(
    createOrderDto: CreateOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    const { anbarFromId, userById, quantity } = createOrderDto;
    const anbar = await this.anbarService.findOneAnbarId(anbarFromId);
    const client = await this.usersService.findOne({
      where: { id: +userById },
    });

    if (anbar && anbar.stock && anbar.stock < quantity) {
      return {
        error: `заказ невозможен, так как число товара всего ${+anbar.stock}`,
      };
    }

    if (anbar && anbar.ordered) {
      return {
        error: `заказ невозможен, так как товар уже заказан`,
      };
    }

    this.logger.log(anbar);
    if (anbar && anbar?.username && client && client?.username && quantity) {
      const order = await this.OrderModel.create({
        status: 'created', // статус заказа создан
        orderedBy: client.username,
        orderedFrom: anbar.username,
        quantity: +quantity,
        price: +anbar.price,
        totalPrice: +quantity * +anbar.price,
        unit: anbar.unit,
        name: anbar.name,
        azenco__code: anbar.azenco__code,
        img: anbar.img,
      });

      order.save();
      const message: string = `заказ создан! Заказчик: ${client.username} хочет у ${anbar.username}: ${quantity} ${anbar.unit} ${anbar.name}`;

      await this.historyService.createHistory(
        message,
        client.username,
        client.id,
      );

      return { message, order };
    }
  }

  async confirmOrderAnbar(
    confirmSendOrderDto: ConfirmSendOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      const { orderId, anbarIdOrder } = confirmSendOrderDto;
      if (!orderId || !anbarIdOrder) return { error: 'пустые данные' };

      // Получить информацию о заказе из базы данных
      const order = await this.OrderModel.findOne({
        where: { id: orderId },
      });
      if (!order) return { error: 'Заказ не найден' };

      // Получить информацию о товаре из сервера анбара
      const anbar = await this.anbarService.findOneAnbarId(anbarIdOrder);

      // Проверить, существует ли товар с указанным идентификатором
      if (!anbar) return { error: 'Товар не найден' };

      // Вычесть сумму, которую захотел заказчик, из остатков на складе
      if (+anbar.stock < +order.quantity)
        return { error: 'Недостаточно товара на складе' };

      if (order.status !== 'created')
        return { error: 'статус должен быт заказ создан' };

      anbar.previous_stock = +anbar.stock;
      anbar.previous_total_price = +anbar.total_price;
      // Выполнить вычитание суммы из остатков на складе
      const sum = +anbar.stock - +order.quantity;
      anbar.stock = +sum;
      anbar.total_price = +sum * +anbar.price;
      anbar.ordered = true;
      await anbar.save();

      // Обновить статус заказа на "отправил заказчику"
      order.status = 'sent_to_customer';
      await order.save();

      // Вернуть сообщение об успешном подтверждении заказа

      return {
        message: `Заказ успешно подтвержден! Складчик: ${anbar.username} принял и отправил Заказчику: ${order.orderedBy}: ${+order.quantity} ${anbar.unit} ${anbar.name}`,
        order,
      };
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
      const order = await this.OrderModel.findOne({
        where: { id: orderId },
      });

      // Проверить, существует ли заказ с указанным идентификатором
      if (!order) return { error: 'Заказ не найден' };

      // Проверить, был ли заказ уже отправлен
      if (order.status !== StatusOrderText.created) {
        return { error: 'Отмена невозможна, так как заказ уже отправлен' };
      }

      order.status = StatusOrderText.cancelled_by_anbar;

      await order.save();

      const message: string = `Заказ отменен! Сотрудник анбара ${order.orderedFrom} не принял заказ на ${order.quantity} ${order.unit} ${order.name} по причине: ${cancelOrderText}`;

      const { id } = await this.usersService.findOne({
        where: { username: order.orderedFrom },
      });

      await this.historyService.createHistory(message, order.orderedFrom, id);

      // Вернуть сообщение об успешной отмене заказа
      return { message, order };
    } catch (error) {
      return {
        error: `Ошибка Сервера при отмене заказа: ${(error as Error).message}`,
      };
    }
  }
}
