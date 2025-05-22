import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CardModule, GridModule, ButtonDirective, ModalModule } from "@coreui/angular";
import { PrintButtonSharedComponent } from "./print-btn/print-button.component";
import { NgxPaginationModule } from "ngx-pagination";
import { PrintButtonGrowthSharedComponent } from "./print-btn-growth/print-btn-growth.component";
import { ModalPrintListComponent } from "./modal-print-list/modal-print-list.component";
import { FormsModule } from "@angular/forms";
import { LoadingComponent } from "./loading/loading.component";

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    GridModule,
    HttpClientModule,
    ButtonDirective,
    NgxPaginationModule,
    ModalModule,
    FormsModule
  ],
  declarations: [
    PrintButtonSharedComponent,
    PrintButtonGrowthSharedComponent,
    ModalPrintListComponent,
    LoadingComponent
  ],
  schemas: [],
  exports: [
    PrintButtonSharedComponent,
    NgxPaginationModule,
    PrintButtonGrowthSharedComponent,
    ModalPrintListComponent,
    LoadingComponent
  ]
})
export class SharedComponentModule {}
