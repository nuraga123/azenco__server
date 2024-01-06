import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { Op, Sequelize } from 'sequelize';
import { IProductsFilter, IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';

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
      filter.bolt = JSON.parse(decodeURIComponent(query.bolt));
    }

    if (query.PRR) {
      filter.PRR = JSON.parse(decodeURIComponent(query.PRR));
    }

    if (query.earring) {
      filter.earring = JSON.parse(decodeURIComponent(query.earring));
    }

    const orderDirection = query.sortBy === 'asc' ? 'asc' : 'desc';

    return this.productModel.findAndCountAll({
      limit,
      offset,
      where: filter,
      order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
    });
  }

  async findOneProduct(filter: {
    where: { id: number | string };
  }): Promise<Product | null> {
    return this.productModel.findOne(filter);
  }

  findProductNameAndAzencoCode(filter: {
    where: { name?: string; azenco__code?: string };
  }): Promise<Product | null> {
    return this.productModel.findOne(filter);
  }

  async addProduct(
    createProductDto: CreateProductDto,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const existingProductName = await this.findProductNameAndAzencoCode({
        where: { name: createProductDto.name },
      });

      const existingProductAzencoCode = await this.findProductNameAndAzencoCode(
        {
          where: { azenco__code: createProductDto.azenco__code },
        },
      );

      if (existingProductName) {
        return {
          success: false,
          error: `Продукт с именем ${createProductDto.name} уже существует`,
        };
      }

      if (existingProductAzencoCode) {
        return {
          success: false,
          error: `Продукт с кодом azenco__code: ${createProductDto.azenco__code} уже существует `,
        };
      }

      const product = await this.productModel.create({
        ...createProductDto,
      });

      return { success: true, product };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        error: `Ошибка при добавлении продукта: ${error.message}`,
      };
    }
  }
}
