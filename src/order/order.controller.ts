import { Body, Controller, Get, Post } from '@nestjs/common';
import { Order } from './order.model';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfirmSendOrderDto } from './dto/confirm-send-order.dto';
import { CancelSendOrderDto } from './dto/cancel-send-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Обработчик GET запроса для получения всех заказов
  @Get('all')
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  // Обработчик POST запроса для создания нового заказа
  @Post('new-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<{
    order?: Order;
    message?: string;
    error?: string;
  }> {
    return await this.orderService.createOrderAnbar(createOrderDto);
  }

  @Post('confirm-send-customer')
  async confirmOrderAnbar(
    @Body() confirmSendOrderDto: ConfirmSendOrderDto,
  ): Promise<{ order?: Order; message?: string; error?: string }> {
    try {
      return await this.orderService.confirmOrderAnbar(confirmSendOrderDto);
    } catch (error) {
      return { error: `Ошибка при выполнении операции: ${error.message}` };
    }
  }

  @Post('cancel-send-customer')
  async cancelOrder(@Body() cancelOrderDto: CancelSendOrderDto) {
    return this.orderService.cancelOrderAnbar(cancelOrderDto);
  }
}
