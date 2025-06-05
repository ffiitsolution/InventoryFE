import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllSyncDataComponent } from './index/index.component';
import { CheckDataSentSyncDataComponent } from './check-data-sent/check-data-sent.component';
import { CekDataPengirimanComponent } from './cek-data-pengiriman/cek-data-pengiriman.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all',
        component: AllSyncDataComponent,
      },
      {
        path: 'check-data-sent',
        component: CheckDataSentSyncDataComponent,
      },
      {
        path: 'cek-data-pengiriman',
        component: CekDataPengirimanComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyncDataRoutingModule {}
