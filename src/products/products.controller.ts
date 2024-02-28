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

  @UseGuards(TokenGuard)
  @Get('find/:id')
  getOneProduct(@Param('id') id: string) {
    return this.productService.findOneProduct({ where: { id } });
  }

  @UseGuards(TokenGuard)
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

  @UseGuards(TokenGuard)
  @Post('/search-name')
  async searchProductName(@Body() { name }: { name: string }) {
    try {
      const currentProduct = await this.productService.findOneByName({
        where: { name },
      });

      console.log(currentProduct);

      if (currentProduct.name === name) {
        return {
          success: true,
          currentProduct,
        };
      } else {
        return {
          success: false,
          message: `${name} нет с таким именем `,
        };
      }
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(TokenGuard)
  @Post('/search-word')
  async searchProductsByNameArr(
    @Body('search_word') search_word: string,
  ): Promise<Product[]> {
    return this.productService.findByNameAll(search_word);
  }
}
