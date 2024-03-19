import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnbarService } from './anbar.service';
import { NewAnbarDto } from './dto/new-anbar.dto';
import { TransferStockDto } from './dto/transfer-stock-anbar.dto';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { Anbar } from './anbar.model';
import { IAnbarsUsernameResponse } from './types';

@Controller('anbar')
export class AnbarController {
  constructor(private readonly anbarService: AnbarService) {}

  // получение имен анбаров
  @Post('usernames')
  getAnbarsUsernames(
    @Body('name') name: string,
  ): Promise<IAnbarsUsernameResponse> {
    return this.anbarService.getAnbarsUsername(name);
  }

  // все анбары
  @Get('all')
  getAnbars(): Promise<Anbar[]> {
    return this.anbarService.findAll();
  }

  // поиск по id анбара
  @Get(':id')
  async getFindOneAnbarProduct(@Param('id') anbarId: number): Promise<Anbar> {
    return await this.anbarService.findOneAnbarId(anbarId);
  }

  // поиск по userId
  @Get('user/:id')
  async getAnbarByUserId(@Param('id') userId: number): Promise<Anbar[]> {
    return await this.anbarService.findAllByUserId(userId);
  }

  // новый анбар
  @Post('create')
  postCreateNewAnbar(@Body() newAnbarDto: NewAnbarDto): Promise<{
    message: string;
    newAnbar?: Anbar;
  }> {
    return this.anbarService.createNewAnbar(newAnbarDto);
  }

  @Post('transfer-stock')
  transferStock(@Body() transferStockDto: TransferStockDto): Promise<{
    message: string;
    fromAnbar?: Anbar;
    toAnbar?: Anbar;
  }> {
    return this.anbarService.transferStock(transferStockDto);
  }

  @Post('confirm-order-received')
  confirmReceived(@Body() confirmReceivedDto: ConfirmReceivedDto): Promise<{
    message: string;
    orderedState: boolean;
  }> {
    return this.anbarService.confirmReceived(confirmReceivedDto);
  }

  @Post('cancel-order')
  cancelOrder(@Body('anbarId') anbarId: number): Promise<{
    message: string;
    orderedState: boolean;
  }> {
    return this.anbarService.cancelOrder(anbarId);
  }
}
