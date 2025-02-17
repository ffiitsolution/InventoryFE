import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ReceivingOrderComponent,
  ReceivingOrderDetailComponent,
  ReceivingOrderAddFormComponent,
  ReceivingOrderAddDetailFormComponent,
} from './receiving-order';
import {
  SendOrderToWarehouseComponent,
  SendOrderToWarehouseAddComponent,
  AddDataDetailSendOrderToWarehouseComponent,
  DetailSendOrderToWarehouseComponent,
} from './send-order-to-warehouse';
import {
  SendOrderToSupplierViaRSCComponent,
  AddDataSendOrderToSupplierComponent,
} from './send-order-to-supplier';
// import { SendOrderToSupplierViaRSCComponent } from './send-order-to-supplier/send-order-to-supplier';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'receiving-order',
        component: ReceivingOrderComponent,
      },
      {
        path: 'receiving-order/add',
        component: ReceivingOrderAddFormComponent,
      },
      {
        path: 'receiving-order/add/detail',
        component: ReceivingOrderAddDetailFormComponent,
      },
      {
        path: 'receiving-order/detail',
        component: ReceivingOrderDetailComponent,
      },
      {
        path: 'send-order-to-warehouse',
        component: SendOrderToWarehouseComponent,
      },
      {
        path: 'send-order-to-warehouse/add',
        component: SendOrderToWarehouseAddComponent,
      },
      {
        path: 'send-order-to-warehouse/add-data-detail',
        component: AddDataDetailSendOrderToWarehouseComponent,
      },
      {
        path: 'send-order-to-warehouse/detail',
        component: DetailSendOrderToWarehouseComponent,
      },
      {
        path: 'send-order-to-supplier-via-rsc',
        component: SendOrderToSupplierViaRSCComponent,
      },
      {
        path: 'send-order-to-supplier-via-rsc/add-data',
        component: AddDataSendOrderToSupplierComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
