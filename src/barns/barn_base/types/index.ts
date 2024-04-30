import { Op, WhereOptions } from 'sequelize';
import { Barn } from '../barn_base.model';
export interface IBarnErrorMessage {
  error_message?: string;
}

export interface IBarnResponce extends IBarnErrorMessage {
  anbar?: Barn;
  message?: string;
}

export interface IBarnsResponce extends IBarnErrorMessage {
  anbars?: Barn[];
}

export interface ICountAndRowsAnbarsResponce {
  rows: Barn[];
  count: number;
}

export interface IBarnsFilter {
  bolt?: string;
  PRR?: string;
  earring?: string;
  price: { [Op.between]: number[] };
}

export interface IAnbarsQuery {
  limit: string;
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy?: string;
  bolt?: string;
  PRR?: string;
  earring?: string;
}

export type BarnWhereOptions = WhereOptions & {
  userId?: number;
  productId?: number;
  quantity?: number;
  toUserId?: number;
  fromUsername?: string;
  toUsername?: string;
};

export interface IBarnUsernameItem {
  username: string;
  userId: number;
}

export interface IBarnsUsernamesResponse extends IBarnErrorMessage {
  usernames?: IBarnUsernameItem[];
}

export interface IStock {
  specificStock: number;
  previousStock: number;
  lostStock: number;
}
