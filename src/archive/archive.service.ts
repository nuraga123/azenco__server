import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Archive } from './archive.model';
import { CreateArchiveDto } from './dto/create-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectModel(Archive)
    private readonly archiveModel: typeof Archive,
  ) {}

  async createArchive(createArchiveDto: CreateArchiveDto) {
    return await this.archiveModel.create({ ...createArchiveDto });
  }

  async findAllArchiveArr(): Promise<Archive[]> {
    return this.archiveModel.findAll();
  }

  async findOneArchive(id: number): Promise<Archive> {
    return this.archiveModel.findByPk(id);
  }

  async findAllUserIdArchive(userId: number) {
    return this.archiveModel.findAll({ where: { userId } });
  }
}
