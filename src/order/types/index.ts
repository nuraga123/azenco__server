export interface IOrder {
  anbarId: number;
  orderedBy: string;
  orderedFrom: string;
  stock: number;
}

export interface IStatusOrder {
  status:
    | 'created'
    | 'sent_to_customer'
    | 'cancelled_by_customer'
    | 'cancelled_by_anbar';
}
