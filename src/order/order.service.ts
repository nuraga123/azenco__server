import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { IOrder } from './types';
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
    return this.OrderModel.findAll();
  }

  // Создание новой записи заказа
  async createOrder(orderData: IOrder): Promise<Order> {
    // Извлечение данных из объекта заказа
    const { anbarId, orderedBy, orderedFrom, stock } = orderData;

    // Поиск информации об анбаре по его идентификатору
    const currentProductAnbar = await this.anbarService.findOneAnbarId(anbarId);
    if (!currentProductAnbar) {
      throw new NotFoundException(`не найден anbarId: ${anbarId}`);
    }

    // Поиск информации о пользователях, совершивших заказ
    const [currentOrderedBy, currentOrderedFrom] = await Promise.all([
      this.usersService.findOne({ where: { username: orderedBy } }),
      this.usersService.findOne({ where: { username: orderedFrom } }),
    ]);
    if (!currentOrderedBy || !currentOrderedFrom) {
      throw new NotFoundException(
        `Один или несколько пользователей не найдены`,
      );
    }

    const totalPrice = +currentProductAnbar.price * +stock;
    // Создание нового заказа
    const newOrder = await this.OrderModel.create({
      name: currentProductAnbar.name,
      azenco__code: currentProductAnbar.azenco__code,
      unit: currentProductAnbar.unit,
      price: currentProductAnbar.price,
      stock,
      totalPrice,
      img: currentProductAnbar.images,
      orderedBy: currentOrderedBy.username,
      orderedFrom: currentOrderedFrom.username,
      status: 'Заказ в ожидании',
    });
    return newOrder;
  }

  // Обновление состояния заказа
  async updateOrderStatus(orderId: number, newStatus: boolean): Promise<Order> {
    const ORDER_COMPLETED = 'заказ выполнен';
    const ORDER_NOT_COMPLETED = 'заказ не завершен';

    // Поиск заказа по его идентификатору
    const order = await this.OrderModel.findByPk(orderId);

    if (!order) {
      throw new NotFoundException(`не найден orderId: ${orderId}`);
    }

    // Обновление состояния заказа и сохранение изменений
    if (newStatus) {
      order.status = ORDER_COMPLETED;
    } else {
      order.status = ORDER_NOT_COMPLETED;
    }

    return order.save();
  }
}
