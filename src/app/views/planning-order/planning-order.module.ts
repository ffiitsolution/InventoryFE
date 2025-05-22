import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AlertComponent,
  ProgressComponent ,
  ProgressBarComponent,
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
  ProgressModule 
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { PlanningOrderRoutingModule } from './planning-order-routing.module';
import { AddPlanningOrderComponent } from './add-data/add-data.component';
import { AddDataDetailPlanningOrderComponent } from './add-data-detail/add-data-detail.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedComponentModule } from '../../component/shared.component.module';
import { LoadingComponent } from '../../component';
import { PagesModule } from '../pages/pages.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    PagesModule,
    PlanningOrderRoutingModule,
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
    BsDatepickerModule.forRoot(),
    SharedComponentModule,
    TableModule,
    AlertComponent,
    ProgressComponent,
    ProgressBarComponent,
    ProgressModule
  ],
  declarations: [
    AddPlanningOrderComponent,
    AddDataDetailPlanningOrderComponent
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class PlanningOrderModule {}
