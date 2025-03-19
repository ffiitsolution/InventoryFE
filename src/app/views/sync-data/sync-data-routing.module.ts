import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllSyncDataComponent } from './index/index.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all',
        component: AllSyncDataComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SyncDataRoutingModule {}
