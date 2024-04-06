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

export interface IError {
  error?: string;
}

export interface IProductResponse extends IError {
  product?: Product;
}

export interface IProductsResponse extends IError {
  products?: Product[];
}

export interface ICountAndRowsProductsResponse extends IError {
  rows?: Product[];
  count: number;
}

export interface IAddAndUpdateProduct extends IProductResponse, IError {
  message?: string;
  success?: boolean;
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
