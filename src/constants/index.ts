export const ACTION_ADD = 'ACTION_ADD';
export const ACTION_EDIT = 'ACTION_EDIT';
export const ACTION_VIEW = 'ACTION_VIEW';
export const ACTION_SELECT = 'ACTION_SELECT';
export const ACTION_EDIT_STATUS = 'ACTION_EDIT_STATUS';
export const ACTION_CETAK = 'ACTION_CETAK';

export const LS_INV_SELECTED_RESEP = 'LS_INV_SELECTED_RESEP';
export const LS_INV_SELECTED_PRODUCT = 'LS_INV_SELECTED_PRODUCT';
export const LS_INV_SELECTED_SUPPLIER = 'LS_INV_SELECTED_SUPPLIER';
export const LS_INV_SELECTED_LOCATION = 'LS_INV_SELECTED_LOCATION';
export const LS_INV_SELECTED_AREA = 'LS_INV_SELECTED_AREA';
export const LS_INV_SELECTED_CITY = 'LS_INV_SELECTED_CITY';
export const LS_INV_SELECTED_RSC = 'LS_INV_SELECTED_RSC';
export const LS_INV_SELECTED_REGIONAL = 'LS_INV_SELECTED_REGIONAL';
export const LS_INV_SELECTED_UOM = 'LS_INV_SELECTED_UOM';
export const LS_INV_SELECTED_POSITION = 'LS_INV_SELECTED_POSITION';
export const LS_INV_SELECTED_SET_NUMBER = 'LS_INV_SELECTED_SET_NUMBER';
export const LS_INV_SELECTED_RECEIVING_ORDER =
  'LS_INV_SELECTED_RECEIVING_ORDER';
export const LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER =
  'LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER';
export const LS_INV_SELECTED_USER = 'LS_INV_SELECTED_USER';
export const LS_INV_SELECTED_BRANCH = 'LS_INV_SELECTED_BRANCH';
export const LS_INV_SELECTED_DELIVERY_ORDER = 'LS_INV_SELECTED_DELIVERY_ORDER';
export const LS_INV_DISPLAY_DATA_GUDANG = 'LS_INV_DISPALY_DATA_GUDANG';
export const LS_INV_SELECTED_DETAIL_ADD_DATA_GUDANG =
  'LS_INV_SELECTED_DETAIL_ADD_DATA_GUDANG';
export const LS_INV_SELECTED_SO = 'LS_INV_SELECTED_SO';
export const DEFAULT_DATE_RANGE_DELIVERY_ORDER = 5;
export const BUTTON_CAPTION_VIEW = 'Lihat';
export const BUTTON_CAPTION_EDIT = 'Ubah';
export const BUTTON_CAPTION_SELECT = 'Pilih';

export const SEND_PRINT_STATUS_SUDAH = 'S';
export const SEND_PRINT_STATUS_BELUM = 'B';
export const SEND_STATUS_KIRIM = 'K';
export const SEND_STATUS_TERIMA = 'T';
export const CANCEL_STATUS = '4';
export const OUTLET_BRAND_KFC = 'KFC';

export const DEFAULT_DELAY_TIME = 500;
export const DEFAULT_DATE_RANGE_RECEIVING_ORDER = 7;
export const DEFAULT_DELAY_TABLE = 500;
export const STATUS_SAME_CONVERSION = 'KONVERSI SAMA';

export const PRINT_STATUS = [
  {
    label: 'Belum',
    value: 'B',
  },
  {
    label: 'Sudah',
    value: 'S',
  },
];

export const STATUS_AKTIF = [
  {
    label: 'Aktif',
    value: 'A',
  },
  {
    label: 'Tidak Aktif',
    value: 'T',
  },
];

export const TIPE_PEMBAYARAN = [
  {
    label: 'Cash',
    value: '1',
  },
  {
    label: 'Cek',
    value: '2',
  },
  {
    label: 'Giro',
    value: '3',
  },
  {
    label: 'Transfer',
    value: '4',
  },
  {
    label: 'Others',
    value: '5',
  },
];

export const STATUS_RESULT = [
  {
    label: 'Baru',
    value: 'B',
  },
  {
    label: 'Kirim',
    value: 'K',
  },
  {
    label: 'Terima',
    value: 'T',
  },
  {
    label: 'Baru',
    value: 'N',
  },
  {
    label: 'Kirim',
    value: 'F',
  },
  {
    label: 'On Order',
    value: '0',
  },
  {
    label: 'Baru',
    value: '1',
  },
  {
    label: 'Terima',
    value: '2',
  },
  {
    label: 'Kirim',
    value: '3',
  },
  {
    label: 'Batal',
    value: '4',
  },
  {
    label: 'Manual',
    value: 'M',
  },
  {
    label: 'Online',
    value: 'O',
  },
  {
    label: 'Posted',
    value: 'P',
  },
  {
    label: 'Intransit',
    value: 'I',
  },
  {
    label: 'Received',
    value: 'R',
  },
];

export const STATUS_PESANAN_TERIMA_PESANAN = [
  {
    label: 'BARU',
    value: '1',
  },
  {
    label: 'SISA',
    value: '2',
  },
  {
    label: 'SELESAI',
    value: '3',
  },
  {
    label: 'BATAL',
    value: '4',
  },
];

export const STATUS_PESANAN_TERIMA_PO = [
  {
    label: 'P.O BARU',
    value: '1',
  },
  {
    label: 'SISA PESANAN',
    value: '2',
  },
  {
    label: 'SELESAI',
    value: '3',
  },
  {
    label: 'P.O DIBATALKAN',
    value: '4',
  },
];
