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
import { reports } from './reports';

@Component({
  selector: 'app-all-report',
  templateUrl: './all-report.component.html',
  styleUrl: './all-report.component.scss',
})
export class AllReportComponent implements OnInit, OnDestroy, AfterViewInit {
  reports = reports;
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  selectedRowData: any;
  verticalItemCount: number = 6;
  reportCategoryData: any;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
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
    if (!this.g.selectedReportCategory) {
      this.g.selectedReportCategory = this.getObjectKeys(reports)[0];
    }
    this.getGroupedReports();
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

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  onCategoryClick(category: any) {
    this.g.selectedReportCategory = category;
    this.getGroupedReports();
  }

  getSortedItems() {
    const allItems = Object.values(reports).flatMap((category: any) =>
      Object.values(category)
    );
    return allItems.sort((a: any, b: any) => a.id - b.id);
  }

  onClickReport(report: any) {
    this.router.navigate([report.path], {
      queryParams: { report: report.name },
      skipLocationChange: true,
    });
  }

  getGroupedReports() {
    const reportsArray: any[] = this.getObjectKeys(
      reports[this.g.selectedReportCategory]
    );
    const chunkedReports: any[][] = [];

    for (let i = 0; i < reportsArray.length; i += this.verticalItemCount) {
      chunkedReports.push(reportsArray.slice(i, i + this.verticalItemCount));
    }

    const lastChunk = chunkedReports[chunkedReports.length - 1];
    const missingItems = this.verticalItemCount - lastChunk.length;

    for (let i = 0; i < missingItems; i++) {
      lastChunk.push(null);
    }

    this.reportCategoryData = chunkedReports;
  }
}
