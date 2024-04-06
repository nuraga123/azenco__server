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
  ICountAndRowsProductsResponse,
  IProductResponse,
  IProductsQuery,
  IProductsResponse,
} from './types';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TokenGuard } from 'src/token/token.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @UseGuards(TokenGuard)
  @Get()
  paginateAndFilterOrSort(
    @Query() query: IProductsQuery,
  ): Promise<ICountAndRowsProductsResponse> {
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
  async searchOneProductName(
    @Body('name') name: string,
  ): Promise<IProductResponse> {
    return await this.productService.findByNameProduct(name);
  }

  @UseGuards(TokenGuard)
  @Post('search-part-name')
  async searchPartByNameProducts(
    @Body('part_name') part_name: string,
  ): Promise<IProductsResponse> {
    return this.productService.findAllPartByNameProducts(part_name);
  }

  @UseGuards(TokenGuard)
  @Post('search-azenco-code')
  async searchAzencoCodeProduct(
    @Body('azencoCode') azencoCode: string,
  ): Promise<IProductResponse> {
    return this.productService.findByAzencoCodeProduct(azencoCode);
  }

  @UseGuards(TokenGuard)
  @Post('search-type')
  async searchTypeProduct(@Body('type') type: string) {
    return this.productService.findByTypeProducts(type);
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
