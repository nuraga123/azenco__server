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
  IDeleteProduct,
  IProductResponse,
  IProductsQuery,
  IProductsResponse,
} from './types';
import { TokenGuard } from 'src/token/token.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {
    /**/
  }

  @Post('import')
  importProducts(@Body('products') products: string) {
    return this.productService.importJSON(products);
  }

  /* GET запросы*/

  // Получение списка продуктов с пагинацией, фильтрацией или сортировкой
  //@UseGuards(TokenGuard)
  @Get()
  paginateAndFilterOrSort(
    @Query() query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
    return this.productService.paginateAndFilterOrSortProducts(query);
  }

  @Post('filter')
  postSearchFilter(
    @Body() filter: FilterProductDto,
  ): Promise<ICountAndRowsProductsResponse> {
    return this.productService.searchProducts(filter);
  }

  // Получение информации о продукте по его идентификатору
  @UseGuards(TokenGuard)
  @Get('find/:id')
  getOneProduct(@Param('id') id: number): Promise<IProductResponse> {
    return this.productService.findOneProduct(id);
  }

  /* POST запросы */

  // Добавление нового продукта
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
    @Body() updatedProduct: UpdateProductDto,
  ): Promise<IAddAndUpdateProduct> {
    return this.productService.updateProduct({
      productId: +id,
      updatedProduct,
    });
  }

  /* DELETE запрос */

  // Удаление продукта по его идентификатору
  @UseGuards(TokenGuard)
  @Delete('remove/:id')
  removeProduct(@Param('id') id: number): Promise<IDeleteProduct> {
    return this.productService.removeProduct(id);
  }
}
