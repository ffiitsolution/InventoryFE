export const hakAksesListModule: any = [
  {
    id: 'master',
    group: 'Master',
    items: [
      {
        id: 'setup-no-transaksi',
        label: 'Setup No Transaksi',
        children: [{ id: 'setup-no-transaksi_view', label: 'View' }],
      },
      {
        id: 'master-role',
        label: 'Role Permission',
        children: [
          { id: 'master-role_view', label: 'View' },
          { id: 'master-role_create', label: 'Create' },
          { id: 'master-role_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-user',
        label: 'User',
        children: [
          { id: 'master_master-user_view', label: 'View' },
          { id: 'master_master-user_create', label: 'Create' },
          { id: 'master_master-user_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-branch',
        label: 'Cabang & Dept & Store',
        children: [
          { id: 'master_master-branch_view', label: 'View' },
          { id: 'master_master-branch_create', label: 'Create' },
          { id: 'master_master-branch_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-location',
        label: 'Location',
        children: [
          { id: 'master_master-location_view', label: 'View' },
          { id: 'master_master-location_create', label: 'Create' },
          { id: 'master_master-location_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-supplier',
        label: 'Supplier',
        children: [
          { id: 'master_master-supplier_view', label: 'View' },
          { id: 'master_master-supplier_create', label: 'Create' },
          { id: 'master_master-supplier_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-product',
        label: 'Barang',
        children: [
          { id: 'master_master-product_view', label: 'View' },
          { id: 'master_master-product_create', label: 'Create' },
          { id: 'master_master-product_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-rsc',
        label: 'RSC',
        children: [
          { id: 'master_master-rsc_view', label: 'View' },
          { id: 'master_master-rsc_create', label: 'Create' },
          { id: 'master_master-rsc_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-regional',
        label: 'Regional',
        children: [
          { id: 'master_master-regional_view', label: 'View' },
          { id: 'master_master-regional_create', label: 'Create' },
          { id: 'master_master-regional_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-area',
        label: 'Area',
        children: [
          { id: 'master_master-area_view', label: 'View' },
          { id: 'master_master-area_create', label: 'Create' },
          { id: 'master_master-area_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-uom',
        label: 'Satuan',
        children: [
          { id: 'master_master-uom_view', label: 'View' },
          { id: 'master_master-uom_create', label: 'Create' },
          { id: 'master_master-uom_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-city-area',
        label: 'Kota',
        children: [
          { id: 'master_master-city-area_view', label: 'View' },
          { id: 'master_master-city-area_create', label: 'Create' },
          { id: 'master_master-city-area_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-set-number',
        label: 'Counter',
        children: [
          { id: 'master_master-set-number_view', label: 'View' },
          { id: 'master_master-set-number_create', label: 'Create' },
          { id: 'master_master-set-number_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-position',
        label: 'Jabatan',
        children: [
          { id: 'master_master-position_view', label: 'View' },
          { id: 'master_master-position_create', label: 'Create' },
          { id: 'master_master-position_update', label: 'Update' },
        ],
      },
      {
        id: 'master.master-resep',
        label: 'Resep',
        children: [
          { id: 'master_master-resep_view', label: 'View' },
          { id: 'master_master-resep_create', label: 'Create' },
          { id: 'master_master-resep_update', label: 'Update' },
        ],
      },
    ],
  },
];
