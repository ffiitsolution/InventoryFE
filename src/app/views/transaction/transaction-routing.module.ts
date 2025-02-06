import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DeliveryItemComponent} from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';
import { AddDataDetailDeliveryComponent } from './add-data-detail/add-data-detail.component';

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
      },
      {
        path: 'delivery-item/add-data-detail',
        component: AddDataDetailDeliveryComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
