import { Barn } from 'src/barn/barn.model';
import { Order } from '../order.model';

export interface IOrderErrorMessage {
  error_message?: string;
}

export type StatusOrderType =
  // новый заказ
  | 'yeni_sifariş'

  // заказ отменен клиентом
  | 'müştəri_sifarişi_ləğv_etdi'

  // складчик принял заказ
  | 'anbardar_sifarişi_qəbul_etdi'

  // заказ отменен складским работником
  | 'sifariş_anbardar_tərəfindən_ləğv_edildi'

  // складской работник полностью отправил заказ клиенту
  | 'anbardar_tam_sifarişi_müştəriyə_göndərdi'

  // складской работник не отправил заказ клиенту
  | 'anbardar_tam_sifarişi_müştəriyə_göndərməyib'

  // заказ успешно доставлен
  | 'sifariş_uğurla_çatdırıldı'

  // заказ доставлен с потерями и повреждениями
  | 'sifariş_itki_və_ziyanla_çatdırıldı'

  // заказ доставлен в неисправном состоянии
  | 'sifariş_yararsız_çatdırıldı'

  // заказ доставлен с потерями
  | 'sifariş_itki_ilə_çatdırıldı'

  // заказ не доставлен
  | 'sifariş_çatdırılmadı';

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

export interface IOrdersResponse extends IOrderResponse {
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

export interface IMyOrders {
  clientId: number;
  clientUserName: string;
}

export interface IOherOrders {
  barnUsername: string;
  barnUserId: number;
}
