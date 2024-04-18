import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BrokenAnbarService } from './broken_anbar.service';
import { NewAnbarDto } from './dto/new-anbar.dto';
import {
  IAnbarResponce,
  IAnbarsResponce,
  IAnbarsUsernamesResponse,
} from './types';

@Controller('anbars/broken')
export class BrokenAnbarController {
  constructor(private readonly brokenAnbarService: BrokenAnbarService) {}

  // получение имен анбаров
  @Post('usernames')
  getAnbarsUsernames(
    @Body('name') name: string,
  ): Promise<IAnbarsUsernamesResponse> {
    return this.brokenAnbarService.getAnbarsUsernames(name);
  }

  // все анбары
  @Get('all')
  getAnbars(): Promise<IAnbarsResponce> {
    return this.brokenAnbarService.findAll();
  }

  // поиск по id анбара
  @Get(':id')
  async getFindOneAnbar(@Param('id') anbarId: number): Promise<IAnbarResponce> {
    return await this.brokenAnbarService.findOneAnbarId(anbarId);
  }

  // поиск по userId
  @Get('user/:id')
  async getAnbarsByUserId(
    @Param('id') userId: number,
  ): Promise<IAnbarsResponce> {
    return await this.brokenAnbarService.findAllByUserId(userId);
  }

  // новый анбар
  @Post('create')
  postCreateNewAnbar(
    @Body() newAnbarDto: NewAnbarDto,
  ): Promise<IAnbarResponce> {
    return this.brokenAnbarService.createNewAnbar(newAnbarDto);
  }
}
