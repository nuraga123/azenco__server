import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  IAddAndUpdateProduct,
  IProductResponse,
  ICountAndRowsProductsResponse,
  IProductsFilter,
  IProductsQuery,
  IProductsResponse,
  IValidateCreateProduct,
  IError,
} from './types';
import { validate } from 'class-validator';
import { AxiosError } from 'axios';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  // возврашает ошибку
  async errorsMessage(e: any): Promise<IError> {
    this.logger.log(e);
    return { error: (e as AxiosError).message };
  }

  // возврашает продукт с типом price: number
  async processProductPrice(product: Product): Promise<{ product: Product }> {
    if (product && product?.price) product.price = +product.price;
    return { product };
  }

  async findOneProduct(id: number): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findByPk(id);
      if (!product) return { error: `Продукт с ID ${id} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  async findByNameProduct(name: string): Promise<IProductResponse> {
    const product = await this.productModel.findOne({ where: { name } });
    if (!product) return { error: `Продукт с именем ${name} не найден` };
    return this.processProductPrice(product);
  }

  async findByAzencoCodeProduct(azencoCode: string): Promise<IProductResponse> {
    const product = await this.productModel.findOne({ where: { azencoCode } });

    if (!product) {
      return { error: `Продукт с кодом Azenco ${azencoCode} не найден` };
    }

    return this.processProductPrice(product);
  }

  async findByTypeProducts(type: string): Promise<IProductsResponse> {
    const products = await this.productModel.findAll({ where: { type } });

    if (!products?.length) return { error: `Продукт с type ${type} не найден` };

    products.forEach(this.processProductPrice);
    return { products };
  }

  async validateAddProduct({
    productDto,
  }: IValidateCreateProduct): Promise<string> {
    const { name, azencoCode, price, type, unit } = productDto;

    // Инициализация пустого массива для хранения ошибок
    const errors: string[] = [];

    // Проверка наличия и корректности имени продукта
    if (typeof name !== 'string' || name.length < 3 || name.length > 100) {
      errors.push('Название продукта должно быть строкой от 3 до 100 символов');
    }

    // Проверка наличия и корректности кода Azenco
    if (typeof azencoCode !== 'string' || azencoCode.length !== 9) {
      errors.push('Код Azenco должен состоять из 9 символов');
    }

    // Проверка наличия и корректности цены
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      errors.push('Цена должна быть числом больше 0');
    }

    // Проверка наличия и корректности типа продукта
    if (typeof type !== 'string' || type.length <= 1) {
      errors.push('Тип должен быть строкой длиной больше 1 символа');
    }

    // Проверка наличия и корректности единицы измерения
    if (typeof unit !== 'string' || unit.length <= 1) {
      errors.push(
        'Единица измерения должна быть строкой длиной больше 1 символа',
      );
    }

    // Проверка наличия продукта с таким же именем
    const existingProductName = await this.findByNameProduct(name);
    if (existingProductName?.product) {
      errors.push('ProductName уже есть в базе данных');
    }

    // Проверка наличия продукта с таким же кодом Azenco
    const existingProductAzencoCode =
      await this.findByAzencoCodeProduct(azencoCode);
    if (existingProductAzencoCode?.product) {
      errors.push('Azenco Code уже есть в базе данных');
    }

    // Возврат ошибок, если они были обнаружены
    if (errors.length > 0) return errors.join(', ');

    // Если ошибок нет, возвращаем пустую строку (нет ошибок)
    return '';
  }

  async paginateAndFilterOrSortProducts(
    query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
    const { limit, offset, sortBy, priceFrom, priceTo, bolt, PRR, earring } =
      query;

    const filter: Partial<IProductsFilter> = {};

    if (priceFrom && priceTo) {
      filter.price = {
        [Op.between]: [+priceFrom, +priceTo],
      };
    }

    if (bolt) filter.bolt = JSON.parse(decodeURIComponent(bolt));

    if (PRR) {
      filter.PRR = JSON.parse(decodeURIComponent(PRR));
    }

    if (earring) {
      filter.earring = JSON.parse(decodeURIComponent(earring));
    }

    const orderDirection = sortBy === 'asc' ? 'asc' : 'desc';

    const { count, rows } = await this.productModel.findAndCountAll({
      limit: +limit,
      offset: +offset * 3,
      where: filter,
      order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
    });

    rows.forEach(this.processProductPrice);
    return { count, rows };
  }

  async addProduct(
    productDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    const validationError = await this.validateAddProduct({ productDto });
    if (validationError) return { error: validationError, success: false };

    const product = await this.productModel.create({ ...productDto });
    return { success: true, message: `Создан товар ${product.name}`, product };
  }

  async updateProduct(
    productId: number,
    productDto: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    try {
      // Находим продукт по его идентификатору
      const { product } = await this.findOneProduct(productId);

      if (!product) {
        return {
          success: false,
          error: 'Продукт не найден',
        };
      }

      // Проверяем каждое поле productDto и устанавливаем его значение из product, если не передано
      Object.keys(productDto).forEach((key) => {
        if (productDto[key] === undefined || productDto[key] === '') {
          productDto[key] = product[key];
        }
      });

      // Проверяем валидацию productDto
      const errors = await validate(productDto);

      if (errors.length > 0) {
        return {
          success: false,
          message: 'Ошибка валидации',
          error: errors
            .map((error) => Object.values(error.constraints))
            .flat()
            .join('! '),
        };
      }

      // Обрабатываем цену продукта (возможно, применяем какие-то дополнительные действия)
      this.processProductPrice(product);

      // Сохраняем обновленный продукт в базе данных
      await product.save();

      // Возвращаем успешный результат обновления продукта
      return {
        success: true,
        message: `Успешно обновлен ${product.name}`,
        product: product,
      };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  async removeProduct(id: number): Promise<string | { error: string }> {
    const { product, error } = await this.findOneProduct(id);
    if (error) return { error };
    await product.destroy();
    return `Продукт "${product.name}" удален успешно`;
  }

  async findAllPartByNameProducts(
    part_name: string,
  ): Promise<IProductsResponse> {
    const products = await this.productModel.findAll({
      where: {
        name: { [Op.like]: `%${part_name}%` },
      },
    });

    if (!products.length) {
      return {
        error: `нет существует тип ${part_name} `,
      };
    }

    products.forEach(this.processProductPrice);
    return { products };
  }
}
