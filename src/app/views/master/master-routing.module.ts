import {
  TableSetNumberAddComponent,
  TableSetNumberComponent,
  TableSetNumberDetailComponent,
  TableSetNumberEditComponent,
} from './table-set-number';
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
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  MasterBranchComponent,
  MasterBranchDetailComponent,
  MasterBranchAddComponent,
  MasterBranchEditComponent,
} from './master-branch';
import { MasterCompanyComponent } from './master-company/master-company.component';
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
  TableCityAreaAddComponent,
  TableCityAreaComponent,
  TableCityAreaDetailComponent,
  TableCityAreaEditComponent,
} from './table-city-area';
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
  MasterRoleAddComponent,
  MasterRoleComponent,
  MasterRoleDetailComponent,
  MasterRoleEditComponent,
} from './master-role';

import { MasterUserComponent } from './master-user/master-user.component';
import { MasterUserEditComponent } from './master-user/edit/edit.component';
import { MasterUserDetailComponent } from './master-user/detail/detail.component';
import { MasterUserAddComponent } from './master-user/add/add.component';
import { AddResepComponent, MasterResepComponent } from './master-resep';
import { ProfileCompanyComponent } from './profile-company/profile-company.component';
import { AllMasterComponent } from './all-master/all-master.component';

import { MasterDriverComponent } from './master-driver/master-driver.component';
import { MasterBranchDetailTonaseComponent } from './master-branch-detail-tonase/master-branch-detail-tonase.component';
import { MasterKendaraanComponent } from './master-kendaraan/master-kendaraan.component';
import { MasterBranchDetailAddComponent } from './master-branch-detail-tonase/add/master-branch-detail-add/master-branch-detail-add.component';
import { MasterBranchDetailEditComponent } from './master-branch-detail-tonase/edit/master-branch-detail-edit/master-branch-detail-edit.component';
import { MasterBranchDetailTonaseDetailComponent } from './master-branch-detail-tonase/detail/master-branch-detail/master-branch-detail.component';
import { MasterDriverAddComponent } from './master-driver/add/master-driver-add/master-driver-add.component';
import { MasterDriverEditComponent } from './master-driver/edit/master-driver-edit/master-driver-edit.component';
import { MasterDriverDetailComponent } from './master-driver/detail/master-driver-detail/master-driver-detail.component';
import { MasterKendaraanAddComponent } from './master-kendaraan/add/master-kendaraan-add/master-kendaraan-add.component';
import { MasterKendaraanEditComponent } from './master-kendaraan/edit/master-kendaraan-edit/master-kendaraan-edit.component';
import { MasterKendaraanDetailComponent } from './master-kendaraan/detail/master-kendaraan-detail/master-kendaraan-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AllMasterComponent,
      },
      {
        path: 'master-driver',
        component: MasterDriverComponent,
      },
        {
        path: 'master-driver/add',
        component: MasterDriverAddComponent,
      },
        {
        path: 'master-driver/edit',
        component: MasterDriverEditComponent,
      },
        {
        path: 'master-driver/detail',
        component: MasterDriverDetailComponent,
      },
       {
        path: 'master-branch-detail',
        component: MasterBranchDetailTonaseComponent,
      },
      {
        path: 'master-branch-detail/add',
        component: MasterBranchDetailAddComponent,
      },
        {
        path: 'master-branch-detail/edit',
        component: MasterBranchDetailEditComponent,
      },
      {
        path: 'master-branch-detail/detail',
        component: MasterBranchDetailTonaseDetailComponent,
      },
        {
        path: 'master-kendaraan',
        component: MasterKendaraanComponent,
      },
      {
        path: 'master-kendaraan/add',
        component: MasterKendaraanAddComponent,
      },
      {
        path: 'master-kendaraan/edit',
        component: MasterKendaraanEditComponent,
      },
      {
        path: 'master-kendaraan/detail',
        component: MasterKendaraanDetailComponent,
      },
      
      {
        path: 'master-company',
        component: MasterCompanyComponent,
      },
      {
        path: 'master-user',
        component: MasterUserComponent,
      },
      {
        path: 'master-user/edit',
        component: MasterUserEditComponent,
      },
      {
        path: 'master-user/detail',
        component: MasterUserDetailComponent,
      },
      {
        path: 'master-user/add',
        component: MasterUserAddComponent,
      },
      {
        path: 'master-branch',
        component: MasterBranchComponent,
      },
      {
        path: 'master-branch/detail',
        component: MasterBranchDetailComponent,
      },
      {
        path: 'master-branch/add',
        component: MasterBranchAddComponent,
      },
      {
        path: 'master-branch/edit',
        component: MasterBranchEditComponent,
      },
      {
        path: 'master-department',
        component: MasterDepartmentComponent,
      },
      {
        path: 'master-product',
        component: MasterProductComponent,
      },
      {
        path: 'master-product/add',
        component: MasterProductAddComponent,
      },
      {
        path: 'master-product/detail',
        component: MasterProductDetailComponent,
      },
      {
        path: 'master-product/edit',
        component: MasterProductEditComponent,
      },
      {
        path: 'master-supplier',
        component: MasterSupplierComponent,
      },
      {
        path: 'master-supplier/add',
        component: MasterSupplierAddComponent,
      },
      {
        path: 'master-supplier/detail',
        component: MasterSupplierDetailComponent,
      },
      {
        path: 'master-supplier/edit',
        component: MasterSupplierEditComponent,
      },
      {
        path: 'master-location',
        component: MasterLocationComponent,
      },
      {
        path: 'master-location/add',
        component: MasterLocationAddComponent,
      },
      {
        path: 'master-location/detail',
        component: MasterLocationDetailComponent,
      },
      {
        path: 'master-location/edit',
        component: MasterLocationEditComponent,
      },
      {
        path: 'master-area',
        component: TableAreaComponent,
      },
      {
        path: 'master-area/add',
        component: TableAreaAddComponent,
      },
      {
        path: 'master-area/detail',
        component: TableAreaDetailComponent,
      },
      {
        path: 'master-area/edit',
        component: TableAreaEditComponent,
      },
      {
        path: 'master-city-area',
        component: TableCityAreaComponent,
      },
      {
        path: 'master-city-area/add',
        component: TableCityAreaAddComponent,
      },
      {
        path: 'master-city-area/detail',
        component: TableCityAreaDetailComponent,
      },
      {
        path: 'master-city-area/edit',
        component: TableCityAreaEditComponent,
      },
      {
        path: 'master-regional',
        component: TableRegionalComponent,
      },
      {
        path: 'master-regional/detail',
        component: TableRegionalDetailComponent,
      },
      {
        path: 'master-regional/add',
        component: TableRegionalAddComponent,
      },
      {
        path: 'master-regional/edit',
        component: TableRegionalEditComponent,
      },
      {
        path: 'master-rsc',
        component: TableRscComponent,
      },
      {
        path: 'master-rsc/add',
        component: TableRscAddComponent,
      },
      {
        path: 'master-rsc/edit',
        component: TableRscEditComponent,
      },
      {
        path: 'master-rsc/detail',
        component: TableRscDetailComponent,
      },
      {
        path: 'master-uom',
        component: TableUomComponent,
      },
      {
        path: 'master-uom/add',
        component: TableUomAddComponent,
      },
      {
        path: 'master-uom/detail',
        component: TableUomDetailComponent,
      },
      {
        path: 'master-uom/edit',
        component: TableUomEditComponent,
      },
      ///
      {
        path: 'master-rute',
        component: TableRuteComponent,
      },
      {
        path: 'master-rute/add',
        component: TableRuteAddComponent,
      },
      {
        path: 'master-rute/detail',
        component: TableRuteDetailComponent,
      },
      {
        path: 'master-rute/edit',
        component: TableRuteEditComponent,
      },
      ///
      {
        path: 'master-set-number',
        component: TableSetNumberComponent,
      },
      {
        path: 'master-set-number/add',
        component: TableSetNumberAddComponent,
      },
      {
        path: 'master-set-number/detail',
        component: TableSetNumberDetailComponent,
      },
      {
        path: 'master-set-number/edit',
        component: TableSetNumberEditComponent,
      },
      {
        path: 'master-position',
        component: TablePositionComponent,
      },
      {
        path: 'master-position/add',
        component: TablePositionAddComponent,
      },
      {
        path: 'master-position/edit',
        component: TablePositionEditComponent,
      },
      {
        path: 'master-position/detail',
        component: TablePositionDetailComponent,
      },
      {
        path: 'master-resep',
        component: MasterResepComponent,
      },
      {
        path: 'master-role',
        component: MasterRoleComponent,
      },
      {
        path: 'master-role/add',
        component: MasterRoleAddComponent,
      },
      {
        path: 'master-role/edit',
        component: MasterRoleEditComponent,
      },
      {
        path: 'master-role/detail',
        component: MasterRoleDetailComponent,
      },
      {
        path: 'master-resep/detail',
        component: AddResepComponent,
      },
      {
        path: 'profile-company',
        component: ProfileCompanyComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
