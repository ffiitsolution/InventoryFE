import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';
import { AddDataDetailDeliveryComponent } from './add-data-detail/add-data-detail.component';
import { PageAwalDoBalikComponent } from './revisi-do/page-awal-do/page-awal-do.component';
import { DobalikComponent } from './dobalik/dobalik.component';
import { DetailReportDoBalikComponent } from './detail-report-do-balik/detail-report-do-balik.component';
import { PackagingListComponent } from './packing-list/packing-list.component';
import { AddDataGudangComponent } from './add-data-gudang/add-data-gudang.component';
import { EntryPackingListComponent } from './packing-list/entry-packing-list/entry-packing-list.component';
import { RevisiDoComponent } from './revisi-do/revisi-do.component';
import { RevisiDoEditComponent } from './revisi-do/revisi-do-edit/revisi-do-edit.component';
import { WastageListComponent } from './pemusnahan-wastage/dt-list/wastage-list.component';
import { AddWastageComponent } from './pemusnahan-wastage/add-data/add-data.component';
import { AddDataDetailWastageComponent } from './pemusnahan-wastage/add-data-detail/add-data-detail.component';
import { DetailWastageComponent } from './pemusnahan-wastage/detail/detail.component';
import { AddDataDetailGudangComponent } from './add-data-gudang/detail-add-data-gudang/detail-add-data-gudang.component';
import { DisplayDataGudangComponent } from './add-data-gudang/display-data-dari-gudang/display-data-dari-gudang.component';
import { DetailPenerimaanGudangComponent } from './add-data-gudang/detail-penerimaan-gudang/detail-penerimaan-gudang.component';
import { PembelianListComponent } from './pembelian/dt/pembelian-list.component';
import { AddPembelianComponent } from './pembelian/add-data/add-data.component';
import { ListBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri.component';
import { AddDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/tambah-data-pemakaian-barang-sendiri/add-data-pemakaian-barang-sendiri.component';
import { DisplayDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/display-data-pemakaian-barang-sendiri/display-data-pemakaian-barang-sendiri-detail.component';
import { DetailBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/detail-pemakaian-barang/detail-barang-untuk-pemakaian-sendiri.component';
import { AddDataDetailBarangComponent } from './barang-untuk-pemakaian-sendiri/add-data-detail/add-data-detail-barang.component';
import { ListBarangReturComponent } from './retur-barang-to-supllier/list-barang-retur/list-barang.component';
import { AddDataBarangReturComponent } from './retur-barang-to-supllier/tambah-data-barang-retur/add-data-retur.component';
import { DisplayDataBarangReturComponent } from './retur-barang-to-supllier/display-data-barang-retur/display-data.component';
import { DetailBarangReturComponent } from './retur-barang-to-supllier/detail-pemakaian-barang/detail-barang.component';
import { AddDataDetailBarangReturComponent } from './retur-barang-to-supllier/add-data-detail-barang-retur/add-detail.component';
import { DetailPembelianComponent } from './pembelian/detail/detail.component';
import { ProductionListComponent } from './production/dt-list/production-list.component';
import { AddProductionComponent } from './production/add-data/add-data.component';
import { AddDataDetailProductionComponent } from './production/add-data-detail/add-data-detail.component';
import { DetailProductionComponent } from './production/detail/detail.component';
import { KirimBarangReturnKeSiteListComponent } from './kirim-barang-return-ke-site/dt-list/kirim-barang-return-ke-site-list.component';
import { AddKirimBarangReturnKeSiteComponent } from './kirim-barang-return-ke-site/add-data/add-data.component';
import { AddDataDetailKirimBarangReturnKeSiteComponent } from './kirim-barang-return-ke-site/add-data-detail/add-data-detail.component';
import { DetailKirimBarangReturnKeSiteComponent } from './kirim-barang-return-ke-site/detail/detail.component';
import { KirimBarangReturnKeSupplierListComponent } from './kirim-barang-return-ke-supplier/dt-list/kirim-barang-return-ke-supplier-list.component';
import { AddKirimBarangReturnKeSupplierComponent } from './kirim-barang-return-ke-supplier/add-data/add-data.component';
import { AddDataDetailKirimBarangReturnKeSupplierComponent } from './kirim-barang-return-ke-supplier/add-data-detail/add-data-detail.component';
import { DetailKirimBarangReturnKeSupplierComponent } from './kirim-barang-return-ke-supplier/detail/detail.component';
//// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 START
import { TerimaBarangReturDariSiteListComponent } from './terima-barang-retur-dari-site/dt-list/terima-barang-retur-dari-site-list.component';
import { AddTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/add-data/add-data.component';
import { AddDataDetailTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/add-data-detail/add-data-detail.component';
import { DetailTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/detail/detail.component';
//// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 END
import { ReturnOrderComponent } from './return-order/return-order.component';
import { ListPenjualanBrgBekasComponent } from './penjualan-barang-bekas/list/list.component';
import { AddDataPenjualanBrgBekasComponent } from './penjualan-barang-bekas/add-data/add-data.component';
import { AddDataDetailPenjualanBrgBekasComponent } from './penjualan-barang-bekas/add-data-detail/add-data-detail.component';
import { DetailPenjualanBrgBekasComponent } from './penjualan-barang-bekas/detail/detail.component';
import { PenerimaanBrgBksListComponent } from './penerimaan-barang-bekas/dt-list/penerimaan-brg-bks-list.component';
import { AddPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/add-data/add-data.component';
import { AddDataDetailPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/add-data-detail/add-data-detail.component';
import { DetailPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/detail/detail.component';
import { PenerimaanBrgBksListNoreturComponent } from './penerimaan-barang-bekas/dt-list-noretur/penerimaan-brg-bks-list-noretur.component';
import { DetailPenerimaanBrgBksReturComponent } from './penerimaan-barang-bekas/detail-retur/detail-retur.component';
import { ProductionListForPostingComponent } from './production/dt-list-for-posting/production-list-for-posting.component';
import { ProductionComponent } from './production/production/production';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'delivery-item',
        component: DeliveryItemComponent,
      },
      {
        path: 'delivery-item/add-data',
        component: AddDataComponent,
      },
      {
        path: 'delivery-item/detail-transaction',
        component: DetailTransactionComponent,
      },
      {
        path: 'delivery-item/add-data-detail',
        component: AddDataDetailDeliveryComponent,
      },
      {
        path: 'delivery-item/dobalik',
        component: DobalikComponent,
      },
      {
        path: 'delivery-item/dobalik/detail-report-do-balik',
        component: DetailReportDoBalikComponent,
      },
      {
        path: 'delivery-item/packing-list',
        component: PackagingListComponent,
      },
      {
        path: 'delivery-item/revisi-do',
        component: PageAwalDoBalikComponent,
      },
      {
        path: 'delivery-item/revisi-do/edit',
        component: RevisiDoEditComponent,
      },
      {
        path: 'delivery-item/packing-list/entry-packing-list',
        component: EntryPackingListComponent,
      },
      {
        path: 'receipt-from-warehouse/tambah-data',
        component: AddDataGudangComponent,
      },
      {
        path: 'receipt-from-warehouse/tambah-data/detail-add-data-gudang',
        component: AddDataDetailGudangComponent,
      },
      {
        path: 'receipt-from-warehouse/display-data-dari-gudang',
        component: DisplayDataGudangComponent,
      },
      {
        path: 'receipt-from-warehouse/display-data-dari-gudang/detail-penerimaan-gudang',
        component: DetailPenerimaanGudangComponent,
      },
      {
        path: 'return-order',
        component: ReturnOrderComponent,
      },
    ],
  },
  {
    path: 'kirim-barang-return-ke-site',
    children: [
      {
        path: 'list-dt',
        component: KirimBarangReturnKeSiteListComponent,
      },
      {
        path: 'add-data',
        component: AddKirimBarangReturnKeSiteComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailKirimBarangReturnKeSiteComponent,
      },
      {
        path: 'detail',
        component: DetailKirimBarangReturnKeSiteComponent,
      },

    ],
  },
  {
    path: 'kirim-barang-return-ke-supplier',
    children: [
      {
        path: 'list-dt',
        component: KirimBarangReturnKeSupplierListComponent,
      },
      {
        path: 'add-data',
        component: AddKirimBarangReturnKeSupplierComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailKirimBarangReturnKeSupplierComponent,
      },
      {
        path: 'detail',
        component: DetailKirimBarangReturnKeSupplierComponent,
      },

    ],
  },
  {
    path: 'wastage',
    children: [
      {
        path: 'list-dt',
        component: WastageListComponent,
      },
      {
        path: 'add-data',
        component: AddWastageComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailWastageComponent,
      },
      {
        path: 'detail',
        component: DetailWastageComponent,
      },
    ],
  },
  {
    path: 'pembelian',
    children: [
      {
        path: 'list-dt',
        component: PembelianListComponent,
      },
      {
        path: 'add-data',
        component: AddPembelianComponent,
      },
      {
        path: 'detail',
        component: DetailPembelianComponent,
      },
    ],
  },
  {
    path: 'barang-untuk-pemakaian-sendiri',
    children: [
      {
        path: 'list-barang-untuk-pemakaian-sendiri',
        component: ListBarangUntukPemakaianSendiriComponent,
      },
      {
        path: 'tambah-data-pemakaian-barang-sendiri',
        component: AddDataPemakaianBarangSendiriComponent,
      },
      {
        path: 'display-data-pemakaian-barang-sendiri',
        component: DisplayDataPemakaianBarangSendiriComponent,
      },
      {
        path: 'detail-barang-untuk-pemakaian-sendiri',
        component: DetailBarangUntukPemakaianSendiriComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailBarangComponent,
      },
    ],
  },
  {
    path: 'retur-ke-supplier',
    children: [
      {
        path: 'list-barang-retur',
        component: ListBarangReturComponent,
      },
      {
        path: 'tambah-data-barang-retur',
        component: AddDataBarangReturComponent,
      },
      {
        path: 'display-data-barang-retur',
        component: DisplayDataBarangReturComponent,
      },
      {
        path: 'detail-pemakaian-barang',
        component: DetailBarangReturComponent,
      },
      {
        path: 'add-data-detail-barang-retur',
        component: AddDataDetailBarangReturComponent,
      },
    ],
  },
  {
    path: 'production',
    children: [
      {
        path: '',
        component: ProductionComponent,
      }
      ,
      {
        path: 'list-dt',
        component: ProductionListComponent,
      },
      {
        path: 'add-data',
        component: AddProductionComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailProductionComponent,
      },
      {
        path: 'detail',
        component: DetailProductionComponent,
      },
      {
        path:'list-dt-for-posting',
        component: ProductionListForPostingComponent,
      }
    ],
  },
  //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 START
  {
    path: 'terima-barang-retur-dari-site',
    children: [
      {
        path: 'list-dt',
        component:TerimaBarangReturDariSiteListComponent,
      },
      {
        path: 'add-data',
        component: AddTerimaBarangReturDariSiteComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailTerimaBarangReturDariSiteComponent,
      },
      {
        path: 'detail',
        component: DetailTerimaBarangReturDariSiteComponent,
      },
      
    ],
  },
  //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 END
   //// Tambah Modul Penjualan Barang Bekas - Yudha 09/04/2025 START
   {
    path: 'penjualan-barang-bekas',
    children: [
      {
        path: 'list',
        component:ListPenjualanBrgBekasComponent,
      },
      {
        path: 'add-data',
        component: AddDataPenjualanBrgBekasComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailPenjualanBrgBekasComponent,
      },
      {
        path: 'detail',
        component: DetailPenjualanBrgBekasComponent,
      },
      
    ],
  },
  //// Tambah Modul Penjualan Barang Bekas - Yudha 09/04/2025 END
  {
    path: 'penerimaan-barang-bekas',
    children: [
      {
        path: 'list',
        component: PenerimaanBrgBksListComponent,
      },
      {
        path: 'list-retur',
        component: PenerimaanBrgBksListNoreturComponent,
      },
      {
        path: 'add-data',
        component: AddPenerimaanBrgBksComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailPenerimaanBrgBksComponent,
      },
      {
        path: 'detail',
        component: DetailPenerimaanBrgBksComponent,
      },
      {
        path: 'detail-retur',
        component: DetailPenerimaanBrgBksReturComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
