export const menu_id: any = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: {
      name: 'cil-settings',
    },
  },
  {
    "name": "Master",
    "url": "/master",
    "iconComponent": {
      "name": "cil-storage"
    },
    'access': 'master'
  },
  {
    name: 'Pesanan',
    iconComponent: {
      name: 'cil-inbox',
    },
    url: '/order/order',
    'access': 'master'
  },
  {
    name: 'Transaksi',
    url: '/transaksi',
    icon: 'fa fa-exchange',
    children: [
      {
        name: 'Pembelian',
        url: '/transaction/pembelian/list-dt',
        iconComponent: {
          name: 'cil-cart',
        },
      },
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
        url: '/transaction/kirim-barang-return-ke-supplier/list-dt',
        iconComponent: {
          name: 'cib-minutemailer',
        },
      },
      {
        name: 'Kirim Barang Retur Ke Site',
        url: '/transaction/kirim-barang-return-ke-site/list-dt',
        iconComponent: {
          name: 'cil-factory',
        },
      },
      {
        name: 'Return Order',
        url: '/transaction/return-order',
        iconComponent: {
          name: 'cil-factory',
        },
      },

      //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 START
      {
        name: 'Terima Barang Retur dari Site',
        url: '/transaction/terima-barang-retur-dari-site/list-dt',
        iconComponent: {
          name: 'cil-factory',
        },
      },
      //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 END
      {
        name: 'Terima Barang Bekas',
        url: '/transaction/penerimaan-barang-bekas/list',
        iconComponent: {
          name: 'cil-trash',
        },
      },
      {
        name: 'Penjualan Barang Bekas',
        url: '/transaction/penjualan-barang-bekas/list',
        iconComponent: {
          name: 'cil-dollar',
        },
      },
      {
        name: 'Pemakaian Barang Sendiri',
        url: '/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri',
        iconComponent: {
          name: 'cil-hand-point-right',
        },
        // children: [
        //   {
        //     name: 'Tambah Data',
        //     url: '/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri',
        //     iconComponent: {
        //       name: 'cil-circle',
        //     },
        //   },
        //   {
        //     name: 'Display Data',
        //     url: '/transaction/transaksi-pemakaian-barang-sendiri/display-data-pemakaian-barang-sendiri',
        //     iconComponent: {
        //       name: 'cil-circle',
        //     },
        //   },
        // ],
      },
      {
        name: 'Pemusnahan Barang',
        url: '/transaction/wastage/list-dt',
        iconComponent: {
          name: 'cil-trash',
        },
      },
      {
        name: 'Produksi',
        url: '/transaction/production/',
        iconComponent: {
          name: 'cil-industry',
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
        name: 'Display SO',
        url: '/stock-opname/setup-so',
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
        name: 'Laporan Hasil SO',
        url: '/stock-opname/laporan-hasil-so',
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
    url: '/end-of-month',
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
    name: 'Query Stock',
    url: '/reports/query-stock',
    iconComponent: {
      name: 'cil-balance-scale',
    },
  },
  {
    name: 'Kirim Terima Data',
    url: '/sync-data/all',
    iconComponent: {
      name: 'cil-swap-vertical',
    },
  },
  {
    name: 'Activity Log Report',
    url: '/reports/activity-log',
    iconComponent: {
      name: 'cil-sync',
    },
  },
];
