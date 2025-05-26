export const hakAksesList: any = [
  {
    group: 'Dashboard',
    items: [{ id: 'dashboard', label: 'Dashboard' }],
  },
  {
    group: 'Master',
    items: [{ id: 'master', label: 'Master' }],
  },
  {
    group: 'Pesanan',
    items: [{ id: 'pesanan', label: 'Pesanan' }],
  },
  {
    group: 'Transaksi',
    items: [
      {
        id: 'pembelian',
        label: 'Pembelian',
      },
      {
        id: 'pengiriman',
        label: 'Pengiriman',
        children: [
          { id: 'display_&_tambah', label: 'Display & Tambah' },
          { id: 'proses_do_balik', label: 'Proses Do Balik' },
          { id: 'revisi_do', label: 'Revisi DO' },
          { id: 'packing_list', label: 'Packing List' },
        ],
      },
      {
        id: 'penerimaan_dari_gudang',
        label: 'Penerimaan Dari Gudang',
        children: [
          { id: 'tambah_data', label: 'Tambah Data' },
          { id: 'display_data', label: 'Display Data' },
        ],
      },
      {
        id: 'kirim_barang_retur_ke_supplier',
        label: 'Kirim Barang Retur Ke Supplier',
      },
      {
        id: 'kirim_barang_retur_ke_site',
        label: 'Kirim Barang Retur Ke Site',
      },
      {
        id: 'return_order',
        label: 'Return Order',
      },
      {
        id: 'terima_barang_retur_dari_site',
        label: 'Terima Barang Retur dari Site',
      },
      {
        id: 'terima_barang_bekas',
        label: 'Terima Barang Bekas',
      },
      {
        id: 'penjualan_barang_bekas',
        label: 'Penjualan Barang Bekas',
      },
      {
        id: 'pemakaian_barang_sendiri',
        label: 'Pemakaian Barang Sendiri',
      },
      {
        id: 'pemusnahan_barang',
        label: 'Pemusnahan Barang',
      },
      {
        id: 'produksi',
        label: 'Produksi',
      },
    ],
  },
  {
    group: 'Stock Opname',
    items: [{ id: 'stock_opname', label: 'Setup SO' }],
  },
  {
    group: 'Tutup Bulan',
    items: [{ id: 'tutup_bulan', label: 'Tutup Bulan' }],
  },
  {
    group: 'Planning Order',
    items: [{ id: 'planning_order', label: 'Planning Order' }],
  },
  {
    group: 'Laporan',
    items: [{ id: 'laporan', label: 'Laporan' }],
  },
  {
    group: 'Query Stock',
    items: [{ id: 'query_stock', label: 'Query Stock' }],
  },
  {
    group: 'Kirim Terima Data',
    items: [{ id: 'kirim_terima_data', label: 'Kirim Terima Data' }],
  },
];
