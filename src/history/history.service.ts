import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { History } from './history.model';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History)
    private readonly historyModel: typeof History,
  ) {}

  async createHistory(createHistoryDto: CreateHistoryDto): Promise<History> {
    return this.historyModel.create(createHistoryDto);
  }

  async findAllHistoryArr(): Promise<History[]> {
    return this.historyModel.findAll();
  }

  async findOneHistory(id: number): Promise<History> {
    return this.historyModel.findByPk(id);
  }

  async findAllUserIdHistory(userId: number) {
    return this.historyModel.findAll({ where: { userId } });
  }
}
