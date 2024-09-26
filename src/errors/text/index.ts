import { IErrorText } from '../types';

export const errorText: IErrorText = {
  ID_ERROR: 'ID 0-dan az və ya ona bərabərdir !',
  NOT_DRIVER_NAME: 'Sürücünün adı qeyd olunmayıb !',
  NOT_CAR_NUMBER: 'Maşının nömrəsi qeyd edilməyib !',
  NOT_BARN: 'Anbar yoxdur !',
  NOT_BARN_USER: 'Anbardar yoxdur !',
  NOT_BARNS: 'Anbarlar yoxdur !',
  NOT_ID_BARN: 'Anbar tapılmadı !',
  NOT_USERNAME: 'Anbardar adı yoxdur !',
  NOT_USERNAME_BARNS: 'Anbardar adları tapılmadı !',
  NOT_PRODUCT_ID_AND_USER_ID: 'Istifadəçi ID və ya məhsul ID yoxdur !',
  NOT_INPUT_DATA: 'Funksiya üçün Giriş Məlumatı yoxdur !',
  NOT_ORDER_BARNUSER: 'Sifarişdə göstərilən Anbardar deyilsiniz !',
  NOT_REQUIRED_USER_ACTION:
    'Əməliyyat üçün tələb olunan istifadəçi deyilsiniz !',
  WRONG_DATA: 'Yanlış məlumat !',
  STOCKS_ERROR: 'Miqdar 0-dan az və ya rəqəm deyil!',
  STOCKS_EXCEED_ERROR: 'Anbarda olduğundan çox götürdünüz !',
  // status
  STATUS_NEW: 'Yeni sifariş olmalıdır !',
  STATUS_CONFIRMED: `Artıq təsdiqlənib !`,
  STATUS_SEND: 'Anbardar tərəfindən təsdiq edilməlidir sifariş !',

  STATUS_CANCELED:
    'Statusu yeni və ya Anbardar tərəfindən ləğv edildikdə silinə bilər !',
  STATUS_DELETE: 'Statusu sifarişi ləğv_etdi olmalıdır',
  // orderType
  NOT_ORDER: 'Sifariş tapılmadı!',
};
