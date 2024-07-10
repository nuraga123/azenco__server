/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';

import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import {
  IAddAndUpdateProduct,
  IProductResponse,
  ICountAndRowsProductsResponse,
  IProductsFilter,
  IProductsQuery,
  IProductsResponse,
  IValidateProduct,
  IDeleteProduct,
  IUpdateProduct,
} from './types';
import { ErrorService } from 'src/errors/errors.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    private readonly errorsService: ErrorService,
  ) {
    /**/
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
      if (!product) return { error_message: `Продукт с ID ${id} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска всех продуктов
  async findProducts(): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll();
      if (!products.length) return { error_message: `Продукты не найдены` };
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его имени
  async findByNameProduct(name: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({ where: { name } });
      if (!product)
        return { error_message: `Продукт с именем ${name} не найден` };
      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продукта по его коду Azenco
  async findByAzencoCodeProduct(azencoCode: string): Promise<IProductResponse> {
    try {
      const product = await this.productModel.findOne({
        where: { azencoCode },
      });

      if (!product) {
        return {
          error_message: `Продукт с кодом Azenco ${azencoCode} не найден`,
        };
      }

      return this.processProductPrice(product);
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для поиска продуктов по их типу
  async findByTypeProducts(type: string): Promise<IProductsResponse> {
    try {
      const products = await this.productModel.findAll({ where: { type } });

      if (!products?.length) {
        return { error_message: `Продукт с type ${type} не найден` };
      }

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
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

      if (!products.length)
        return { error_message: `не существует ${part_name} ` };

      products.forEach(this.processProductPrice);
      return { products };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для валидации данных нового продукта
  async validateProduct({ productDto }: IValidateProduct): Promise<string> {
    const { name, azencoCode, price, unit } = productDto;

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

    // Проверка наличия и корректности единицы измерения
    if (typeof unit !== 'string') {
      errors.push(
        'Единица измерения должна быть строкой длиной больше 1 символа',
      );
    }

    // Проверка наличия продукта с таким же именем
    const existingProductName = (await this.findByNameProduct(name))?.product
      ?.name;

    if (existingProductName) {
      errors.push(`Artıq eyni Adlı material var: ${existingProductName}`);
    }

    // Проверка наличия продукта с таким же кодом Azenco
    const existingProductAzencoCode = (
      await this.findByAzencoCodeProduct(azencoCode)
    )?.product?.azencoCode;

    if (existingProductAzencoCode) {
      errors.push(
        `Artıq eyni Azenco Koda material var: ${existingProductAzencoCode}`,
      );
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
      const { limit, offset, sortBy, priceFrom, priceTo } = query;

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

      const orderDirection = sortBy === 'asc' ? 'asc' : 'desc';

      const { count, rows } = await this.productModel.findAndCountAll({
        limit: +limit,
        offset: +offset * +limit,
        where: filter,
        order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
      });

      rows.forEach(this.processProductPrice);

      rows.sort((a: Product, b: Product) =>
        sortBy === 'asc' ? +a.price - +b.price : +b.price - +a.price,
      );

      return { count, rows };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для добавления нового продукта
  async addProduct(
    productDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    try {
      const validationError = await this.validateProduct({ productDto });
      if (validationError) {
        return { error_message: validationError, success: false };
      }

      const product = await this.productModel.create({ ...productDto });
      return {
        success: true,
        message: `Materialı yaratdınız ${product.name}`,
        product,
      };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для обновления информации о продукте
  async updateProduct({
    productId,
    updatedProduct,
  }: IUpdateProduct): Promise<IAddAndUpdateProduct> {
    try {
      // Находим продукт по его идентификатору
      const { product, error_message } = await this.findOneProduct(productId);

      if (error_message) return { success: false, error_message };

      // Обновляем поля продукта на основе данных из DTO
      product.name =
        updatedProduct.name && updatedProduct.name.length > 2
          ? updatedProduct.name
          : product.name;

      product.azencoCode =
        updatedProduct.azencoCode && updatedProduct.azencoCode.length > 2
          ? updatedProduct.azencoCode
          : product.azencoCode;

      product.price =
        updatedProduct.price && updatedProduct.price > 0
          ? +updatedProduct.price
          : +product.price;

      product.type =
        updatedProduct.type && updatedProduct.type.length >= 1
          ? updatedProduct.type
          : product.type;

      product.unit = !!updatedProduct.unit ? updatedProduct.unit : product.unit;

      product.img =
        updatedProduct.img && updatedProduct.img.length >= 1
          ? updatedProduct.img
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
      return this.errorsService.errorsMessage(e);
    }
  }

  // Метод для удаления продукта
  async removeProduct(id: number): Promise<IDeleteProduct> {
    try {
      const { product, error_message } = await this.findOneProduct(id);
      if (error_message) return { error_message };
      await product.destroy();
      return { message: `Продукт "${product.name}" удален успешно` };
    } catch (e) {
      return this.errorsService.errorsMessage(e);
    }
  }

  async importJSON(json: string) {
    try {
      const products = JSON.parse(json);

      this.errorsService.log(json);

      // for (let index = 0; index < products.length; index++) {
      //   const element = products[index];
      //   this.errorsService.log(element);
      //   await this.addProduct(element);
      // }

      const result = await this.productModel.bulkCreate(products);
      this.errorsService.log('result');
      this.errorsService.log([...result]);

      if (result.length) {
        const createdProducts = await this.findProducts();
        return { createdProducts };
      }
      return { message: 'не получилось !' };
    } catch (error) {
      return this.errorsService.errorsMessage(error);
    }
  }

// Метод для поиска продуктов по имени или коду с поддержкой фильтрации по диапазону цен
async searchProducts(
  query: IProductsQuery,
  type: 'name' | 'code', // Тип поиска: 'name' или 'code'
  searchValue: string, // Значение для поиска
  priceFrom?: string, // Цена от (необязательный параметр)
  priceTo?: string, // Цена до (необязательный параметр)
): Promise<ICountAndRowsProductsResponse> {
  try {
    const { limit = 20, offset = 0, sortBy = 'asc' } = query;
    const orderDirection = sortBy === 'asc' ? 'asc' : 'desc';
    const filter: any = {};

    // Установка условия поиска по имени или коду
    if (type === 'name') {
      filter.name = { [Op.like]: `%${searchValue}%` };
    } else if (type === 'code') {
      filter.azencoCode = searchValue;
    }

    // Установка условий фильтрации по диапазону цен
    if (priceFrom && priceTo) {
      filter.price = {
        [Op.between]: [+priceFrom, +priceTo],
      };
    } else if (priceFrom) {
      filter.price = {
        [Op.gte]: +priceFrom,
      };
    } else if (priceTo) {
      filter.price = {
        [Op.lte]: +priceTo,
      };
    }

    // Поиск продуктов по заданным условиям
    const { rows, count } = await this.productModel.findAndCountAll({
      limit: +limit,
      offset: +offset,
      where: filter,
      order: [['price', orderDirection]], // Сортировка по цене
    });

    // Проверка наличия продуктов
    if (!count) {
      return { error_message: `Göstərilən filtrdən istifadə edərək məhsul tapılmadı` };
    }

    // Обработка цены для каждого продукта
    for (const product of rows) {
      await this.processProductPrice(product);
    }

    return { rows, count };
  } catch (e) {
    return this.errorsService.errorsMessage(e);
  }
}

}
