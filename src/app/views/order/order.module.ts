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
} from './receiving-order';
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
    TableModule
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
    DetailSendOrderToSupplierComponent
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderModule {}
