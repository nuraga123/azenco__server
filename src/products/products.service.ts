import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Product } from './product.model';
import { IProductsFilter, IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) { }

  async processProductPrice(product: Product): Promise<Product> {
    if (product?.price) {
      product.price = Number(product.price);
      return product;
    }
    return product;
  }

  async paginateAndFilterOrSortProducts(query: IProductsQuery): Promise<{
    count: number;
    rows: Product[];
  }> {
    const limit = +query.limit;
    const offset = +query.offset * 3;

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

    products.rows.forEach(this.processProductPrice);

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
      const { name, azenco__code, price, type, unit } = createProductDto;

      // проверки имени на валидность
      if (typeof name !== 'string') {
        return {
          success: false,
          error: `цена продукта не число: ${price} !`,
        };
      }

      if (name.length <= 3) {
        return {
          success: false,
          error: `название продукта должно быть больше 2 символов !`,
        };
      }

      if (name.length >= 100) {
        return {
          success: false,
          error: `название продукта должно быть меньше 100 символов !`,
        };
      }

      // проверки azenco__code на валидность
      if (typeof azenco__code !== 'string') {
        return {
          success: false,
          error: `цена продукта не число: ${price} !`,
        };
      }

      if (azenco__code.length < 9) {
        return {
          success: false,
          error: `название продукта должно быть больше 8 символов !`,
        };
      }

      if (azenco__code.length > 9) {
        return {
          success: false,
          error: `название продукта должно быть меньше 9 символов !`,
        };
      }

      // проверки цены на валидность
      if (typeof price !== 'number') {
        return {
          success: false,
          error: `цена продукта не число: ${price} !`,
        };
      }

      if (price <= 0) {
        return {
          success: false,
          error: 'цена не должна быть равен или меньше 0 !',
        };
      }

      // проверка типа продукта
      if (type.length <= 1 || typeof type !== 'string') {
        return {
          success: false,
          error: 'type не должен быть больше 1 и должен быть строкой!',
        };
      }

      // проверка unit продукта
      if (unit.length <= 1 || typeof unit !== 'string') {
        return {
          success: false,
          error: 'unit не должен быть больше 1 и должен быть строкой!',
        };
      }

      // проверка повторных данных имени и azenco__code
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
      this.logger.log({ ...product.dataValues });
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

  async removeProductId(id: number) {
    const findProduct = await this.findOneProduct(id);
    if (findProduct) {
      findProduct.destroy();
      return `${findProduct.name} удален !`;
    } else {
      return 'не найден продукт';
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { name, azenco__code, price, type, unit } = updateProductDto;

      // Проверка имени продукта
      if (typeof name !== 'string' || name.length <= 2 || name.length >= 100) {
        return {
          success: false,
          error: 'Название продукта должно быть строкой от 3 до 99 символов',
        };
      }

      // Проверка кода azenco
      if (
        azenco__code &&
        (typeof azenco__code !== 'string' || azenco__code.length !== 9)
      ) {
        return {
          success: false,
          error: 'Код azenco должен быть строкой из 9 символов',
        };
      }

      // Проверка цены продукта
      if (price && (typeof price !== 'number' || isNaN(price) || price <= 0)) {
        return {
          success: false,
          error: 'Цена продукта должна быть числом больше 0',
        };
      }

      // Проверка типа продукта
      if (type && (typeof type !== 'string' || type.length <= 1)) {
        return {
          success: false,
          error: 'Тип продукта должен быть строкой длиной больше 1 символа',
        };
      }

      // Проверка единицы измерения продукта
      if (unit && (typeof unit !== 'string' || unit.length <= 1)) {
        return {
          success: false,
          error:
            'Единица измерения продукта должна быть строкой длиной больше 1 символа',
        };
      }

      const product = await this.findOneProduct(id);
      this.logger.log({ ...product });

      if (!product) {
        return {
          success: false,
          error: `Продукт с ID ${id} не найден`,
        };
      }

      // Проверка на идентичность свойств нового объекта существующему объекту
      if (
        (name && name === product.name) ||
        (azenco__code && azenco__code === product.azenco__code) ||
        (price && price === product.price) ||
        (type && type === product.type) ||
        (unit && unit === product.unit)
      ) {
        return {
          success: false,
          error: `Данные совпадают с существующими данными: name=${name}, type=${type}, unit=${unit}, azenco__code=${azenco__code}, price=${price}`,
        };
      }

      // Обновление продукта
      const updatedProduct: Product = await product.update(updateProductDto);

      this.logger.log(`Продукт с ID ${id} обновлен`);
      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: `Ошибка при обновлении продукта: ${error.message} `,
      };
    }
  }
}
