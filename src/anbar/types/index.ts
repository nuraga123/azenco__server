import { Op, WhereOptions } from 'sequelize';

export interface IAnbar {
  productId: number;
  userId: number;
  username: string;
  stock: number;
  total_price: number;
  ordered: boolean;
}

export interface IAnbars {
  rows: IAnbar[];
  count: number;
}

export interface ITransferAnbar extends IAnbars {
  productId: number;
  name: string;
  price: number;
  stock: number;
  total_price: number;
  username: string;
  ordered: boolean;
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

export interface ITransferStokAnbar {
  fromAnbar: ITransferAnbar;
  toAnbar: ITransferAnbar;
  message: string;
}

export interface IAnbarsUsername {
  username: string;
  userId: number;
}

export interface IAnbarsUsernameResponse {
  usernamesArray: IAnbarsUsername[];
  errorMessage?: string;
}
