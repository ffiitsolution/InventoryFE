export interface Report {
  name: string;
  path: string;
}

export interface Reports {
  [key: string]: {
    [key: number]: Report;
  };
}

export const reports: Reports = {
  master: {
    1: {
      name: 'Master Cabang',
      path: '/reports/master',
    },
    2: {
      name: 'Master Department',
      path: '/reports/master',
    },
    3: {
      name: 'Master Gudang',
      path: '/reports/master',
    },
    4: {
      name: 'Master Supplier',
      path: '/reports/master',
    },
    5: {
      name: 'Master Barang',
      path: '/reports/master',
    },
    6: {
      name: 'Master Barang Bekas',
      path: '/reports/master',
    },
    7: {
      name: 'Master Barang Produksi',
      path: '/reports/master',
    },
    8: {
      name: 'Master RSC',
      path: '/reports/master',
    },
    9: {
      name: 'Master Regional',
      path: '/reports/master',
    },
    10: {
      name: 'Master Area',
      path: '/reports/master',
    },
    11: {
      name: 'Master Satuan Barang',
      path: '/reports/master',
    },
    12: {
      name: 'Master Wilayah/Kota',
      path: '/reports/master',
    },
  },
  pesanan: {
    1: {
      name: 'Pesanan Ke Supplier',
      path: '/reports/order',
    },
    2: {
      name: 'Pesanan Ke Gudang',
      path: '/reports/order',
    },
    3: {
      name: 'Terima Pesanan Cabang',
      path: '/reports/order',
    },
    4: {
      name: 'Tanggal Pesan vs Tanggal Kirim',
      path: '/reports/order',
    },
    5: {
      name: 'Estimasi Pengiriman Barang',
      path: '/reports/order',
    },
  },
  transaksi: {
    1: {
      name: 'Pembelian',
      path: '/reports/transaction',
    },
    2: {
      name: 'Penerimaan',
      path: '/reports/transaction',
    },
    3: {
      name: 'Transaksi Pengiriman',
      path: '/reports/transaction',
    },
    4: {
      name: 'Barang Rusak/Pemusnahan',
      path: '/reports/transaction',
    },
    5: {
      name: 'Penyesuaian Stock',
      path: '/reports/transaction',
    },
    6: {
      name: 'Kirim Retur Ke Supplier',
      path: '/reports/transaction',
    },
    7: {
      name: 'Kirim Retur Ke Site',
      path: '/reports/transaction',
    },
    8: {
      name: 'Terima Retur Dari Site',
      path: '/reports/transaction',
    },
    9: {
      name: 'Penerimaan Barang Bekas',
      path: '/reports/transaction',
    },
    10: {
      name: 'Penjualan Barang Bekas',
      path: '/reports/transaction',
    },
    11: {
      name: 'Pemakaian Barang Sendiri',
      path: '/reports/transaction',
    },
    12: {
      name: 'Produksi',
      path: '/reports/transaction',
    },
  },
  stock: {
    1: {
      name: 'Stock Barang',
      path: '/reports/stock',
    },
    2: {
      name: 'Stock Card',
      path: '/reports/stock',
    },
    3: {
      name: 'Stock Barang By Expired',
      path: '/reports/stock',
    },
    4: {
      name: 'Transaksi Detail Barang Expired',
      path: '/reports/stock',
    },
    5: {
      name: 'Stock Yang Mendekati Tgl Expired',
      path: '/reports/stock',
    },
    6: {
      name: 'Stock Barang Dibawah Minimum',
      path: '/reports/stock',
    },
    7: {
      name: 'Stock Barang Diatas Maximum',
      path: '/reports/stock',
    },
    8: {
      name: 'Stock JATIM-INDOTIM',
      path: '/reports/stock',
    },
    9: {
      name: 'Inventory Movement',
      path: '/reports/stock',
    },
  },
  analysis: {
    1: {
      name: 'Pembelian By Supplier',
      path: '/reports/analysis',
    },
    2: {
      name: 'Penerimaan By Pengirim',
      path: '/reports/analysis',
    },
    3: {
      name: 'Pengirim By Tujuan',
      path: '/reports/analysis',
    },
    4: {
      name: 'Persiapan Pengiriman Barang',
      path: '/reports/analysis',
    },
    5: {
      name: 'DO Yang Belum Balik',
      path: '/reports/analysis',
    },
    6: {
      name: 'Rekap Transaksi 3 Periode (By Type)',
      path: '/reports/analysis',
    },
    7: {
      name: 'DO - REVISI',
      path: '/reports/analysis',
    },
    8: {
      name: 'Jumlah Transaksi',
      path: '/reports/analysis',
    },
    9: {
      name: 'Mutasi Stock Harian',
      path: '/reports/analysis',
    },
  },
};
