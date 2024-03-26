import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';
import { TokenGuard } from 'src/token/token.guard';
import { Product } from './product.model';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(TokenGuard)
  @Get()
  paginateAndFilterOrSort(@Query() query: IProductsQuery) {
    return this.productService.paginateAndFilterOrSortProducts(query);
  }

  @Get('find/:id')
  getOneProduct(@Param('id') id: number) {
    return this.productService.findOneProduct(id);
  }

  @UseGuards(TokenGuard)
  @Post('/add')
  addProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.addProduct(createProductDto);
  }

  @UseGuards(TokenGuard)
  @Post('/fullname')
  async searchProductName(@Body('name') name: string) {
    try {
      const searchProduct = await this.productService.findOneByName(name);
      return searchProduct.name
        ? searchProduct
        : `не найден имя продукта: ${name}`;
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(TokenGuard)
  @Post('/partname')
  async searchPartByNameProducts(
    @Body('partname') partname: string,
  ): Promise<Product[]> {
    return this.productService.findAllPartByNameProducts(partname);
  }
}
