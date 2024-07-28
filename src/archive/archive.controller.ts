import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { CreateArchiveDto } from './dto/create-archive.dto';
import { Archive } from './archive.model';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  // Создание новой записи в истории
  @Post('create')
  async create(@Body() createArchiveDto: CreateArchiveDto): Promise<Archive> {
    return this.archiveService.createArchive(createArchiveDto);
  }

  // Получение всех записей истории
  @Get('all')
  async findAll(): Promise<Archive[]> {
    return this.archiveService.findAllArchiveArr();
  }

  // Получение одной записи истории по ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Archive> {
    return this.archiveService.findOneArchive(id);
  }

  // Получение всех записей истории для конкретного пользователя по userId
  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: number): Promise<Archive[]> {
    return this.archiveService.findAllUserIdArchive(userId);
  }
}
