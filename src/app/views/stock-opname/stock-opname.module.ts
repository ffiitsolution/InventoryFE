import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
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
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { SetupSoDetailComponent } from './1-setup-so/detail/detail.component';
import { SetupSoComponent } from './1-setup-so/setup-so.component';
import { StockOpnameRoutingModule } from './stock-opname-routing.module';
import { StockSoAddComponent } from './1-setup-so/add/add.component';
import { StockSoEditComponent } from './1-setup-so/edit/edit.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedCustomPipeModule } from '../../pipes/shared-pipe.module';
import { SharedComponentModule } from '../../component/shared.component.module';
import { DisplaySelisihSoComponent } from './6-result-so/display-selisih-so.component';
import { DetailDisplaySelisihSoComponent } from './6-result-so/detail/detail.component';
import { EnterAsTabDirective } from '../../directives/enter-as-tab.directive';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    StockOpnameRoutingModule,
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
    NgxPaginationModule,
    SharedCustomPipeModule,
    SharedComponentModule,
  ],
  declarations: [
    SetupSoComponent,
    SetupSoDetailComponent,
    StockSoAddComponent,
    StockSoEditComponent,
    DisplaySelisihSoComponent,
    DetailDisplaySelisihSoComponent,
    EnterAsTabDirective
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class StockOpnameModule {}
