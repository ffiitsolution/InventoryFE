export const menu_id: any = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: {
      name: 'cil-settings',
    },
  },
  {
    name: 'Masters',
    iconComponent: {
      name: 'cil-storage',
    },
    children: [
      {
        name: 'User',
        url: '/master/master-user',
        iconComponent: {
          name: 'cil-user',
        },
      },
      {
        name: 'Cabang & Dept.',
        url: '/master/master-branch',
        iconComponent: {
          name: 'cil-house',
        },
      },
      {
        name: 'Location',
        url: '/master/master-location',
        iconComponent: {
          name: 'cil-location-pin',
        },
      },
      {
        name: 'Supplier',
        url: '/master/master-supplier',
        iconComponent: {
          name: 'cib-codesandbox',
        },
      },
      {
        name: 'Barang',
        url: '/master/master-product',
        iconComponent: {
          name: 'cil-fastfood',
        },
      },
      {
        name: 'RSC',
        url: '/master/master-rsc',
        iconComponent: {
          name: 'cil-contact',
        },
      },
      {
        name: 'Regional',
        url: '/master/master-regional',
        iconComponent: {
          name: 'cil-map',
        },
      },
      {
        name: 'Area',
        url: '/master/master-area',
        iconComponent: {
          name: 'cil-location-pin',
        },
      },
      {
        name: 'Satuan',
        url: '/master/master-uom',
        iconComponent: {
          name: 'cib-dropbox',
        },
      },
      {
        name: 'Wilayah Kota',
        url: '/master/master-city-area',
        iconComponent: {
          name: 'cil-globe-alt',
        },
      },
      {
        name: 'Loket',
        url: '/master/master-set-number',
        iconComponent: {
          name: 'cil-window',
        },
      },
    ],
  },
  {
    name: 'Pesanan',
    iconComponent: {
      name: 'cil-inbox',
    },
    children: [
      {
        name: 'Terima Pesanan',
        url: '/order/receiving-order',
        iconComponent: {
          name: 'cil-envelope-open',
        },
      },
      {
        name: 'Kirim Pesanan Ke Supplier',
        url: '/order/send-order-to-supplier-via-rsc',
        iconComponent: {
          name: 'cil-envelope-closed',
        },
      },
      {
        name: 'Kirim Pesanan Ke Gudang',
        url: '/order/send-order-to-warehouse',
        iconComponent: {
          name: 'cil-envelope-closed',
        },
      },
    ],
  },
  {
    name: 'Transaksi',
    url: '/transaksi',
    icon: 'fa fa-exchange',
    children: [
      {
        name: 'Pengiriman',
        url: '/transaction/delivery-item',
        iconComponent: {
          name: 'cil-truck',
        },
        children: [
          {
            name: 'Display & Tambah',
            url: '/transaction/delivery-item',
            iconComponent: {
              name: 'cil-plus',
            },
          },
          {
            name: 'Proses Do Balik',
            url: '/transaction/delivery-item/dobalik',
            iconComponent: {
              name: 'cil-note-add',
            },
          },
          {
            name: 'Revisi DO',
            url: '/transaction/delivery-item/revisi-do',
            iconComponent: {
              name: 'cil-sync',
            },
          },
          {
            name: 'Packing List',
            url: '/transaction/delivery-item/packing-list',
            iconComponent: {
              name: 'cil-check',
            },
          },
        ],
      },
      {
        name: 'Penerimaan Dari Gudang',
        url: '/transaction/receipt-from-warehouse/penerimaan-dari-gudang',
        iconComponent: {
          name: 'cil-industry',
        },
        children: [
          {
            name: 'Tambah Data',
            url: '/transaction/receipt-from-warehouse/tambah-data',
            iconComponent: {
              name: 'cil-circle',
            },
          },
          {
            name: 'Display Data',
            url: '/transaction/receipt-from-warehouse/display-data-dari-gudang',
            iconComponent: {
              name: 'cil-circle',
            },
          },
        ],
      },
      {
        name: 'Kirim Barang Retur Ke Supplier',
        url: '/transaction/Kirim-Barang-Retur-Ke-Supplier',
        iconComponent: {
          name: 'cib-minutemailer',
        },
        children: [
          {
            name: 'Tambah Data',
            url: '/transaction/Kirim-Barang-Retur-Ke-Supplier/tambah-data-pengembalian-barang-ke-supplier',
            iconComponent: {
              name: 'cil-circle',
            },
          },
          {
            name: 'Display Data',
            url: '/transaction/Kirim-Barang-Retur-Ke-Supplier/display-data-pengembalian-barang-ke-supplier',
            iconComponent: {
              name: 'cil-circle',
            },
          },
        ],
      },
      {
        name: 'Kirim Barang Retur Ke Site',
        url: '/transaction/Kirim-Barang-Retur-Ke-Site',
        iconComponent: {
          name: 'cil-factory',
        },
        children: [
          {
            name: 'Tambah Data',
            url: '/transaction/Kirim-Barang-Retur-Ke-Site/tambah-data-pengembalian-barang-ke-site',
            iconComponent: {
              name: 'cil-circle',
            },
          },
          {
            name: 'Display Data',
            url: '/transaction/Kirim-Barang-Retur-Ke-Site/display-data-pengembalian-barang-ke-site',
            iconComponent: {
              name: 'cil-circle',
            },
          },
        ],
      },
      {
        name: 'Pemakaian Barang Sendiri',
        url: '/transaction/transaksi-pemakaian-barang-sendiri',
        iconComponent: {
          name: 'cil-hand-point-right',
        },
        children: [
          {
            name: 'Tambah Data',
            url: '/transaction/pemakaian-barang-sendiri/tambah-data-pemakaian-barang-sendiri',
            iconComponent: {
              name: 'cil-circle',
            },
          },
          {
            name: 'Display Data',
            url: '/transaction/transaksi-pemakaian-barang-sendiri/display-data-pemakaian-barang-sendiri',
            iconComponent: {
              name: 'cil-circle',
            },
          },
        ],
      },
      {
        name: 'Pemusnahan Barang',
        url: '/transaction/wastage/list-dt',
        iconComponent: {
          name: 'cil-trash',
        },
      },
    ],
  },
  {
    name: 'Stock Opname',
    iconComponent: {
      name: 'cil-book',
    },
    children: [
      {
        name: 'Setup SO',
        url: '/stock-opname/setup-so',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Cetak Form SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Entry Stock Opname',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Laporan Selisih SO (Sementara)',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Proses Posting SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Laporan Hasil SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
      {
        name: 'Display Selisih SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
      },
    ],
  },
  {
    name: 'Tutup Bulan',
    url: '/end-of-day',
    iconComponent: {
      name: 'cil-calendar-check',
    },
  },
  {
    name: 'Planning Order',
    url: '/planning-order',
    iconComponent: {
      name: 'cil-av-timer',
    },
  },
  {
    name: 'Laporan',
    url: '/reports/all',
    iconComponent: {
      name: 'cib-adobe-acrobat-reader',
    },
  },
  {
    name: 'Kirim Terima Data',
    url: '/sync-data',
    iconComponent: {
      name: 'cil-swap-vertical',
    },
  },
];
