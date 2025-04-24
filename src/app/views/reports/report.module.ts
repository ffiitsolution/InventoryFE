import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import {
  ButtonDirective,
  ButtonGroupModule,
  CardModule,
  CollapseDirective,
  DropdownModule,
  FormCheckLabelDirective,
  FormModule,
  GridModule,
  ListGroupModule,
  ModalModule,
  ProgressComponent,
  TableModule,
  TextColorDirective,
  UtilitiesModule,
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportRoutingModule } from './report-routing.module';
import { AllReportComponent } from './all-report/all-report.component';
import { AnalysisReportComponent } from './analysis/analysis-report.component';
import { MasterReportComponent } from './master/master-report.component';
import { OrderReportComponent } from './order/order-report.component';
import { StockReportComponent } from './stock/stock-report.component';
import { TransactionReportComponent } from './transaction/transaction-report.component';
import { QueryStockReportComponent } from './query-stock/query-stock-report.component';
import { SharedCustomPipeModule } from '../../pipes/shared-pipe.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    ReportRoutingModule,
    CommonModule,
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
    ModalModule,
    SelectDropDownModule,
    ListGroupModule,
    FormCheckLabelDirective,
    DropdownModule,
    ProgressComponent,
    NgxPaginationModule,
    TableModule,
    BsDatepickerModule.forRoot(),
    SharedCustomPipeModule,
  ],
  declarations: [
    AllReportComponent,
    AnalysisReportComponent,
    MasterReportComponent,
    OrderReportComponent,
    StockReportComponent,
    TransactionReportComponent,
    QueryStockReportComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class ReportModule {}
