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
  sortBy: 'asc' | 'desc';
  type: 'name' | 'code';
  searchValue: string;
  priceFrom?: string;
  priceTo?: string;
  price?: string;
}

export interface IProductsQuery {
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy: string;
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
