import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AvatarModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ModalModule,
  NavModule,
  ProgressModule,
  TableModule,
  TabsModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { EndOfMonthRoutingModule } from './end-of-month-routing.module';
import { EndOfMonthComponent } from './end-of-month.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    EndOfMonthRoutingModule,
    TranslateModule.forChild(),
    CardModule,
    NavModule,
    IconModule,
    TabsModule,
    CommonModule,
    GridModule,
    ProgressModule,
    ReactiveFormsModule,
    ButtonModule,
    FormModule,
    FormsModule,
    ButtonModule,
    ButtonGroupModule,
    AvatarModule,
    TableModule,
    ModalModule,
  ],
  declarations: [EndOfMonthComponent],
})
export class EndOfMonthModule {}
