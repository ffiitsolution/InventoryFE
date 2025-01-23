import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DeliveryItemComponent} from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'delivery-item',
        component: DeliveryItemComponent,
      },
      {
        path: 'add-data',
        component: AddDataComponent,
      },
      // {
      //   path: 'delivery-transactions'
      // }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
