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
import { MasterUserAddComponent } from './master-user/add/add.component';
import {
  MasterBranchComponent,
  MasterBranchDetailComponent,
  MasterBranchAddComponent,
  MasterBranchEditComponent,
} from './master-branch';
import { MasterBranchDetailTonaseComponent } from './master-branch-detail-tonase/master-branch-detail-tonase.component';
import { MasterDepartmentComponent } from './master-department/master-department.component';
import { MasterBranchDetailTonaseDetailComponent } from './master-branch-detail-tonase/detail/master-branch-detail/master-branch-detail.component';
import {
  MasterProductAddComponent,
  MasterProductComponent,
  MasterProductDetailComponent,
  MasterProductEditComponent,
} from './master-product';

import { MasterDriverComponent } from './master-driver/master-driver.component';
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
  ListGroupModule,
  ModalModule,
  PopoverModule,
  TableModule,
  TextColorDirective,
  UtilitiesModule,
  // AccordionComponent,
  // AccordionItemComponent,
  // AccordionButtonDirective,
  AccordionModule,
  SharedModule,
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
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
  TablePositionComponent,
  TablePositionAddComponent,
  TablePositionEditComponent,
  TablePositionDetailComponent,
} from './table-position';
import {
  TableUomAddComponent,
  TableUomComponent,
  TableUomDetailComponent,
  TableUomEditComponent,
} from './table-uom';

import {
  TableRuteAddComponent,
  TableRuteComponent,
  TableRuteDetailComponent,
  TableRuteEditComponent,
} from './table-rute';

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
import {
  AddDataDetailResepComponent,
  AddResepComponent,
  MasterResepComponent,
} from './master-resep';
import {
  MasterRoleAddComponent,
  MasterRoleComponent,
  MasterRoleDetailComponent,
  MasterRoleEditComponent,
} from './master-role';
import { AddDataDetailProductionComponent } from '../transaction/production/add-data-detail/add-data-detail.component';
import { ProfileCompanyComponent } from './profile-company/profile-company.component';
import { SharedComponentModule } from '../../component/shared.component.module';
import { AllMasterComponent } from './all-master/all-master.component';
import { IconDirective } from '@coreui/icons-angular';
import { MasterKendaraanComponent } from './master-kendaraan/master-kendaraan.component';
import { MasterDriverAddComponent } from './master-driver/add/master-driver-add/master-driver-add.component';
import { MasterDriverDetailComponent } from './master-driver/detail/master-driver-detail/master-driver-detail.component';
import { MasterDriverEditComponent } from './master-driver/edit/master-driver-edit/master-driver-edit.component';
import { MasterKendaraanAddComponent } from './master-kendaraan/add/master-kendaraan-add/master-kendaraan-add.component';
import { MasterKendaraanDetailComponent } from './master-kendaraan/detail/master-kendaraan-detail/master-kendaraan-detail.component';
import { MasterKendaraanEditComponent } from './master-kendaraan/edit/master-kendaraan-edit/master-kendaraan-edit.component';
import { MasterBranchDetailAddComponent } from './master-branch-detail-tonase/add/master-branch-detail-add/master-branch-detail-add.component';
import { MasterBranchDetailEditComponent } from './master-branch-detail-tonase/edit/master-branch-detail-edit/master-branch-detail-edit.component';

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
    TableModule,
    PopoverModule,
    IconDirective,
    ListGroupModule,
    NgxPaginationModule,
    SharedComponentModule,
    AccordionModule,
    SharedModule,
  ],
  declarations: [
    AllMasterComponent,
    MasterKendaraanComponent,
    MasterKendaraanAddComponent,
    MasterKendaraanDetailComponent,
    MasterKendaraanEditComponent,
    MasterBranchDetailTonaseComponent,
    MasterBranchDetailAddComponent,
    MasterBranchDetailEditComponent,
    MasterBranchDetailTonaseDetailComponent,
    MasterUserComponent,
    MasterUserDetailComponent,
    MasterUserAddComponent,
    MasterUserEditComponent,
    MasterCompanyComponent,
    MasterBranchComponent,
    MasterBranchDetailComponent,
    MasterBranchAddComponent,
    MasterBranchEditComponent,
    MasterDepartmentComponent,
    MasterDriverComponent,
    MasterDriverAddComponent,
    MasterDriverDetailComponent,
    MasterDriverEditComponent,

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

    TableRuteComponent,
    TableRuteAddComponent,
    TableRuteDetailComponent,
    TableRuteEditComponent,

    TableCityAreaComponent,
    TableCityAreaAddComponent,
    TableCityAreaDetailComponent,
    TableCityAreaEditComponent,

    TableSetNumberComponent,
    TableSetNumberAddComponent,
    TableSetNumberEditComponent,
    TableSetNumberDetailComponent,

    TablePositionComponent,
    TablePositionAddComponent,
    TablePositionDetailComponent,
    TablePositionEditComponent,

    MasterResepComponent,
    AddResepComponent,
    AddDataDetailResepComponent,

    MasterRoleAddComponent,
    MasterRoleComponent,
    MasterRoleDetailComponent,
    MasterRoleEditComponent,

    ProfileCompanyComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class MasterModule {}
