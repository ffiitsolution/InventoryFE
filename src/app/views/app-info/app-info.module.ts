import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ButtonDirective,
  ButtonGroupModule,
  CardModule,
  CollapseDirective,
  FormModule,
  GridModule,
  ListGroupModule,
  ModalModule,
  TabsModule,
  TextColorDirective,
  UtilitiesModule,
} from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { AppInfoRoutingModule } from './app-info-routing.module';
import { AllAppInfoComponent } from './index/index.component';
import { ModulesComponent } from './modules/modules.component';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { AboutSoftwareComponent } from './about-software/about-software.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
// import { PdfViewerModule } from 'ng2-pdf-viewer';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    AppInfoRoutingModule,
    CommonModule,
    CardModule,
    GridModule,
    HttpClientModule,
    DataTablesModule,
    TranslateModule.forChild(),
    CollapseDirective,
    ButtonDirective,
    TextColorDirective,
    FormsModule,
    FormModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    ModalModule,
    SelectDropDownModule,
    ListGroupModule,
    TabsModule,
    // PdfViewerModule,
    NgxExtendedPdfViewerModule,
  ],
  declarations: [
    AllAppInfoComponent,
    ModulesComponent,
    ReleaseNoteComponent,
    AboutSoftwareComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppInfoModule {}
