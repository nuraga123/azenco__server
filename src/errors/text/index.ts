interface IErrorText {
  NOT_USERNAME: string;
  ID_ERROR: string;
  NOT_BARN: string;
  NOT_ID_BARN: string;
  NOT_BARNS: string;
  NOT_USERNAME_BARNS: string;
  NOT_PRODUCT_ID_AND_USER_ID: string;
  WRONG_DATA: string;
  NOT_INPUT_DATA: string;
  STOCKS_ERROR: string;
  STOCKS_EXCEED_ERROR: string;
  NOT_DRIVER_NAME: string;
  NOT_CAR_NUMBER: string;
}

export const errorText: IErrorText = {
  ID_ERROR: 'ID 0-dan az və ya ona bərabərdir !',
  NOT_DRIVER_NAME: 'Sürücünün adı qeyd olunmayıb !',
  NOT_CAR_NUMBER: 'Maşının nömrəsi qeyd edilməyib !',
  NOT_BARN: 'Anbar yoxdur !',
  NOT_BARNS: 'Anbarlar yoxdur !',
  NOT_ID_BARN: 'Anbar tapılmadı !',
  NOT_USERNAME: 'Anbardar adı yoxdur !',
  NOT_USERNAME_BARNS: 'Anbardar adları tapılmadı !',
  NOT_PRODUCT_ID_AND_USER_ID: 'Istifadəçi ID və ya məhsul ID yoxdur !',
  WRONG_DATA: 'Yanlış məlumat !',
  NOT_INPUT_DATA: 'Funksiya üçün Giriş Məlumatı yoxdur !',
  STOCKS_ERROR: 'Miqdar 0-dan az və ya rəqəm deyil!',
  STOCKS_EXCEED_ERROR: 'Anbarda olduğundan çox götürdünüz !',
};
