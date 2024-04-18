import { Op, WhereOptions } from 'sequelize';
import { Anbar } from '../../newAnbar/anbar.model';

export interface IAnbarErrorMessage {
  error_message?: string;
}

export interface IAnbarResponce extends IAnbarErrorMessage {
  anbar?: Anbar;
  message?: string;
}

export interface IAnbarsResponce extends IAnbarErrorMessage {
  anbars?: Anbar[];
}

export interface ICountAndRowsAnbarsResponce {
  rows: Anbar[];
  count: number;
}

export interface IAnbarsFilter {
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

export type AnbarWhereOptions = WhereOptions & {
  userId?: number;
  productId?: number;
  quantity?: number;
  toUserId?: number;
  fromUsername?: string;
  toUsername?: string;
};

export interface IAnbarUsernameItem {
  username: string;
  userId: number;
}

export interface IAnbarsUsernamesResponse extends IAnbarErrorMessage {
  usernames?: IAnbarUsernameItem[];
}
