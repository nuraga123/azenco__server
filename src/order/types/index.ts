import { Order } from '../order.model';

export interface IOrderErrorMessage {
  error_message?: string;
}

export type StatusOrderType =
  | 'новый_заказ_клиента'
  | 'заказ_принял_складчик'
  | 'заказ_отменен_складчиком'
  | 'заказ_отправлен_клиенту'
  | 'заказ_успешно_доставлен'
  | 'заказ_доставлен с потерей и повреждениями'
  | 'заказ_доставлен с повреждениями'
  | 'заказ_доставлен с потерей'
  | 'заказ_недоставлен';

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
