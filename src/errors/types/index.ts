export interface IErrorText {
  ID_ERROR: string;
  NOT_USERNAME: string;
  NOT_BARN: string;
  NOT_ID_BARN: string;
  NOT_BARNS: string;
  NOT_BARN_USER: string;
  NOT_USERNAME_BARNS: string;
  NOT_PRODUCT_ID_AND_USER_ID: string;
  NOT_INPUT_DATA: string;
  NOT_ORDER_BARNUSER: string;
  NOT_DRIVER_NAME: string;
  NOT_CAR_NUMBER: string;
  NOT_REQUIRED_USER_ACTION: string;
  STOCKS_ERROR: string;
  STOCKS_EXCEED_ERROR: string;

  // статус
  STATUS_NEW: string;
  STATUS_CONFIRMED: string;
  STATUS_SEND: string;
  STATUS_CANCELED: string;
  STATUS_DELETE: string;
  WRONG_DATA: string;
  NOT_ORDER: string;
}

export interface IErrorMessage {
  error_message?: string;
  message?: string;
}
