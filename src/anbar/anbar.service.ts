import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Anbar } from './anbar.model';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class AnbarService {
  constructor(
    @InjectModel(Anbar)
    private anbarModal: typeof Anbar,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(userId: number | string): Promise<Anbar[]> {
    return this.anbarModal.findAll({ where: {  } })
  }
}
