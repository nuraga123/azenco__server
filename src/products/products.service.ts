import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { AxiosError } from 'axios';

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

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {
    /**/
  }

  // Метод для обработки ошибок
  async errorsMessage(e: any): Promise<IError> {
    this.logger.log(e);
    return { error: (e as AxiosError).message };
  }

  // Метод для обработки цены продукта
  async processProductPrice(product: Product): Promise<{ product: Product }> {
    if (product && product?.price) product.price = +product.price;
    return { product };
  }

  // Метод для поиска продукта по его идентификатору
  async findOneProduct(id: number): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findByPk(id);
      if (!product) return { error: `Продукт с ID ${id} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его имени
  async findByNameProduct(name: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({ where: { name } });
      if (!product) return { error: `Продукт с именем ${name} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его коду Azenco
  async findByAzencoCodeProduct(azencoCode: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({
        where: { azencoCode },
      });

      if (!product) {
        return { error: `Продукт с кодом Azenco ${azencoCode} не найден` };
      }

      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для поиска продуктов по их типу
  async findByTypeProducts(type: string): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll({ where: { type } });

      if (!products?.length) {
        return { error: `Продукт с type ${type} не найден` };
      }

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для валидации данных нового продукта
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

  // Метод для пагинации, фильтрации или сортировки продуктов
  async paginateAndFilterOrSortProducts(
    query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
    try {
      const { limit, offset, sortBy, priceFrom, priceTo, bolt, PRR, earring } =
        query;

      if (!limit && !offset) {
        const { count, rows } = await this.productModel.findAndCountAll({
          limit: 20,
          offset: 0,
        });

        rows.forEach(this.processProductPrice);
        return { count, rows };
      }

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
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для добавления нового продукта
  async addProduct(
    productDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    try {
      const validationError = await this.validateAddProduct({ productDto });
      if (validationError) return { error: validationError, success: false };

      const product = await this.productModel.create({ ...productDto });
      return {
        success: true,
        message: `Создан товар ${product.name}`,
        product,
      };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для обновления информации о продукте
  async updateProduct(
    productId: number,
    productDto: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    try {
      // Находим продукт по его идентификатору
      const { product, error } = await this.findOneProduct(productId);

      if (error) return { success: false, error };

      // Обновляем поля продукта на основе данных из DTO
      product.name =
        productDto.name && productDto.name.length > 2
          ? productDto.name
          : product.name;

      product.azencoCode =
        productDto.azencoCode && productDto.azencoCode.length > 2
          ? productDto.azencoCode
          : product.azencoCode;

      product.price =
        productDto.price && productDto.price > 0
          ? +productDto.price
          : +product.price;

      product.type =
        productDto.type && productDto.type.length >= 1
          ? productDto.type
          : product.type;

      product.unit =
        productDto.unit && productDto.unit.length >= 1
          ? productDto.unit
          : product.unit;

      product.img =
        productDto.img && productDto.img.length >= 1
          ? productDto.img
          : product.img;

      // Сохраняем обновленный продукт в базе данных
      await product.save();

      // Обрабатываем цену продукта (возможно, применяем какие-то дополнительные действия)
      await this.processProductPrice(product);

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

  // Метод для поиска продуктов по части имени
  async findAllPartByNameProducts(
    part_name: string,
  ): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll({
        where: {
          name: { [Op.like]: `%${part_name}%` },
        },
      });

      if (!products.length) return { error: `не существует ${part_name} ` };

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsMessage(e);
    }
  }

  // Метод для удаления продукта
  async removeProduct(id: number): Promise<string | IError> {
    try {
      const { product, error } = await this.findOneProduct(id);
      if (error) return { error };
      await product.destroy();
      return `Продукт "${product.name}" удален успешно`;
    } catch (e) {
      return this.errorsMessage(e);
    }
  }
}
