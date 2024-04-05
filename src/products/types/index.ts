import { Op } from 'sequelize';
import { Product } from '../product.model';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface IProduct {
  id: number;
  azenco__code: string;
  name: string;
  type: string;
  price: number;
  unit: string;
  images: string;
}

export interface IProductResponse {
  product?: Product;
  error?: string;
}

export interface IProductsResponse {
  products?: Product[];
  error?: string;
}

export interface ICountAndRowsProductsResponse {
  rows?: Product[];
  count: number;
}

export interface IAddAndUpdateProduct extends IProductResponse {
  message?: string;
  success: boolean;
}

export interface IValidateCreateProduct {
  productDto: CreateProductDto;
}

export interface IValidateUpdateProduct {
  productDto: UpdateProductDto;
  productId?: number;
}

export interface IProductsFilter {
  bolt?: string;
  PRR?: string;
  earring?: string;
  price: { [Op.between]: number[] };
}

export interface IProductsQuery {
  limit: string;
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy?: string;
  bolt?: string;
  PRR?: string;
  earring?: string;
}
