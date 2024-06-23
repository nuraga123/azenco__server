import { Op } from 'sequelize';
import { Product } from '../product.model';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface IError {
  error_message?: string;
}

export interface IProductResponse extends IError {
  product?: Product;
}

export interface IProductsResponse extends IError {
  products?: Product[];
}

export interface ICountAndRowsProductsResponse extends IError {
  rows?: Product[];
  count?: number;
}

export interface IAddAndUpdateProduct extends IProductResponse, IError {
  message?: string;
  success?: boolean;
}

export interface IValidateProduct {
  productDto: CreateProductDto;
}

export interface IUpdateProduct {
  updatedProduct: UpdateProductDto;
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

export interface IDeleteProduct extends IError {
  message?: string;
}

export type IMovementType =
  | 'создан__yaradılmışdır'
  | 'приход__gələn'
  | 'расход__istehlak'
  | 'отправление__gediş'
  | 'возврат__qayıdış'
  | 'списание__silinmə'
  | 'изменение__dəyişikliklər';
