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
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterBranchComponent } from './master-branch/master-branch.component';
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
import { MasterUserComponent } from './master-user/master-user.component';
import { EditMasterUserComponent } from './master-user/edit/edit-master-user.component';
import { MasterUserDetailComponent } from './master-user/detail/detail.component';
import { MasterUserAddComponent } from './master-user/add/add.component';

const routes: Routes = [
  {
    path: '',
    children: [
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
        component: EditMasterUserComponent,
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
        path: 'table-area',
        component: TableAreaComponent,
      },
      {
        path: 'table-area/add',
        component: TableAreaAddComponent,
      },
      {
        path: 'table-area/detail',
        component: TableAreaDetailComponent,
      },
      {
        path: 'table-area/edit',
        component: TableAreaEditComponent,
      },
      {
        path: 'table-city-area',
        component: TableCityAreaComponent,
      },
      {
        path: 'table-city-area/add',
        component: TableCityAreaAddComponent,
      },
      {
        path: 'table-city-area/detail',
        component: TableCityAreaDetailComponent,
      },
      {
        path: 'table-city-area/edit',
        component: TableCityAreaEditComponent,
      },
      {
        path: 'table-regional',
        component: TableRegionalComponent,
      },
      {
        path: 'table-regional/detail',
        component: TableRegionalDetailComponent,
      },
      {
        path: 'table-regional/add',
        component: TableRegionalAddComponent,
      },
      {
        path: 'table-regional/edit',
        component: TableRegionalEditComponent,
      },
      {
        path: 'table-rsc',
        component: TableRscComponent,
      },
      {
        path: 'table-rsc/add',
        component: TableRscAddComponent,
      },
      {
        path: 'table-rsc/edit',
        component: TableRscEditComponent,
      },
      {
        path: 'table-rsc/detail',
        component: TableRscDetailComponent,
      },
      {
        path: 'table-uom',
        component: TableUomComponent,
      },
      {
        path: 'table-uom/add',
        component: TableUomAddComponent,
      },
      {
        path: 'table-uom/detail',
        component: TableUomDetailComponent,
      },
      {
        path: 'table-uom/edit',
        component: TableUomEditComponent,
      },
      {
        path: 'table-set-number',
        component: TableSetNumberComponent,
      },
      {
        path: 'table-set-number/add',
        component: TableSetNumberAddComponent,
      },
      {
        path: 'table-set-number/detail',
        component: TableSetNumberDetailComponent,
      },
      {
        path: 'table-set-number/edit',
        component: TableSetNumberEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MasterRoutingModule {}
