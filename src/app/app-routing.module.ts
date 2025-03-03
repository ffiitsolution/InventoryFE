import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './views/pages/login/login.component';
import { AccountSettingComponent } from './views/pages/account-setting';
import { AuthGuard } from './service/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate:[AuthGuard],
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'theme',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'base',
        loadChildren: () =>
          import('./views/base/base.module').then((m) => m.BaseModule),
      },
      {
        path: 'buttons',
        loadChildren: () =>
          import('./views/buttons/buttons.module').then((m) => m.ButtonsModule),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule),
      },
      {
        path: 'charts',
        loadChildren: () =>
          import('./views/charts/charts.module').then((m) => m.ChartsModule),
      },
      {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/icons.module').then((m) => m.IconsModule),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/notifications.module').then(
            (m) => m.NotificationsModule
          ),
      },
      {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/widgets.module').then((m) => m.WidgetsModule),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule),
      },
      {
        path: 'master',
        loadChildren: () =>
          import('./views/master/master.module').then((m) => m.MasterModule),
      },
      {
        path: 'order',
        loadChildren: () =>
          import('./views/order/order.module').then((m) => m.OrderModule),
      },
      {
        path: 'transaction',
        loadChildren: () =>
          import('./views/transaction/transaction.module').then((m) => m.TransactionModule),
      },
      {
        path: 'account-setting',
        component: AccountSettingComponent,
      },
    ],
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404',
    },
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500',
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page',
    },
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking',
      // relativeLinkResolution: 'legacy'
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
