import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnbarService } from './anbar.service';
import { NewAnbarDto } from './dto/new-anbar.dto';
import {
  IAnbarsUsernamesResponse,
  IAnbarsResponce,
  IAnbarResponce,
} from './types';

@Controller('anbar')
export class AnbarController {
  constructor(private readonly anbarService: AnbarService) {}

  // получение имен анбаров
  @Post('usernames')
  getAnbarsUsernames(
    @Body('name') name: string,
  ): Promise<IAnbarsUsernamesResponse> {
    return this.anbarService.getAnbarsUsernames(name);
  }

  // все анбары
  @Get('all')
  getAnbars(): Promise<IAnbarsResponce> {
    return this.anbarService.findAll();
  }

  // поиск по id анбара
  @Get(':id')
  async getFindOneAnbarProduct(
    @Param('id') anbarId: number,
  ): Promise<IAnbarResponce> {
    return await this.anbarService.findOneAnbarId(anbarId);
  }

  // поиск по userId
  @Get('user/:id')
  async getAnbarByUserId(
    @Param('id') userId: number,
  ): Promise<IAnbarsResponce> {
    return await this.anbarService.findAllByUserId(userId);
  }

  // новый анбар
  @Post('create')
  postCreateNewAnbar(
    @Body() newAnbarDto: NewAnbarDto,
  ): Promise<IAnbarResponce> {
    return this.anbarService.createNewAnbar(newAnbarDto);
  }
}
