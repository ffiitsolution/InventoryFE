import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ReceivingOrderComponent,
  ReceivingOrderDetailComponent,
  ReceivingOrderAddFormComponent,
  ReceivingOrderAddDetailFormComponent,
  AddDataDetailOrderManualComponent,
  AddDataOrderManualComponent
} from './receiving-order';
import {
  ReceivingPoSupplierComponent,
  ReceivingPoSupplierDetailComponent,
  ReceivingPoSupplierAddFormComponent,
  ReceivingPoSupplierAddDetailFormComponent,
} from './receiving-po-supplier';
import {
  SendOrderToWarehouseComponent,
  SendOrderToWarehouseAddComponent,
  AddDataDetailSendOrderToWarehouseComponent,
  DetailSendOrderToWarehouseComponent,
} from './send-order-to-warehouse';
import {
  SendOrderToSupplierViaRSCComponent,
  AddDataSendOrderToSupplierComponent,
  DetailSendOrderToSupplierComponent
} from './send-order-to-supplier';

import { OrderComponent } from './order/order';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'order',
        component: OrderComponent,
      },
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
      {
        path: 'send-order-to-supplier-via-rsc/detail',
        component: DetailSendOrderToSupplierComponent,
      },      
      {
        path: 'receiving-po-supplier',
        component: ReceivingPoSupplierComponent,
      },
      {
        path: 'receiving-po-supplier/add',
        component: ReceivingPoSupplierAddFormComponent,
      },
      {
        path: 'receiving-po-supplierr/add/detail',
        component: ReceivingPoSupplierAddDetailFormComponent,
      },
      {
        path: 'receiving-po-supplier/detail',
        component: ReceivingPoSupplierDetailComponent,
      },
      {
        path: 'receiving-order/order-manual',
        component: AddDataOrderManualComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
