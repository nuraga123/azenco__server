import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';

import {
  IAddAndUpdateProduct,
  ICountAndRowsProductsResponse,
  IError,
  IProductResponse,
  IProductsQuery,
  IProductsResponse,
} from './types';
import { TokenGuard } from 'src/token/token.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {
    /**/
  }

  /* GET запросы*/

  // Получение списка продуктов с пагинацией, фильтрацией или сортировкой
  @UseGuards(TokenGuard)
  @Get()
  paginateAndFilterOrSort(
    @Query() query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
    return this.productService.paginateAndFilterOrSortProducts(query);
  }

  // Получение информации о продукте по его идентификатору
  @UseGuards(TokenGuard)
  @Get('find/:id')
  getOneProduct(@Param('id') id: number): Promise<IProductResponse> {
    return this.productService.findOneProduct(id);
  }

  /* POST запросы */

  // Добавление нового продукта
  @UseGuards(TokenGuard)
  @Post('add')
  addProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    return this.productService.addProduct(createProductDto);
  }

  // Поиск продукта по его имени
  @UseGuards(TokenGuard)
  @Post('search-name')
  searchOneProductName(@Body('name') name: string): Promise<IProductResponse> {
    return this.productService.findByNameProduct(name);
  }

  // Поиск продуктов по части имени
  @UseGuards(TokenGuard)
  @Post('search-part-name')
  searchPartByNameProducts(
    @Body('part_name') part_name: string,
  ): Promise<IProductsResponse> {
    return this.productService.findAllPartByNameProducts(part_name);
  }

  // Поиск продукта по его коду Azenco
  @UseGuards(TokenGuard)
  @Post('search-azenco-code')
  searchAzencoCodeProduct(
    @Body('azencoCode') azencoCode: string,
  ): Promise<IProductResponse> {
    return this.productService.findByAzencoCodeProduct(azencoCode);
  }

  // Поиск продуктов по их типу
  @UseGuards(TokenGuard)
  @Post('search-type')
  async searchTypeProduct(
    @Body('type') type: string,
  ): Promise<IProductsResponse> {
    return this.productService.findByTypeProducts(type);
  }

  /* PUT запрос */

  // Обновление информации о продукте
  @UseGuards(TokenGuard)
  @Put('update/:id')
  updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  /* DELETE запрос */

  // Удаление продукта по его идентификатору
  @UseGuards(TokenGuard)
  @Delete('remove/:id')
  removeProduct(@Param('id') id: number): Promise<string | IError> {
    return this.productService.removeProduct(id);
  }
}
