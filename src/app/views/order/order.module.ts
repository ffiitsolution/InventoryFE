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
  TextColorDirective,
  UtilitiesModule,
  TableModule,

} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderRoutingModule } from './order-routing.module';
import {
  ReceivingOrderComponent,
  ReceivingOrderDetailComponent,
  ReceivingOrderAddFormComponent,
  ReceivingOrderAddDetailFormComponent,
  AddDataDetailOrderManualComponent,
  AddDataOrderManualComponent
} from './receiving-order';
import {
  ReceivingPoSupplierComponent,
  ReceivingPoSupplierDetailComponent,
  ReceivingPoSupplierAddFormComponent,
  ReceivingPoSupplierAddDetailFormComponent,
} from './receiving-po-supplier';
import {
  SendOrderToWarehouseComponent,
  SendOrderToWarehouseAddComponent,
  AddDataDetailSendOrderToWarehouseComponent,
  DetailSendOrderToWarehouseComponent
} from './send-order-to-warehouse';
import {
  SendOrderToSupplierViaRSCComponent,
  AddDataSendOrderToSupplierComponent,
  AddDataDetailSendOrderToSupplierComponent,
  DetailSendOrderToSupplierComponent
} from './send-order-to-supplier'

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { OrderComponent } from './order/order';
import { SharedComponentModule } from '../../component/shared.component.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    OrderRoutingModule,
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
    SelectDropDownModule,
    TableModule,
    SharedComponentModule
  ],
  declarations: [
    ReceivingOrderComponent,
    ReceivingOrderDetailComponent,
    ReceivingOrderAddFormComponent,
    ReceivingOrderAddDetailFormComponent,
    SendOrderToWarehouseComponent,
    SendOrderToWarehouseAddComponent,
    DetailSendOrderToWarehouseComponent,
    AddDataDetailSendOrderToWarehouseComponent,
    SendOrderToSupplierViaRSCComponent,
    AddDataSendOrderToSupplierComponent,
    AddDataDetailSendOrderToSupplierComponent,
    DetailSendOrderToSupplierComponent,
    ReceivingPoSupplierComponent,
    ReceivingPoSupplierDetailComponent,
    ReceivingPoSupplierAddFormComponent,
    ReceivingPoSupplierAddDetailFormComponent,
    AddDataDetailOrderManualComponent,
    AddDataOrderManualComponent,
    OrderComponent
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderModule {}
