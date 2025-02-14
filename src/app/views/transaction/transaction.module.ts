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
import { RevisiDoComponent } from './revisi-do/revisi-do.component';
import { RevisiDoEditComponent } from './revisi-do/revisi-do-edit/revisi-do-edit.component';

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
    SharedComponentModule
  ],
  declarations: [
    DeliveryItemComponent,
    AddDataComponent,
    DetailTransactionComponent,
    AddDataDetailDeliveryComponent,
    DobalikComponent,
    DetailReportDoBalikComponent,
    PackagingListComponent,
    RevisiDoComponent,
    RevisiDoEditComponent
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionModule {}
