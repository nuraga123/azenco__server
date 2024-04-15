import { Order } from '../order.model';

export interface IOrderErrorMessage {
  error_message?: string;
}

export type StatusOrderType =
  | 'new'
  | 'sent_to_customer'
  | 'cancelled_by_customer'
  | 'cancelled_by_anbar'
  | 'received_by_customer'
  | 'refunded';

export interface IOrderQuery {
  limit?: string;
  offset?: string;
}

export interface IOrderResponse extends IOrderErrorMessage {
  order?: Order;
  message?: string;
}

export interface ICountAndRowsOrdersResponse extends IOrderErrorMessage {
  count?: number;
  rows?: Order[];
  message?: string;
}

export interface IOrdersResponse extends IOrderErrorMessage {
  orders?: Order[];
}
