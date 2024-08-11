import { Barn } from 'src/barn/barn.model';
import { Order } from '../order.model';

export interface IOrderErrorMessage {
  error_message?: string;
}

export type StatusOrderType =
  | 'yeni_sifariş'
  | 'anbardar_sifarişi_qəbul_etdi'
  | 'заказ_отменен_складчиком'
  | 'anbardar_tam_sifarişi_müştəriyə_göndərdi'
  | 'anbardar_tam_sifarişi_müştəriyə_göndərməyib'
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

export interface IValidateStocks {
  newStock: number;
  usedStock: number;
  brokenStock: number;
  barn: Barn;
}

export interface IConfirmOrder {
  orderId: number;
  barnUsername: string;
  barnUserId: number;
  barnId: number;
}

export interface ISendOrder extends IConfirmOrder {
  driverName: string;
  carNumber: string;
  userSelectedDate: string;
  newStockSend: number;
  usedStockSend: number;
  brokenStockSend: number;
}
