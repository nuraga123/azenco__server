import { Op, WhereOptions } from 'sequelize';

export interface IAnbars {
  id: number;
  productId: number;
  name: string;
  type: string;
  price: number;
  stock: number;
  total_price: number;
  username: string;
  unit: string;
  azenco__code: string;
  images: string;
  ordered: boolean;
  pendingConfirmation: boolean;
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
  usernameArray: IAnbarsUsername[];
  errorMessage?: string;
}
