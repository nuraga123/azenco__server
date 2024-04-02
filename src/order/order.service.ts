import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { AnbarService } from 'src/anbar/anbar.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
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
  }): Promise<{ order?: Order; message?: string; error?: string }> {
    const anbar = await this.anbarService.findOneAnbarId(anbarIdOrder);
    const client = await this.usersService.findOne({
      where: { id: +userIdOrder },
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
        orderedBy: client.username,
        orderedFrom: anbar.username,
        quantity: +quantity,
        unit: anbar.unit,
        name: anbar.name,
        status: 'created', // статус заказа создан
        azenco__code: anbar.azenco__code,
        price: +anbar.price,
        totalPrice: +quantity * +anbar.price,
        img: anbar.img,
      });

      order.save();

      return {
        message: `заказ создан! Заказчик: ${client.username} хочет у ${anbar.username}: ${quantity} ${anbar.unit} ${anbar.name}`,
        order,
      };
    }
  }

  async confirmOrderAnbar({
    orderIdOrder,
    anbarIdOrder,
  }: {
    orderIdOrder: number;
    anbarIdOrder: number;
  }): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      // Получить информацию о заказе из базы данных
      const order = await this.OrderModel.findOne({
        where: { id: orderIdOrder },
      });
      if (!order) return { error: 'Заказ не найден' };

      // Получить информацию о товаре из сервера анбара
      const anbar = await this.anbarService.findOneAnbarId(anbarIdOrder);

      // Проверить, существует ли товар с указанным идентификатором
      if (!anbar) return { error: 'Товар не найден' };

      // Вычесть сумму, которую захотел заказчик, из остатков на складе
      if (+anbar.stock < +order.quantity)
        return { error: 'Недостаточно товара на складе' };

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
}
