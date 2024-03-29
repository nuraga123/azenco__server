import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  IAddAndUpdateProduct,
  IProductResponse,
  IProductsFilter,
  IProductsQuery,
  IValidateProduct,
} from './types';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  processProductPrice(product: Product): void {
    if (product && product.price) {
      product.price = Number(product.price);
    }
  }

  async findOneProduct(id: number): Promise<IProductResponse> {
    const product = await this.productModel.findByPk(id);
    if (!product) {
      return { error: `Продукт с ID ${id} не найден` };
    }
    this.processProductPrice(product);
    return { product };
  }

  async findOneByName(name: string): Promise<IProductResponse> {
    const product = await this.productModel.findOne({ where: { name } });

    if (!product) {
      return { error: `Продукт с именем777 ${name} не найден` };
    }

    this.processProductPrice(product);
    return { product };
  }

  async findProductByAzencoCode(
    azenco__code: string,
  ): Promise<IProductResponse> {
    const product = await this.productModel.findOne({
      where: { azenco__code },
    });

    if (!product) {
      return {
        error: `Продукт с кодом Azenco ${azenco__code} не найден`,
      };
    }

    this.processProductPrice(product);
    return { product };
  }

  async validateAddProduct({ productDto }: IValidateProduct): Promise<string> {
    const { name, azenco__code, price, type, unit } = productDto;

    // Инициализация пустого массива для хранения ошибок
    const errors: string[] = [];

    // Проверка наличия и корректности имени продукта
    if (typeof name !== 'string' || name.length < 3 || name.length > 100) {
      errors.push('Название продукта должно быть строкой от 3 до 100 символов');
    }

    // Проверка наличия и корректности кода Azenco
    if (typeof azenco__code !== 'string' || azenco__code.length !== 9) {
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
    const existingProductName = await this.findOneByName(name);
    if (existingProductName?.product) {
      errors.push('ProductName уже есть в базе данных');
    }

    // Проверка наличия продукта с таким же кодом Azenco
    const existingProductAzencoCode =
      await this.findProductByAzencoCode(azenco__code);
    if (existingProductAzencoCode?.product) {
      errors.push('Azenco Code уже есть в базе данных');
    }

    // Возврат ошибок, если они были обнаружены
    if (errors.length > 0) {
      return errors.join(', ');
    }

    // Если ошибок нет, возвращаем пустую строку (нет ошибок)
    return '';
  }

  async validateUpdateProduct({
    productDto,
    productId,
  }: IValidateProduct): Promise<string> {
    // Извлечение параметров продукта из объекта DTO
    const { name, azenco__code, price, type, unit } = productDto;
    // Получение существующего продукта по ID
    const { product } = await this.findOneProduct(productId);

    // Проверка наличия продукта для обновления
    if (!product) {
      return 'Продукт для обновления не найден';
    }

    // Инициализация пустого массива для хранения ошибок
    const errors: string[] = [];

    // Проверка и коррекция имени продукта, если оно передано для обновления
    if (name && name === product.name) {
      // Проверка, что новое имя не совпадает с текущим именем продукта
      const existingProductName = await this.findOneByName(name);
      if (existingProductName?.product) {
        errors.push('название продукта уже есть в базе данных');
      }
      errors.push('название продукта не обновлен');
    }

    // Проверка и коррекция кода Azenco, если он передан для обновления
    if (azenco__code && azenco__code === product.azenco__code) {
      // Проверка, что новый код Azenco не совпадает с текущим кодом
      const existingProductAzencoCode =
        await this.findProductByAzencoCode(azenco__code);
      if (existingProductAzencoCode?.product) {
        errors.push('Azenco Code уже есть в базе данных');
      }
      errors.push('Azenco Code не обновлен');
    }

    //Проверка и коррекция цены продукта, если она передана для обновления
    this.logger.log('Проверка и коррекция цены продукта');
    this.logger.log(price);
    this.logger.log(typeof price !== 'number' || isNaN(price) || price <= 0);
    if (price && typeof price !== 'number') {
      if (isNaN(price) || price <= 0) {
        this.logger.log(price);
        errors.push('Цена должна быть числом больше 0');
      } else if (price === product.price) {
        errors.push('Цена старая');
      }
      return '';
    }

    // Проверка и коррекция типа продукта, если он передан для обновления
    if (type && type === product.type) {
      // Проверка, что новый тип не совпадает с текущим типом продукта
      if (typeof type !== 'string' || type.length <= 1) {
        errors.push('Тип должен быть строкой длиной больше 1 символа');
      }
      errors.push('Тип не обновлен');
    }

    // Проверка и коррекция единицы измерения, если она передана для обновления
    if (unit && unit === product.unit) {
      // Проверка, что новая единица измерения не совпадает с текущей
      if (typeof unit !== 'string' || unit.length <= 1) {
        errors.push(
          'Единица измерения должна быть строкой длиной больше 1 символа',
        );
      }
      errors.push('Единица измерения не обновлено');
    }

    // Возврат ошибок, если они были обнаружены
    if (errors.length > 0) {
      return errors.join(', ');
    }

    // Если ошибок нет, возвращаем пустую строку (нет ошибок)
    return '';
  }

  async paginateAndFilterOrSortProducts(
    query: IProductsQuery,
  ): Promise<{ count: number; rows: Product[] }> {
    const { limit, offset, sortBy, priceFrom, priceTo, bolt, PRR, earring } =
      query;

    const filter: Partial<IProductsFilter> = {};

    if (priceFrom && priceTo) {
      filter.price = {
        [Op.between]: [+priceFrom, +priceTo],
      };
    }

    if (bolt) {
      filter.bolt = JSON.parse(decodeURIComponent(bolt));
    }

    if (PRR) {
      filter.PRR = JSON.parse(decodeURIComponent(PRR));
    }

    if (earring) {
      filter.earring = JSON.parse(decodeURIComponent(earring));
    }

    const orderDirection = sortBy === 'asc' ? 'asc' : 'desc';

    const { count, rows: products } = await this.productModel.findAndCountAll({
      limit: +limit,
      offset: +offset * 3,
      where: filter,
      order: [[Sequelize.literal('CAST(price AS DECIMAL)'), orderDirection]],
    });

    products.forEach(this.processProductPrice);

    return { count, rows: products };
  }

  async addProduct(
    productDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    const validationError = await this.validateAddProduct({ productDto });
    if (validationError) {
      return { error: validationError, success: false };
    }

    const product = await this.productModel.create({ ...productDto });
    return { success: true, message: `Создан товар ${product.name}`, product };
  }

  async updateProduct(
    productId: number,
    productDto: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    // Находим продукт по его идентификатору
    const { product } = await this.findOneProduct(productId);

    // Проверяем валидность данных для обновления продукта
    const validationError = await this.validateUpdateProduct({
      productDto,
      productId,
    });

    // Если есть ошибки валидации, возвращаем их
    if (validationError) return { success: false, error: validationError };

    // Обновляем данные продукта с использованием предоставленных данных
    const updatedProduct = await product.update(productDto);

    // Обрабатываем цену продукта (возможно, применяем какие-то дополнительные действия)
    this.processProductPrice(updatedProduct);

    // Сохраняем обновленный продукт в базе данных
    await updatedProduct.save();

    // Возвращаем успешный результат обновления продукта
    return {
      success: true,
      message: `Успешно обновлен ${updatedProduct.name}`,
      product: updatedProduct,
    };
  }

  async removeProduct(id: number): Promise<string | { error: string }> {
    const productPromise = await this.findOneProduct(id);
    if ('error' in productPromise) {
      return { error: productPromise.error };
    }
    const product = productPromise.product;

    await product.destroy();
    return `Продукт "${product.name}" удален успешно`;
  }

  async findAllPartByNameProducts(partname: string): Promise<Product[]> {
    const products = await this.productModel.findAll({
      where: {
        name: { [Op.like]: `%${partname}%` },
      },
    });

    products.forEach(this.processProductPrice);
    return products;
  }
}
