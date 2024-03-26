import { Op } from 'sequelize';
import { Product } from '../product.model';

export interface IProduct {
  id: number;
  azenco__code: string;
  name: string;
  type: string;
  price: number;
  unit: string;
  images: string;
}

export interface AddProductResult {
  success: boolean;
  product?: Product;
  error?: string;
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
