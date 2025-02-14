import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';
import { AddDataDetailDeliveryComponent } from './add-data-detail/add-data-detail.component';
import { DobalikComponent } from './dobalik/dobalik.component';
import { DetailReportDoBalikComponent } from './detail-report-do-balik/detail-report-do-balik.component';
import { PackagingListComponent } from './packing-list/packing-list.component';
import { RevisiDoComponent } from './revisi-do/revisi-do.component';
import { RevisiDoEditComponent } from './revisi-do/revisi-do-edit/revisi-do-edit.component';

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
      },
      {
        path: 'delivery-item/dobalik',
        component: DobalikComponent,
      },
      {
        path: 'delivery-item/dobalik/detail-report-do-balik',
        component: DetailReportDoBalikComponent,
      },
      {
        path: 'delivery-item/packing-list',
        component: PackagingListComponent,
      },
      {
        path: 'delivery-item/revisi-do',
        component: RevisiDoComponent,
        // children: [{
        //   path: 'edit',
        //   component: RevisiDoEditComponent,
        // }
        // ]
      },
      {
        path: 'delivery-item/revisi-do/edit',
        component: RevisiDoEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule { }
