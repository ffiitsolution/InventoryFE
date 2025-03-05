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
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrl: './all-report.component.scss',
})
export class AllReportComponent implements OnInit, OnDestroy, AfterViewInit {
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
        path: '/report-cabang',
      },
      department: {
        id: 2,
        name: 'Master Department',
        path: '/report-department',
      },
    },
    pesanan: {
      cabang: {
        id: 1,
        name: 'Ke Supplier',
        path: '/report-pesanan-ke-supplier',
      },
      department: {
        id: 2,
        name: 'Ke Gudang',
        path: '/report-pesanan-ke-gudang',
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

  getCategories() {
    return Object.keys(this.reports).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      items: Object.values(this.reports[key])
    }));
  }

  onCategoryClick(category: any) {
    this.selectedCategory = category;
  }

  getSortedItems() {
    const allItems = Object.values(this.reports).flatMap((category:any) => Object.values(category));
    return allItems.sort((a: any, b: any) => a.id - b.id);
  }
}
