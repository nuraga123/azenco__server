import { Order } from '../order.model';

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

export interface IOrderResponse {
  order?: Order;
  error_message?: string;
  message?: string;
}

export interface IOrdersResponse {
  count?: number;
  rows?: Order[];
  error_message?: string;
  message?: string;
}
