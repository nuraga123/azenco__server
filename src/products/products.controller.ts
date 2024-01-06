import { Body, Controller, Get, Post } from '@nestjs/common';
import { Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  paginateAndFilterOrSort(@Query() query: IProductsQuery) {
    return this.productService.paginateAndFilterOrSortProducts(query);
  }

  @Get('find/:id')
  getOneProduct(@Param('id') id: string) {
    return this.productService.findOneProduct({ where: { id } });
  }

  @Post('/add')
  async addProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productService.addProduct(createProductDto);

      if (product.success) {
        return { success: true, product };
      }

      return { success: false, error: product.error };
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message };
    }
  }
}
