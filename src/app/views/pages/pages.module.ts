import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { DividerComponent, LoadingComponent } from '../../component';
import { AvatarModule, BadgeModule, ButtonModule, CardModule, DropdownModule, FormModule, GridModule, HeaderModule, ModalModule, NavModule, PaginationModule, SpinnerModule, TemplateIdDirective, WidgetStatBComponent, WidgetStatEComponent, WidgetStatFComponent } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MpcsFooterComponent } from './mpcs-production/mpcs-footer/mpcs-footer.component';
import { MpcsHeaderComponent } from './mpcs-production/mpcs-header/mpcs-header.component';
import { MpcsProductionComponent } from './mpcs-production/mpcs-production.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../component/shared.component.module';
import { MpcsLayoutComponent } from './mpcs-production/mpcs-layout/mpcs-layout.component';
import { MpcsListComponent } from './mpcs-production/mpcs-list/mpcs-list.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    LoadingComponent,
    DividerComponent,
    LoginComponent,
    RegisterComponent,
    Page404Component,
    Page500Component,
    MpcsFooterComponent,
    MpcsHeaderComponent,
    MpcsProductionComponent,
    MpcsLayoutComponent,
    MpcsListComponent
  ],
  imports: [
    CommonModule,
    NavModule,
    HeaderModule,
    PagesRoutingModule,
    CardModule,
    ButtonModule,
    GridModule,
    IconModule,
    FormModule,
    ModalModule,
    DropdownModule,
    SpinnerModule,
    PaginationModule,
    BadgeModule,
    AvatarModule,
    WidgetStatBComponent,
    WidgetStatEComponent,
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    SharedComponentModule,
   
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    WidgetStatFComponent,
    TemplateIdDirective
  ]
})
export class PagesModule {
}
