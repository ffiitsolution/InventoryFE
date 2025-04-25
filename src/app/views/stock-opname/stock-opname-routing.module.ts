import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupSoComponent } from './1-setup-so/setup-so.component';
import { SetupSoDetailComponent } from './1-setup-so/detail/detail.component';
import { StockSoAddComponent } from './1-setup-so/add/add.component';
import { StockSoEditComponent } from './1-setup-so/edit/edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'setup-so',
        component: SetupSoComponent,
      },
      {
        path: 'add',
        component: StockSoAddComponent,
      },
      {
        path: 'detail',
        component: SetupSoDetailComponent,
      },
      {
        path: 'edit',
        component: StockSoEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockOpnameRoutingModule {}
