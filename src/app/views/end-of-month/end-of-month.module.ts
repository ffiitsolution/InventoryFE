import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  AccordionButtonDirective,
  AccordionComponent,
  AccordionItemComponent,
  AlertComponent,
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
  TemplateIdDirective,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { EndOfMonthRoutingModule } from './end-of-month-routing.module';
import { EndOfMonthComponent } from './end-of-month.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';

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
    DataTablesModule,
    AccordionComponent,
    AccordionItemComponent,
    TemplateIdDirective,
    AccordionButtonDirective,
    AlertComponent
  ],
  declarations: [EndOfMonthComponent],
})
export class EndOfMonthModule {}
