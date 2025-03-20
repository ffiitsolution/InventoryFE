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
import { ListBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri.component';
import { AddDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/tambah-data-pemakaian-barang-sendiri/add-data-pemakaian-barang-sendiri.component';
import { DisplayDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/display-data-pemakaian-barang-sendiri/display-data-pemakaian-barang-sendiri-detail.component';
import { DetailBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/detail-pemakaian-barang/detail-barang-untuk-pemakaian-sendiri.component'
import { AddDataDetailBarangComponent } from './barang-untuk-pemakaian-sendiri/add-data-detail/add-data-detail-barang.component';
import { ListBarangReturComponent } from './retur-barang-to-supllier/list-barang-retur/list-barang.component';
import { AddDataBarangReturComponent } from './retur-barang-to-supllier/tambah-data-barang-retur/add-data-retur.component';
import { DisplayDataBarangReturComponent } from './retur-barang-to-supllier/display-data-barang-retur/display-data.component';
import { DetailBarangReturComponent } from './retur-barang-to-supllier/detail-pemakaian-barang/detail-barang.component';
import { AddDataDetailBarangReturComponent } from './retur-barang-to-supllier/add-data-detail-barang-retur/add-detail.component';

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
    
  ],
  declarations: [
    DeliveryItemComponent,
    AddDataComponent,
    DetailTransactionComponent,
    AddDataDetailDeliveryComponent,
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
    
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionModule {}
