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

  async validateProductData({
    productDto,
    updatedIdProduct,
  }: IValidateProduct): Promise<string> {
    const { name, azenco__code, price, type, unit } = productDto;

    if (typeof name !== 'string' || name.length < 3 || name.length > 100) {
      return 'Название продукта должно быть строкой от 3 до 100 символов';
    }

    if (typeof azenco__code !== 'string' || azenco__code.length !== 9) {
      return 'Код Azenco должен состоять из 9 символов';
    }

    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      return 'Цена должна быть числом больше 0';
    }

    if (typeof type !== 'string' || type.length <= 1) {
      return 'Тип должен быть строкой длиной больше 1 символа';
    }

    if (typeof unit !== 'string' || unit.length <= 1) {
      return 'Единица измерения должна быть строкой длиной больше 1 символа';
    }

    if (!updatedIdProduct) {
      const existingProductName = await this.findOneByName(name);
      if (existingProductName?.product) {
        return 'ProductName уже есть в базе данных';
      }

      const existingProductAzencoCode =
        await this.findProductByAzencoCode(azenco__code);

      if (existingProductAzencoCode?.product) {
        return 'Azenco Code уже есть в базе данных';
      }
    }

    if (updatedIdProduct) {
      const { product } = await this.findOneProduct(updatedIdProduct);

      if (name && name === product.name) {
        return 'Старое название продукта уже используется';
      }

      if (azenco__code && azenco__code === product.azenco__code) {
        return 'Старый код Azenco уже используется';
      }

      if (price && price === product.price) {
        return 'Старая цена продукта уже используется';
      }

      if (type && type === product.type) {
        return 'Старый тип продукта уже используется';
      }

      if (unit && unit === product.unit) {
        return 'Старая единица измерения продукта уже используется';
      }
    }
    return;
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
    createProductDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    const validationError = await this.validateProductData({
      productDto: createProductDto,
    });
    if (validationError) {
      return { error: validationError, success: false };
    }

    const product = await this.productModel.create({ ...createProductDto });
    return { success: true, message: `Создан товар ${product.name}`, product };
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    const { product, error } = await this.findOneProduct(id);
    if (!product) return { success: false, error };

    const validationError = await this.validateProductData({
      productDto: updateProductDto,
      updatedIdProduct: +id,
    });

    if (validationError) return { success: false, error: validationError };

    const updatedProduct = await product.update(updateProductDto);
    this.processProductPrice(updatedProduct);

    // Сохраняем обновленный продукт
    await updatedProduct.save();

    return {
      success: true,
      message: `Успешно обнавлен ${updatedProduct.name}`,
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
