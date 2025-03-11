import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EndOfMonthComponent } from './end-of-month.component';


const routes: Routes = [
  {
    path: '',
    component: EndOfMonthComponent,
    data: {
      title: `Tutup Bulan`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EndOfMonthRoutingModule {
}
