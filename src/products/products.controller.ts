import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';
import { TokenGuard } from 'src/token/token.guard';
import { Product } from './product.model';
import { UpdateProductDto } from './dto/update-product.dto';

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
  getOneProduct(@Param('id') id: number) {
    return this.productService.findOneProduct(id);
  }

  @UseGuards(TokenGuard)
  @Post('add')
  addProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.addProduct(createProductDto);
  }

  @UseGuards(TokenGuard)
  @Post('search-name')
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
  @Post('search-part-name')
  async searchPartByNameProducts(
    @Body('part_name') part_name: string,
  ): Promise<Product[]> {
    return this.productService.findAllPartByNameProducts(part_name);
  }

  @UseGuards(TokenGuard)
  @Delete('remove/:id')
  async removeProduct(@Param('id') id: number) {
    return this.productService.removeProductId(id);
  }

  @UseGuards(TokenGuard)
  @Put('update/:id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<{ success: boolean; product?: Product; error?: string }> {
    return await this.productService.update(id, updateProductDto);
  }
}
