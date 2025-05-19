export const menu_id: any = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: {
      name: 'cil-settings',
    },
    access: 'dashboard',
  },
  {
    name: 'Master',
    url: '/master',
    iconComponent: {
      name: 'cil-storage',
    },
    access: 'master',
  },
  {
    name: 'Pesanan',
    iconComponent: {
      name: 'cil-inbox',
    },
    url: '/order/order',
    access: 'pesanan',
  },
  {
    name: 'Transaksi',
    url: '/transaksi',
    icon: 'fa fa-exchange',
    access: 'transaksi',
    children: [
      {
        name: 'Pembelian',
        url: '/transaction/pembelian/list-dt',
        iconComponent: {
          name: 'cil-cart',
        },
        access: 'pembelian',
      },
      {
        name: 'Pengiriman',
        url: '/transaction/delivery-item',
        iconComponent: {
          name: 'cil-truck',
        },
        access: 'pengiriman',
        children: [
          {
            name: 'Display & Tambah',
            url: '/transaction/delivery-item',
            iconComponent: {
              name: 'cil-plus',
            },
            access: 'display_&_tambah',
          },
          {
            name: 'Proses Do Balik',
            url: '/transaction/delivery-item/dobalik',
            iconComponent: {
              name: 'cil-note-add',
            },
            access: 'proses_do_balik',
          },
          {
            name: 'Revisi DO',
            url: '/transaction/delivery-item/revisi-do',
            iconComponent: {
              name: 'cil-sync',
            },
            access: 'revisi_do',
          },
          {
            name: 'Packing List',
            url: '/transaction/delivery-item/packing-list',
            iconComponent: {
              name: 'cil-check',
            },
            access: 'packing_list',
          },
        ],
      },
      {
        name: 'Penerimaan Dari Gudang',
        url: '/transaction/receipt-from-warehouse/penerimaan-dari-gudang',
        iconComponent: {
          name: 'cil-industry',
        },
        access: 'penerimaan_dari_gudang',
        children: [
          {
            name: 'Tambah Data',
            url: '/transaction/receipt-from-warehouse/tambah-data',
            iconComponent: {
              name: 'cil-circle',
            },
            access: 'tambah_data',
          },
          {
            name: 'Display Data',
            url: '/transaction/receipt-from-warehouse/display-data-dari-gudang',
            iconComponent: {
              name: 'cil-circle',
            },
            access: 'display_data',
          },
        ],
      },
      {
        name: 'Kirim Barang Retur Ke Supplier',
        url: '/transaction/retur-ke-supplier/list-barang-retur',
        iconComponent: {
          name: 'cib-minutemailer',
        },
        access: 'kirim_barang_retur_ke_supplier',
      },
      {
        name: 'Kirim Barang Retur Ke Site',
        url: '/transaction/kirim-barang-return-ke-site/list-dt',
        iconComponent: {
          name: 'cil-factory',
        },
        access: 'kirim_barang_retur_ke_site',
      },
      {
        name: 'Return Order',
        url: '/transaction/return-order',
        iconComponent: {
          name: 'cil-factory',
        },
        access: 'return_order',
      },
      {
        name: 'Terima Barang Retur dari Site',
        url: '/transaction/terima-barang-retur-dari-site/list-dt',
        iconComponent: {
          name: 'cil-factory',
        },
        access: 'terima_barang_retur_dari_site',
      },
      {
        name: 'Terima Barang Bekas',
        url: '/transaction/penerimaan-barang-bekas/list',
        iconComponent: {
          name: 'cil-trash',
        },
        access: 'terima_barang_bekas',
      },
      {
        name: 'Penjualan Barang Bekas',
        url: '/transaction/penjualan-barang-bekas/list',
        iconComponent: {
          name: 'cil-dollar',
        },
        access: 'penjualan_barang_bekas',
      },
      {
        name: 'Pemakaian Barang Sendiri',
        url: '/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri',
        iconComponent: {
          name: 'cil-hand-point-right',
        },
        access: 'pemakaian_barang_sendiri',
      },
      {
        name: 'Pemusnahan Barang',
        url: '/transaction/wastage/list-dt',
        iconComponent: {
          name: 'cil-trash',
        },
        access: 'pemusnahan_barang',
      },
      {
        name: 'Produksi',
        url: '/transaction/production/list-dt',
        iconComponent: {
          name: 'cil-industry',
        },
        access: 'produksi',
      },
    ],
  },
  {
    name: 'Stock Opname',
    iconComponent: {
      name: 'cil-book',
    },
    access: 'stock_opname',
    children: [
      {
        name: 'Setup SO',
        url: '/stock-opname/setup-so',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'setup_so',
      },
      {
        name: 'Cetak Form SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'cetak_form_so',
      },
      {
        name: 'Entry Stock Opname',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'entry_stock_opname',
      },
      {
        name: 'Laporan Selisih SO (Sementara)',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'laporan_selisih_so_(sementara)',
      },
      {
        name: 'Proses Posting SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'proses_posting_so',
      },
      {
        name: 'Laporan Hasil SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'laporan_hasil_so',
      },
      {
        name: 'Display Selisih SO',
        url: '/dashboard',
        iconComponent: {
          name: 'cil-circle',
        },
        access: 'display_selisih_so',
      },
    ],
  },
  {
    name: 'Tutup Bulan',
    url: '/end-of-month',
    iconComponent: {
      name: 'cil-calendar-check',
    },
    access: 'tutup_bulan',
  },
  {
    name: 'Planning Order',
    url: '/planning-order',
    iconComponent: {
      name: 'cil-av-timer',
    },
    access: 'planning_order',
  },
  {
    name: 'Laporan',
    url: '/reports/all',
    iconComponent: {
      name: 'cib-adobe-acrobat-reader',
    },
    access: 'laporan',
  },
  {
    name: 'Query Stock',
    url: '/reports/query-stock',
    iconComponent: {
      name: 'cil-balance-scale',
    },
    access: 'query_stock',
  },
  {
    name: 'Kirim Terima Data',
    url: '/sync-data/all',
    iconComponent: {
      name: 'cil-swap-vertical',
    },
    access: 'kirim_terima_data',
  },
];
