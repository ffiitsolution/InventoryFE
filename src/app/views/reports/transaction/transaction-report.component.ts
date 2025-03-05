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

@Component({
  selector: 'app-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss',
})
export class TransactionReportComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  selectedRowData: any;
  reports: any = {
    master: {
      cabang: {
        id: 1,
        name: 'Master Cabang',
        path: '/reports/master',
      },
      department: {
        id: 2,
        name: 'Master Department',
        path: '/reports/report-department',
      },
      gudang: {
        id: 2,
        name: 'Master Gudang',
        path: '/reports/report-gudang',
      },
    },
    pesanan: {
      cabang: {
        id: 1,
        name: 'Ke Supplier',
        path: '/reports/report-pesanan-ke-supplier',
      },
      department: {
        id: 2,
        name: 'Ke Gudang',
        path: '/reports/report-pesanan-ke-gudang',
      },
    },
    analisis: {
      cabang: {
        id: 1,
        name: 'Pembelian By Supplier',
        path: '/reports/report-pembelian-by-supplier',
      },
      department: {
        id: 2,
        name: 'Ke Gudang',
        path: '/reports/report-pesanan-ke-gudang',
      },
    },
  };

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('All') +
        ' ' +
        this.translation.instant('Report') +
        ' - ' +
        this.g.tabTitle
    );
    this.selectedCategory = this.getObjectKeys(this.reports)[0];
  }

  ngOnDestroy(): void {
    $.fn['dataTable'].ext.search.pop();
  }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {}


  selectedCategory: any = null;

  getObjectKeys(obj : Object) {
    return Object.keys(obj);
  }

  onCategoryClick(category: any) {
    this.selectedCategory = category;
  }

  getSortedItems() {
    const allItems = Object.values(this.reports).flatMap((category:any) => Object.values(category));
    return allItems.sort((a: any, b: any) => a.id - b.id);
  }

  onClickReport(report : any){
    console.log(JSON.stringify(report));
  }
}
