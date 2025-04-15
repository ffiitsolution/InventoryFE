import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GlobalService } from '../../service/global.service';
import { AppService } from '../../service/app.service';
import { TranslationService } from '../../service/translation.service';
import { Router } from '@angular/router';

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

  dashboardData: any;

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Dashboard') +
        ' - ' +
        this.g.tabTitle
    );
    this.getDashboardData();
  }

  getDashboardData(){
    this.dashboardData = '';
    this.service.insert('/api/dashboard-data', {}).subscribe({
      next: (res) => {
        this.dashboardData = res.data ?? {};
      },
      error: (err) => {
        console.log('err: ' + err);
      }
    });
  }
}
