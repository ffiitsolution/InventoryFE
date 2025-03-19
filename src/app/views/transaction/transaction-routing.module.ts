import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryItemComponent } from './delivery-item/delivery-item.component';
import { AddDataComponent } from './add-data/add-data.component';
import { DetailTransactionComponent } from './detail-transaction/detail-transaction.component';
import { AddDataDetailDeliveryComponent } from './add-data-detail/add-data-detail.component';
import { DobalikComponent } from './dobalik/dobalik.component';
import { DetailReportDoBalikComponent } from './detail-report-do-balik/detail-report-do-balik.component';
import { PackagingListComponent } from './packing-list/packing-list.component';
import { AddDataGudangComponent } from './add-data-gudang/add-data-gudang.component';
import { EntryPackingListComponent } from './packing-list/entry-packing-list/entry-packing-list.component';
import { RevisiDoComponent } from './revisi-do/revisi-do.component';
import { RevisiDoEditComponent } from './revisi-do/revisi-do-edit/revisi-do-edit.component';
import { WastageListComponent } from './pemusnahan-wastage/dt-list/wastage-list.component';
import { AddWastageComponent } from './pemusnahan-wastage/add-data/add-data.component';
import { AddDataDetailWastageComponent } from './pemusnahan-wastage/add-data-detail/add-data-detail.component';
import { DetailWastageComponent } from './pemusnahan-wastage/detail/detail.component';
import { AddDataDetailGudangComponent } from './add-data-gudang/detail-add-data-gudang/detail-add-data-gudang.component';
import { DisplayDataGudangComponent } from './add-data-gudang/display-data-dari-gudang/display-data-dari-gudang.component';
import { PembelianListComponent } from './pembelian/dt/pembelian-list.component';
import { AddPembelianComponent } from './pembelian/add-data/add-data.component';
import { ListBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri.component';
import { AddDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/tambah-data-pemakaian-barang-sendiri/add-data-pemakaian-barang-sendiri.component';
import { DisplayDataPemakaianBarangSendiriComponent } from './barang-untuk-pemakaian-sendiri/display-data-pemakaian-barang-sendiri/display-data-pemakaian-barang-sendiri-detail.component';
import { DetailBarangUntukPemakaianSendiriComponent } from './barang-untuk-pemakaian-sendiri/detail-pemakaian-barang/detail-barang-untuk-pemakaian-sendiri.component';
import { AddDataDetailBarangComponent } from './barang-untuk-pemakaian-sendiri/add-data-detail/add-data-detail-barang.component';
import { ProductionListComponent } from './production/dt-list/production-list.component';
import { AddProductionComponent } from './production/add-data/add-data.component';
import { AddDataDetailProductionComponent } from './production/add-data-detail/add-data-detail.component';
import { DetailProductionComponent } from './production/detail/detail.component';


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
      {
        path: 'delivery-item/packing-list/entry-packing-list',
        component: EntryPackingListComponent,
      },
      {
        path: 'receipt-from-warehouse/tambah-data',
        component: AddDataGudangComponent,
      },
      {
        path: 'receipt-from-warehouse/tambah-data/detail-add-data-gudang',
        component: AddDataDetailGudangComponent,
      },
      {
        path: 'receipt-from-warehouse/display-data-dari-gudang',
        component: DisplayDataGudangComponent,
      }
    ],
  },
  {
    path: 'wastage',
    children: [
      {
        path: 'list-dt',
        component: WastageListComponent,
      },
      {
        path: 'add-data',
        component: AddWastageComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailWastageComponent,
      },
      {
        path: 'detail',
        component: DetailWastageComponent,
      },

    ],
  },
  {
    path: 'pembelian',
    children: [
      {
        path: 'list-dt',
        component: PembelianListComponent,
      },
      {
        path: 'add-data',
        component: AddPembelianComponent,
      },
      {
        path: 'detail',
        component: DetailWastageComponent,
      }
    ],
  },
  {
    path: 'barang-untuk-pemakaian-sendiri',
    children: [
      {
        path: 'list-barang-untuk-pemakaian-sendiri',
        component: ListBarangUntukPemakaianSendiriComponent,
      },
      {
        path: 'tambah-data-pemakaian-barang-sendiri',
        component: AddDataPemakaianBarangSendiriComponent,
      },
      {
        path: 'display-data-pemakaian-barang-sendiri',
        component: DisplayDataPemakaianBarangSendiriComponent,
      },
      {
        path: 'detail-barang-untuk-pemakaian-sendiri',
        component: DetailBarangUntukPemakaianSendiriComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailBarangComponent,
      },
    ],
  },
  {
    path: 'production',
    children: [
      {
        path: 'list-dt',
        component:ProductionListComponent,
      },
      {
        path: 'add-data',
        component: AddProductionComponent,
      },
      {
        path: 'add-data-detail',
        component: AddDataDetailProductionComponent,
      },
      {
        path: 'detail',
        component: DetailProductionComponent,
      },
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule { }
