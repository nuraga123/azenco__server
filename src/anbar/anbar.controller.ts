import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnbarService } from './anbar.service';
import { AddToAnbarDto } from './dto/add-to-anbar';
import { TransferStockDto } from './dto/transfer-stock-anbar.dto';
import { ConfirmReceivedDto } from './dto/confirm-received.dto';
import { Anbar } from './anbar.model';

@Controller('anbar')
export class AnbarController {
  constructor(private readonly anbarService: AnbarService) {}

  @Get('all')
  getAnbars() {
    return this.anbarService.findAll();
  }

  @Get(':id')
  getAnbarOne(@Param('id') userId: string): Promise<Anbar[]> {
    return this.anbarService.findOne(userId);
  }

  @Post('/add')
  addToAnbar(@Body() addToAnbarDto: AddToAnbarDto): Promise<{
    message: string;
    newAnbar?: Anbar;
  }> {
    return this.anbarService.addAnbar(addToAnbarDto);
  }

  @Post('transfer-stock')
  transferStock(@Body() transferStockDto: TransferStockDto): Promise<{
    message: string;
    fromAnbar?: Anbar;
    toAnbar?: Anbar;
  }> {
    return this.anbarService.transferStock(transferStockDto);
  }

  @Post('confirm-received')
  confirmReceived(@Body() confirmReceivedDto: ConfirmReceivedDto): Promise<{
    message: string;
    orderedState: boolean;
  }> {
    return this.anbarService.confirmReceived(confirmReceivedDto);
  }
}
