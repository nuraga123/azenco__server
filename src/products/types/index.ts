import { Op } from 'sequelize';

export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  images: string[];
}

export interface IProductsFilter {
  bolt: string | undefined;
  PRR: string | undefined;
  earring: string | undefined;
  price: { [Op.between]: number[] };
}

export interface IProductsQuery {
  limit: string;
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy?: string;
  bolt: string | undefined;
  PRR: string | undefined;
  earring: string | undefined;
}
