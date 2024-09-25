import {
  Body,
  Controller,
  //Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import { OrderService } from './order.service';
import {
  IOrderResponse,
  IOrdersResponse,
  IOrderQuery,
  ICountAndRowsOrdersResponse,
  IMyOrders,
  IOherOrders,
} from './types';
import { NewOrderDto } from './dto/new-order.dto';
import { ConfirmBarnUserDto } from './dto/confirm-barn-user.dto';
import { DeleteOrderFromClientDTO } from './dto/delete-order-client';
import { SendBarnUserDto } from './dto/send-barn-user.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {
    /**/
  }

  //получения всех заказов
  @Get('all')
  @HttpCode(HttpStatus.OK)
  getOrders(): Promise<IOrdersResponse> {
    return this.orderService.findAllOrders();
  }

  // запроса для получения заказов с параметрами
  // пример: orders?limit=20&offset=0
  @Get()
  @HttpCode(HttpStatus.OK)
  getCountAndRowsOrders(
    @Query() query: IOrderQuery,
  ): Promise<ICountAndRowsOrdersResponse> {
    return this.orderService.findAndCountAllOrders(query);
  }

  /* клиент */

  // мои заказаы
  @Post('my')
  @HttpCode(HttpStatus.OK)
  postMyOrders(
    @Body() { clientId, clientUserName }: IMyOrders,
  ): Promise<IOrderResponse> {
    return this.orderService.findMyOrdersByClientIdAndClientUserName({
      clientId,
      clientUserName,
    });
  }

  // запрос для создания нового заказа
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  addNewOrder(@Body() newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    return this.orderService.createOrder(newOrderDto);
  }

  // запрос для отмены заказа клиентом
  @Post('cancel-client')
  @HttpCode(HttpStatus.OK)
  postCanceledOrderClient(
    @Body() canceledOrderFromClientDTO: DeleteOrderFromClientDTO,
  ): Promise<IOrderResponse> {
    return this.orderService.cancelOrderClient(canceledOrderFromClientDTO);
  }

  // запрос для удаления заказа клиентом
  @Post('delete')
  @HttpCode(HttpStatus.OK)
  postRemoveOrderClient(
    @Body() deleteOrderFromClientDTO: DeleteOrderFromClientDTO,
  ): Promise<IOrderResponse> {
    return this.orderService.deletedOrderFromClient(deleteOrderFromClientDTO);
  }

  /* складчик */

  // мои заказы от клиентов
  @Post('from-barn-user')
  @HttpCode(HttpStatus.OK)
  postOrderByBarnUserNameAndByBarnUserId(
    @Body() { barnUsername, barnUserId }: IOherOrders,
  ): Promise<IOrderResponse> {
    return this.orderService.findOrderByBarnUserNameAndByBarnUserId({
      barnUsername,
      barnUserId,
    });
  }

  // подтверждение складчика
  @Post('confirm-barn-user')
  @HttpCode(HttpStatus.OK)
  postConfirmBarnUser(
    @Body() confirmBarnUserDto: ConfirmBarnUserDto,
  ): Promise<IOrderResponse> {
    return this.orderService.confirmOrderBarnUser(confirmBarnUserDto);
  }

  // отмена заказа с стороны складчика
  @Post('canceled-barn-user')
  @HttpCode(HttpStatus.OK)
  postCanceledBarnUser(
    @Body() confirmBarnUserDto: ConfirmBarnUserDto,
  ): Promise<IOrderResponse> {
    return this.orderService.confirmOrderBarnUser(confirmBarnUserDto);
  }

  // отправка клиенту от складчика
  @Post('send-full-barn-user')
  @HttpCode(HttpStatus.OK)
  sendAnbarUser(@Body() sendBarnUserDto: SendBarnUserDto) {
    return this.orderService.sendFullOrderBarnUser(sendBarnUserDto);
  }

  /*


  @Post('success-deliver-client')
  successDeliverToClient(
    @Body('id') id: number,
    @Body('clientAnbarId') clientAnbarId: number,
  ): Promise<IOrderResponse> {
    return this.orderService.successDeliver({
      id,
      clientAnbarId,
    });
  }
  */
}
