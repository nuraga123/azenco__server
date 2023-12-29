import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { Op, Sequelize } from 'sequelize';
import { IProductsFilter, IProductsQuery } from './types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async paginateAndFilterOrSortProducts(query: IProductsQuery): Promise<{
    count: number;
    rows: Product[];
  }> {
    const limit = +query.limit;
    const offset = +query.offset * 20;

    const filter = {} as Partial<IProductsFilter>;

    if (query.priceFrom && query.priceTo) {
      filter.price = {
        [Op.between]: [+query.priceFrom, +query.priceTo],
      };
    }

    if (query.bolt) {
      filter.PRR = JSON.parse(decodeURIComponent(query.bolt));
    }

    if (query.PRR) {
      filter.PRR = JSON.parse(decodeURIComponent(query.PRR));
    }

    if (query.earring) {
      filter.PRR = JSON.parse(decodeURIComponent(query.earring));
    }

    const orderDirection = query.sortBy === 'asc' ? 'asc' : 'desc';

    return this.productModel.findAndCountAll({
      limit,
      offset,
      where: filter,
      order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
    });
  }
}
