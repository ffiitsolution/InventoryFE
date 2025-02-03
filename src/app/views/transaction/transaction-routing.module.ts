import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DeliveryItemComponent} from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'delivery-item',
        component: DeliveryItemComponent,
      },
      {
        path: 'delivery-item/add-data',
        component: AddDataComponent,
      },
      {
        path: 'delivery-item/detail-transaction',
        component: DetailTransactionComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
