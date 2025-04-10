import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CardModule, GridModule, ButtonDirective } from "@coreui/angular";
import { PrintButtonSharedComponent } from "./print-btn/print-button.component";
import { NgxPaginationModule } from "ngx-pagination";
import { PrintButtonGrowthSharedComponent } from "./print-btn-growth/print-btn-growth.component";

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    GridModule,
    HttpClientModule,
    ButtonDirective,
    NgxPaginationModule,
  ],
  declarations: [
    PrintButtonSharedComponent,
    PrintButtonGrowthSharedComponent
  ],
  schemas: [],
  exports: [
    PrintButtonSharedComponent,
    NgxPaginationModule,
    PrintButtonGrowthSharedComponent

  ]
})
export class SharedComponentModule {}
