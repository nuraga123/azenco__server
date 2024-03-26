import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, where } from 'sequelize';
import { Product } from './product.model';
import { IProductsFilter, IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async processProductPrice(product: Product): Promise<Product> {
    const { dataValues } = product;
    return { ...dataValues, price: +product.price } as Product;
  }

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

    const products = await this.productModel.findAndCountAll({
      limit,
      offset,
      where: filter,
      order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
    });

    products.rows.forEach((item) => this.processProductPrice(item));

    return products;
  }

  async findOneProduct(id: number): Promise<Product> {
    const product = await this.productModel.findOne({ where: { id } });
    return this.processProductPrice(product);
  }

  async findOneByName(name: string): Promise<Product> {
    const product = await this.productModel.findOne({ where: { name } });
    return this.processProductPrice(product);
  }

  async findProductAzencoCode(azenco__code: string): Promise<Product | null> {
    const product = await this.productModel.findOne({
      where: { azenco__code },
    });
    return this.processProductPrice(product);
  }

  async addProduct(
    createProductDto: CreateProductDto,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { name, azenco__code, price } = createProductDto;

      if (typeof price !== 'number') {
        return {
          success: false,
          error: `цена продукта не число: ${price} !`,
        };
      }

      if (price === 0) {
        return {
          success: false,
          error: 'цена = 0 !',
        };
      }

      const existingProductName = await this.findOneByName(name);
      if (existingProductName) {
        this.logger.log(existingProductName);
        return {
          success: false,
          error: `Продукт с именем ${name} уже существует`,
        };
      }

      const existingProductAzencoCode =
        await this.findProductAzencoCode(azenco__code);

      if (existingProductAzencoCode) {
        return {
          success: false,
          error: `Продукт с кодом azenco__code: ${azenco__code} уже существует `,
        };
      }

      const product = await this.productModel.create({
        ...createProductDto,
      });

      this.logger.log(price);
      this.logger.log(product);
      return { success: true, product };
    } catch (error) {
      console.error(error);

      return {
        success: false,
        error: `Ошибка при добавлении продукта: ${error.message}`,
      };
    }
  }

  async findAllPartByNameProducts(partname: string): Promise<Product[]> {
    const searchProductsWord = await this.productModel.findAll({
      where: {
        name: {
          [Op.like]: `%${partname}%`,
        },
      },
    });

    searchProductsWord.forEach(this.processProductPrice);
    return searchProductsWord;
  }
}
