import { Op, WhereOptions } from 'sequelize';
import { Barn } from '../barn.model';
import { IErrorMessage } from '../../errors/types/index';

export interface IBarnResponce extends IErrorMessage {
  barn?: Barn;
}

export interface IBarnsResponce extends IErrorMessage {
  barns?: Barn[];
}

export interface ICountAndRowsBarnsResponce extends IErrorMessage {
  rows?: Barn[];
  count?: number;
}

export interface IBarnsFilter {
  bolt?: string;
  PRR?: string;
  earring?: string;
  price: { [Op.between]: number[] };
}

export interface IBarnsQuery {
  limit: string;
  offset: string;
  priceFrom?: string;
  priceTo?: string;
  sortBy?: 'ASC' | 'DESK';
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

export interface IBarnsUsernamesResponse extends IErrorMessage {
  usernames?: IBarnUsernameItem[];
}

export interface IBarnText {
  ID_ERROR: string;
  NOT_BARN: string;
  NOT_ID_BARN: string;
  NOT_BARNS: string;
  NOT_USERNAME_BARNS: string;
  NOT_PRODUCT_ID: string;
}

export interface IUserIdAndProductId {
  userId: number;
  productId: number;
}

export interface IMinusAnbarOrder {
  anbarId: number;
  newStock: number;
  usedStock: number;
  brokenStock: number;
}
