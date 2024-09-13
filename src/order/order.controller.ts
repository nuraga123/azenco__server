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

  // запрос для создания нового заказа
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  addNewOrder(@Body() newOrderDto: NewOrderDto): Promise<IOrderResponse> {
    return this.orderService.createOrder(newOrderDto);
  }

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

  @Post('other')
  @HttpCode(HttpStatus.OK)
  postOrderByBarnUserNameAndByBarnUserId(
    @Body() { barnUsername, barnUserId }: IOherOrders,
  ): Promise<IOrderResponse> {
    return this.orderService.findOrderByBarnUserNameAndByBarnUserId({
      barnUsername,
      barnUserId,
    });
  }

  @Post('confirm-barn-user')
  @HttpCode(HttpStatus.OK)
  confirmBarnUser(
    @Body() confirmBarnUserDto: ConfirmBarnUserDto,
  ): Promise<IOrderResponse> {
    return this.orderService.confirmOrderBarnUser(confirmBarnUserDto);
  }

  // запрос для удаления заказа клиентом
  @Post('remove-client')
  @HttpCode(HttpStatus.OK)
  removeOrderToClient(
    @Body() deleteOrderFromClientDTO: DeleteOrderFromClientDTO,
  ): Promise<IOrderResponse> {
    return this.orderService.deleteOrderFromClient(deleteOrderFromClientDTO);
  }

  // @Post('send-barn-user')
  // @HttpCode(HttpStatus.OK)
  // sendAnbarUser(
  //   @Body() sendBarnUserDto: SendBarnUserDto,
  // ): Promise<IOrderResponse> {
  //   return this.orderService.sendOrder(sendBarnUserDto);
  // }

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
