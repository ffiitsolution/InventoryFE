import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutingModule } from './master-routing.module';
import { MasterUserComponent } from './master-user/master-user.component';
import { MasterUserEditComponent } from './master-user/edit/edit.component';
import { MasterUserDetailComponent } from './master-user/detail/detail.component';
import {  MasterUserAddComponent } from './master-user/add/add.component';
import { MasterBranchComponent } from './master-branch/master-branch.component';
import { MasterDepartmentComponent } from './master-department/master-department.component';
import {
  MasterProductAddComponent,
  MasterProductComponent,
  MasterProductDetailComponent,
  MasterProductEditComponent,
} from './master-product';
import {
  MasterSupplierAddComponent,
  MasterSupplierComponent,
  MasterSupplierDetailComponent,
  MasterSupplierEditComponent,
} from './master-supplier';
import {
  MasterLocationAddComponent,
  MasterLocationComponent,
  MasterLocationDetailComponent,
  MasterLocationEditComponent,
} from './master-location';
import {
  TableAreaAddComponent,
  TableAreaComponent,
  TableAreaDetailComponent,
  TableAreaEditComponent,
} from './table-area';
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
import { MasterCompanyComponent } from './master-company/master-company.component';
import {
  TableRegionalComponent,
  TableRegionalDetailComponent,
  TableRegionalAddComponent,
  TableRegionalEditComponent,
} from './table-regional';
import {
  TableRscComponent,
  TableRscAddComponent,
  TableRscEditComponent,
  TableRscDetailComponent,
} from './table-rsc';
import {
  TableUomAddComponent,
  TableUomComponent,
  TableUomDetailComponent,
  TableUomEditComponent,
} from './table-uom';

import {
  TableCityAreaAddComponent,
  TableCityAreaComponent,
  TableCityAreaDetailComponent,
  TableCityAreaEditComponent,
} from './table-city-area';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {
  TableSetNumberComponent,
  TableSetNumberAddComponent,
  TableSetNumberEditComponent,
  TableSetNumberDetailComponent,
} from './table-set-number';
import { SelectDropDownModule } from 'ngx-select-dropdown';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    MasterRoutingModule,
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
  ],
  declarations: [
    MasterUserComponent,
    MasterUserDetailComponent,
    MasterUserAddComponent,
    MasterUserEditComponent,
    MasterCompanyComponent,
    MasterBranchComponent,
    MasterDepartmentComponent,

    MasterProductComponent,
    MasterProductAddComponent,
    MasterProductDetailComponent,
    MasterProductEditComponent,

    MasterSupplierComponent,
    MasterSupplierAddComponent,
    MasterSupplierDetailComponent,
    MasterSupplierEditComponent,

    MasterLocationComponent,
    MasterLocationAddComponent,
    MasterLocationDetailComponent,
    MasterLocationEditComponent,

    TableAreaComponent,
    TableAreaAddComponent,
    TableAreaDetailComponent,
    TableAreaEditComponent,

    TableRegionalComponent,
    TableRegionalDetailComponent,
    TableRegionalAddComponent,
    TableRegionalEditComponent,

    TableRscComponent,
    TableRscAddComponent,
    TableRscDetailComponent,
    TableRscEditComponent,

    TableUomComponent,
    TableUomAddComponent,
    TableUomDetailComponent,
    TableUomEditComponent,

    TableCityAreaComponent,
    TableCityAreaAddComponent,
    TableCityAreaDetailComponent,
    TableCityAreaEditComponent,

    TableSetNumberComponent,
    TableSetNumberAddComponent,
    TableSetNumberEditComponent,
    TableSetNumberDetailComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class MasterModule {}
