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
import { IProductResponse, IProductsQuery } from './types';
import { CreateProductDto } from './dto/create-product.dto';
import { TokenGuard } from 'src/token/token.guard';
import { Product } from './product.model';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(TokenGuard)
  @Get()
  paginateAndFilterOrSort(@Query() query: IProductsQuery): Promise<{
    count: number;
    rows: Product[];
  }> {
    return this.productService.paginateAndFilterOrSortProducts(query);
  }

  @UseGuards(TokenGuard)
  @Get('find/:id')
  getOneProduct(@Param('id') id: number): Promise<IProductResponse> {
    return this.productService.findOneProduct(id);
  }

  @UseGuards(TokenGuard)
  @Post('add')
  addProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.addProduct(createProductDto);
  }

  @UseGuards(TokenGuard)
  @Post('search-name')
  async searchProductName(
    @Body('name') name: string,
  ): Promise<IProductResponse> {
    return this.productService.findOneByName(name);
  }

  @UseGuards(TokenGuard)
  @Post('search-part-name')
  async searchPartByNameProducts(
    @Body('part_name') part_name: string,
  ): Promise<Product[]> {
    return this.productService.findAllPartByNameProducts(part_name);
  }

  @UseGuards(TokenGuard)
  @Post('search-azenco__code')
  async searchAzencoCodeProduct(
    @Body('azenco__code') azenco__code: string,
  ): Promise<IProductResponse> {
    return this.productService.findProductByAzencoCode(azenco__code);
  }

  @UseGuards(TokenGuard)
  @Post('search-type')
  async searchTypeProduct(@Body('type') type: string) {
    return this.productService.findProductByType(type);
  }

  @UseGuards(TokenGuard)
  @Delete('remove/:id')
  async removeProduct(@Param('id') id: number) {
    return await this.productService.removeProduct(id);
  }

  @UseGuards(TokenGuard)
  @Put('update/:id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateProductDto);
  }
}
