import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPlanningOrderComponent } from './add-data/add-data.component';


const routes: Routes = [
 {
     path: '',
     component: AddPlanningOrderComponent,
     data: {
       title: `Planning Order`
     }
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanningOrderRoutingModule {}
