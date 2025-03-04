import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupSoComponent } from './1-setup-so/setup-so.component';
import { SetupSoDetailComponent } from './1-setup-so/detail/detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'setup-so',
        component: SetupSoComponent,
      },
      {
        path: 'setup-so/detail',
        component: SetupSoDetailComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockOpnameRoutingModule {}
