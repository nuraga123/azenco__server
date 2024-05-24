import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { History } from './history.model';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // Создание новой записи в истории
  @Post('create')
  async create(@Body() createHistoryDto: CreateHistoryDto): Promise<History> {
    return this.historyService.createHistory(createHistoryDto);
  }

  // Получение всех записей истории
  @Get('all')
  async findAll(): Promise<History[]> {
    return this.historyService.findAllHistoryArr();
  }

  // Получение одной записи истории по ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<History> {
    return this.historyService.findOneHistory(id);
  }

  // Получение всех записей истории для конкретного пользователя по userId
  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: number): Promise<History[]> {
    return this.historyService.findAllUserIdHistory(userId);
  }
}
