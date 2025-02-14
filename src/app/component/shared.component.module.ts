import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CardModule, GridModule, ButtonDirective } from "@coreui/angular";
import { PrintButtonSharedComponent } from "./print-btn/print-button.component";

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    GridModule,
    HttpClientModule,
    ButtonDirective
  ],
  declarations: [
    PrintButtonSharedComponent
  ],
  schemas: [],
  exports: [
    PrintButtonSharedComponent
  ]
})
export class SharedComponentModule {}
