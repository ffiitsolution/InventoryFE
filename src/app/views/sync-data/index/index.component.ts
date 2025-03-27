import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_UOM,
} from '../../../../constants';
import { Router } from '@angular/router';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-index-sync-data',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class AllSyncDataComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  selectedRowData: any;
  verticalItemCount: number = 6;
  reportCategoryData: any;
  selectedMenu: string = 'Kirim Data Transaksi';
  companyProfile: any = {};

  constructor(
    private service: AppService,
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Kirim') +
        ' ' +
        this.translation.instant('Terima') +
        ' Data - ' +
        this.g.tabTitle
    );
    this.getCompanyProfile();
  }

  ngOnDestroy(): void {}

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  onCategoryClick(category: any) {
    this.g.selectedReportCategory = category;
  }

  onClickMenu(menu: string) {
    this.selectedMenu = menu;
    // this.router.navigate([menu.path], {
    //   queryParams: { report: menu.name },
    //   skipLocationChange: true,
    // });
  }

  getCompanyProfile() {
    this.service.insert('/api/profile/company', {}).subscribe({
      next: (res) => {
        const data = res ?? {};
        this.companyProfile = data;
      },
      error: (err) => {
        console.log('err: ' + err);
      },
    });
  }
}
