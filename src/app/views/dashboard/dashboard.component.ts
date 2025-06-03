import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { AppService } from '../../service/app.service';
import { TranslationService } from '../../service/translation.service';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private service: AppService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {}

  loadings: { [key: string]: boolean } = {};
  dashboardData: any;
  userData: any;

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Dashboard') + ' - ' + this.g.tabTitle
    );
    this.userData = this.service.getUserData();
    this.getDashboardData();
  }

  getDashboardData() {
    this.loadings['getDashboardData'] = true;
    this.dashboardData = { count: {} };
    this.service.insert('/api/dashboard-data', {}).subscribe({
      next: (res) => {
        this.dashboardData = res.data ?? {};
        this.loadings['getDashboardData'] = false;
      },
      error: (err) => {
        this.loadings['getDashboardData'] = false;
        console.log('err: ' + err);
      },
    });
    this.getPesananBelumDiterima();
  }

  getPesananBelumDiterima() {
    this.loadings['getPesananBelumDiterima'] = true;
    this.service
      .insert('/api/request-to-external', {
        endpoint: 'warehouse',
        url: '/api/receiving-order/count-hq',
        method: 'POST',
        body: {
          kodeGudang: this.userData?.defaultLocation?.kodeLocation,
          startDate: moment().subtract(7, 'days').format('DD MMM YYYY'),
          endDate: moment().format('DD MMM YYYY'),
        },
      })
      .subscribe({
        next: (res) => {
          this.dashboardData['count']['pesananBelumDiterima'] = res.data ?? 0;
          this.loadings['getPesananBelumDiterima'] = false;
        },
        error: (err) => {
          this.loadings['getPesananBelumDiterima'] = false;
          console.log('err: ' + err);
        },
      });
  }
}
