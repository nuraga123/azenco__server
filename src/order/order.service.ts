import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
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

  async createOrderAnbar({
    userIdOrder,
    anbarIdOrder,
    quantity,
  }: {
    userIdOrder: number;
    anbarIdOrder: number;
    quantity: number;
  }) {
    const anbar = await this.anbarService.findOneAnbarId(anbarIdOrder);
    const client = await this.usersService.findOne({
      where: { id: +userIdOrder },
    });

    if (anbar && anbar?.username && client && client?.username && quantity) {
      const order = await this.OrderModel.create({
        orderedBy: client.username,
        orderedFrom: anbar.username,
        quantity: +quantity,
        unit: anbar.unit,
        name: anbar.name,
        status: 'pending', // статус заказа (например, ожидает подтверждения)
        azenco__code: anbar.azenco__code, // код анбара, если таковой имеется
        price: +anbar.price, // цена товара в анбаре
        totalPrice: +quantity * +anbar.price, // общая стоимость заказа
        img: anbar.img, // изображение товара, если таковое имеется
        // Добавьте другие необходимые поля
      });

      order.save();
      return `заказ создан, заказчик: ${client.username} хочет ${quantity} ${anbar.unit} ${anbar.name}`;
    }
  }
}
