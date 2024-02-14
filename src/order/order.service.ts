import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { IOrderProps } from './types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order)
    private readonly OrderModel: typeof Order,
    private readonly anbarService: AnbarService,
    private readonly usersService: UsersService,
  ) {}

  // Получение всех записей истории заказов
  async getAllOrders(): Promise<Order[]> {
    // Возвращаем все записи истории заказов
    return this.OrderModel.findAll();
  }

  // Создание новой записи заказа
  async createOrder(order: IOrderProps): Promise<Order> {
    const currentProductAnbar = await this.anbarService.findOneAnbarId(
      order.anbarId,
    );

    const currentOrderedBy = await this.usersService.findOne({
      where: {
        username: order.orderedBy,
      },
    });

    const currentOrderedFrom = await this.usersService.findOne({
      where: {
        username: order.orderedFrom,
      },
    });

    const newOrder = await this.OrderModel.create({
      ...currentProductAnbar,
      totalPrice: +currentProductAnbar.price * +currentProductAnbar.stock,
      orderedBy: currentOrderedBy.username,
      orderedFrom: currentOrderedFrom.username,
      status: 'Заказ в ожидании',
    });

    return newOrder;
  }

  // Обновление состояния заказа
  async updateOrderStatus(orderId: number, newStatus: string): Promise<Order> {
    // Находим заказ по его идентификатору
    const order = await this.OrderModel.findByPk(orderId);

    if (!order) {
      // Выбрасываем ошибку, если заказ не найден
      throw new Error(`Order with ID ${orderId} not found`);
    }
    // Обновляем состояние заказа
    order.status = newStatus;
    // Сохраняем изменения в базе данных
    await order.save();
    // Возвращаем обновленный заказ
    return order;
  }
}
