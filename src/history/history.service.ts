import { Injectable } from '@nestjs/common';
import { History } from './history.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History)
    private historyModel: typeof History,
  ) {}

  getHistories() {
    return this.historyModel.findAll();
  }

  async createHistory({
    message,
    username,
    userId,
  }: {
    message: string;
    username: string;
    userId: number;
  }): Promise<History> {
    try {
      return await this.historyModel.create({ message, username, userId });
    } catch (error) {
      throw new Error(`Unable to create history entry: ${error.message}`);
    }
  }
}
