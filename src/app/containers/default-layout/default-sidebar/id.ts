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
        name: 'Counter',
        url: '/master/master-set-number',
        iconComponent: {
          name: 'cil-window',
        },
      },
      {
        name: 'Jabatan',
        url: '/master/master-position',
        iconComponent: {
          name: 'cil-contact',
        },
      },
      {
        name: 'Resep',
        url: '/master/master-resep',
        iconComponent: {
          name: 'cil-dinner',
        },
      },
    ],
  },
  {
    name: 'Pesanan',
    iconComponent: {
      name: 'cil-inbox',
    },
    url: '/order/order',
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
        url: '/transaction/retur-ke-supplier/list-barang-retur',
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
        url: '/transaction/production/list-dt',
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
    name: 'Kirim Terima Data',
    url: '/sync-data/all',
    iconComponent: {
      name: 'cil-swap-vertical',
    },
  },
];
