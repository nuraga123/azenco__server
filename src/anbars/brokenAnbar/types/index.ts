import { Op, WhereOptions } from 'sequelize';
import { BrokenAnbar } from '../broken_anbar.model';
import { IErrorMessage } from 'src/errors/types';

export interface IBrokenAnbarResponce extends IErrorMessage {
  brokenAnbar?: BrokenAnbar;
  message?: string;
}

export interface IBrokenAnbarsResponce extends IErrorMessage {
  brokenAnbars?: BrokenAnbar[];
}

export interface ICountAndRowsBrokenAnbarsResponce {
  rows: BrokenAnbar[];
  count: number;
}

export interface IBrokenAnbarsFilter {
  bolt?: string;
  PRR?: string;
  earring?: string;
  price: { [Op.between]: number[] };
}

export interface IBrokenAnbarsQuery {
  limit: string;
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy?: string;
  bolt?: string;
  PRR?: string;
  earring?: string;
}

export type BrokenAnbarWhereOptions = WhereOptions & {
  userId?: number;
  productId?: number;
  quantity?: number;
  toUserId?: number;
  fromUsername?: string;
  toUsername?: string;
};

export interface IBrokenAnbarUsernameItem {
  username: string;
  userId: number;
}

export interface IBrokenAnbarsUsernamesResponse extends IErrorMessage {
  usernames?: IBrokenAnbarUsernameItem[];
}
