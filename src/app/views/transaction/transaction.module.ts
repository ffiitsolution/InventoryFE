import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  ButtonGroupModule,
  CardModule,
  CollapseDirective,
  FormModule,
  GridModule,
  ModalModule,
  PaginationModule,
  TableModule,
  TextColorDirective,
  UtilitiesModule,
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionRoutingModule } from './transaction-routing.module';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';
import { AddDataDetailDeliveryComponent } from './add-data-detail/add-data-detail.component';
import { DobalikComponent } from './dobalik/dobalik.component';
import { DetailReportDoBalikComponent } from './detail-report-do-balik/detail-report-do-balik.component';
import { PageAwalDoBalikComponent } from './revisi-do/page-awal-do/page-awal-do.component';
import { PackagingListComponent } from './packing-list/packing-list.component';
import { SharedComponentModule } from '../../component/shared.component.module';
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
import { PembelianListComponent } from './pembelian/dt/pembelian-list.component';
import { AddPembelianComponent } from './pembelian/add-data/add-data.component';
import { AddDataDetailPembelianComponent } from './pembelian/add-data-detail/add-data-detail.component';
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

import { SelectDropDownModule } from 'ngx-select-dropdown';

//// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 START
import { TerimaBarangReturDariSiteListComponent } from './terima-barang-retur-dari-site/dt-list/terima-barang-retur-dari-site-list.component';
import { AddTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/add-data/add-data.component';
import { AddDataDetailTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/add-data-detail/add-data-detail.component';
import { DetailTerimaBarangReturDariSiteComponent } from './terima-barang-retur-dari-site/detail/detail.component';
//// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 END

import { ReturnOrderComponent } from './return-order/return-order.component';
import { AddDataDetailPenjualanBrgBekasComponent } from './penjualan-barang-bekas/add-data-detail/add-data-detail.component';
import { ListPenjualanBrgBekasComponent } from './penjualan-barang-bekas/list/list.component';
import { DetailPenjualanBrgBekasComponent } from './penjualan-barang-bekas/detail/detail.component';
import { AddDataPenjualanBrgBekasComponent } from './penjualan-barang-bekas/add-data/add-data.component';
import { AddPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/add-data/add-data.component';
import { AddDataDetailPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/add-data-detail/add-data-detail.component';
import { DetailPenerimaanBrgBksComponent } from './penerimaan-barang-bekas/detail/detail.component';
import { PenerimaanBrgBksListComponent } from './penerimaan-barang-bekas/dt-list/penerimaan-brg-bks-list.component';
import { PenerimaanBrgBksListNoreturComponent } from './penerimaan-barang-bekas/dt-list-noretur/penerimaan-brg-bks-list-noretur.component';
import { DetailPenerimaanBrgBksReturComponent } from './penerimaan-barang-bekas/detail-retur/detail-retur.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    TransactionRoutingModule,
    CardModule,
    GridModule,
    HttpClientModule,
    DataTablesModule,
    TranslateModule.forChild(),
    CollapseDirective,
    ButtonDirective,
    TextColorDirective,
    FormsModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    ModalModule,
    TableModule,
    SharedComponentModule,
    PaginationModule,
    SelectDropDownModule
  ],
  declarations: [
    DeliveryItemComponent,
    AddDataComponent,
    DetailTransactionComponent,
    AddDataDetailDeliveryComponent,
    PageAwalDoBalikComponent,
    DobalikComponent,
    DetailReportDoBalikComponent,
    PackagingListComponent,
    EntryPackingListComponent,
    AddDataGudangComponent,
    RevisiDoComponent,
    RevisiDoEditComponent,
    WastageListComponent,
    AddWastageComponent,
    AddDataDetailWastageComponent,
    DetailWastageComponent,
    AddDataDetailGudangComponent,
    DisplayDataGudangComponent,
    PembelianListComponent,
    AddPembelianComponent,
    AddDataDetailPembelianComponent,
    ListBarangUntukPemakaianSendiriComponent,
    AddDataPemakaianBarangSendiriComponent,
    DisplayDataPemakaianBarangSendiriComponent,
    DetailBarangUntukPemakaianSendiriComponent,
    AddDataDetailBarangComponent,
    ListBarangReturComponent,
    AddDataBarangReturComponent,
    DisplayDataBarangReturComponent,
    DetailBarangReturComponent,
    AddDataDetailBarangReturComponent,
    DetailPembelianComponent,
    ProductionListComponent,
    AddProductionComponent,
    AddDataDetailProductionComponent,
    DetailProductionComponent,
    KirimBarangReturnKeSiteListComponent,
    AddKirimBarangReturnKeSiteComponent,
    AddDataDetailKirimBarangReturnKeSiteComponent,
    DetailKirimBarangReturnKeSiteComponent,    
    KirimBarangReturnKeSupplierListComponent,
    AddKirimBarangReturnKeSupplierComponent,
    AddDataDetailKirimBarangReturnKeSupplierComponent,
    DetailKirimBarangReturnKeSupplierComponent,    
    //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 START
    TerimaBarangReturDariSiteListComponent,
    AddTerimaBarangReturDariSiteComponent,
    AddDataDetailTerimaBarangReturDariSiteComponent,
    DetailTerimaBarangReturDariSiteComponent,
    //// Tambah Modul Terima Barang Retur dari Site - Aditya 19/03/2025 END
    ReturnOrderComponent,
    // Tambah modul Penjualan Brg Bekas - Yudha 09/04/2025
    AddDataDetailPenjualanBrgBekasComponent,
    AddDataPenjualanBrgBekasComponent,
    ListPenjualanBrgBekasComponent,
    DetailPenjualanBrgBekasComponent,

    AddPenerimaanBrgBksComponent,
    DetailPenerimaanBrgBksComponent,
    AddDataDetailPenerimaanBrgBksComponent,
    PenerimaanBrgBksListComponent,
    PenerimaanBrgBksListNoreturComponent,
    DetailPenerimaanBrgBksReturComponent

  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionModule {}
