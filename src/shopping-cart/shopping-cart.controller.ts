import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { AddToCartDto } from './dto/add-to-cart';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import {
  AddToCardResponse,
  GetAllResponse,
  TotalPriceRequest,
  TotalPriceResponse,
  UpdateCountRequest,
  UpdateCountResponse,
} from './types';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @ApiOkResponse({ type: [GetAllResponse] })
  @Get(':id')
  getAll(@Param('id') userId: string) {
    return this.shoppingCartService.findAll(userId);
  }

  @ApiOkResponse({ type: AddToCardResponse })
  @Post('/add')
  addToCar(@Body() addToCartDto: AddToCartDto) {
    return this.shoppingCartService.add(addToCartDto);
  }

  @ApiOkResponse({ type: UpdateCountResponse })
  @ApiBody({ type: UpdateCountRequest })
  @Patch('/count/:id')
  updateCount(
    @Body() { count }: { count: number },
    @Param('id') partId: string,
  ) {
    return this.shoppingCartService.updateCount(count, partId);
  }

  @ApiOkResponse({ type: TotalPriceResponse })
  @ApiBody({ type: TotalPriceRequest })
  @Patch('/total-price/:id')
  updateTotalPrice(
    @Body() { total_price }: { total_price: number },
    @Param('id') partId: string,
  ) {
    return this.shoppingCartService.updateTotalPrice(total_price, partId);
  }

  @Delete('/one/:id')
  removeOne(@Param('id') partId: string) {
    return this.shoppingCartService.remove(partId);
  }

  @Delete('/all/:id')
  removeAll(@Param('id') userId: string) {
    return this.shoppingCartService.removeAll(userId);
  }
}
