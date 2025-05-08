import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllReportComponent } from './all-report/all-report.component';
import { TransactionReportComponent } from './transaction/transaction-report.component';
import { StockReportComponent } from './stock/stock-report.component';
import { OrderReportComponent } from './order/order-report.component';
import { MasterReportComponent } from './master/master-report.component';
import { AnalysisReportComponent } from './analysis/analysis-report.component';
import { QueryStockReportComponent } from './query-stock/query-stock-report.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'all',
        component: AllReportComponent,
      },
      {
        path: 'analysis',
        component: AnalysisReportComponent,
      },
      {
        path: 'master',
        component: MasterReportComponent,
      },
      {
        path: 'order',
        component: OrderReportComponent,
      },
      {
        path: 'stock',
        component: StockReportComponent,
      },
      {
        path: 'transaction',
        component: TransactionReportComponent,
      },
      {
        path: 'query-stock',
        component: QueryStockReportComponent,
      },
      {
        path: 'activity-log',
        component: ActivityLogComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
