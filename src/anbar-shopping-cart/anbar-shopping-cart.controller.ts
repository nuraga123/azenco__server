import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AnbarShoppingCartService } from './anbar-shopping-cart.service';
import { AddAnbarToCartDto } from './dto/add-anbar-to-cart';
import {
  AddToCardResponse,
  GetAllResponse,
  TotalPriceRequest,
  TotalPriceResponse,
  UpdateCountRequest,
  UpdateCountResponse,
} from './types';

@Controller('shopping-cart')
export class AnbarShoppingCartController {
  constructor(
    private readonly anbarShoppingCartService: AnbarShoppingCartService,
  ) {}

  @ApiOkResponse({ type: [GetAllResponse] })
  @Get(':id')
  getAll(@Param('id') userId: string) {
    return this.anbarShoppingCartService.findAll(userId);
  }

  @ApiOkResponse({ type: AddToCardResponse })
  @Post('/add')
  addToCar(@Body() addToCartDto: AddAnbarToCartDto) {
    return this.anbarShoppingCartService.add(addToCartDto);
  }

  @ApiOkResponse({ type: UpdateCountResponse })
  @ApiBody({ type: UpdateCountRequest })
  @Patch('/count/:id')
  updateCount(
    @Body() { count }: { count: number },
    @Param('id') partId: string,
  ) {
    return this.anbarShoppingCartService.updateCount(count, partId);
  }

  @ApiOkResponse({ type: TotalPriceResponse })
  @ApiBody({ type: TotalPriceRequest })
  @Patch('/total-price/:id')
  updateTotalPrice(
    @Body() { total_price }: { total_price: number },
    @Param('id') partId: string,
  ) {
    return this.anbarShoppingCartService.updateTotalPrice(total_price, partId);
  }

  @Delete('/one/:id')
  removeOne(@Param('id') partId: string) {
    return this.anbarShoppingCartService.remove(partId);
  }

  @Delete('/all/:id')
  removeAll(@Param('id') userId: string) {
    return this.anbarShoppingCartService.removeAll(userId);
  }
}
