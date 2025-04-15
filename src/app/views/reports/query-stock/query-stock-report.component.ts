import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AppService } from '../../../service/app.service';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-query-stock-report',
  templateUrl: './query-stock-report.component.html',
  styleUrl: './query-stock-report.component.scss',
})
export class QueryStockReportComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  [key: string]: any;
  loadingState: { [key: string]: boolean } = {
    submit: false,
    selectedRegion: false,
    statusAktif: false,
    tipeListing: false,
  };
  isLoading: boolean = false;
  userData: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  searchText: string = '';

  listData: any[] = [];
  selectedDate: Date;

  currentPage = 1;

  constructor(
    private service: AppService,
    private g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.showWeekNumbers = false;
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Query') +
        ' ' +
        this.translation.instant('Stock Card') +
        ' - ' +
        this.g.tabTitle
    );
    this.userData = this.service.getUserData();
    this.selectedDate = new Date();
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.getStockMovement();
  }

  onChangePeriode(event: any): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  getStockMovement() {
    this.isLoading = true;
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    this.service
      .insert('/api/stock-movement', {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        // lastYearEom: 2025,
        // lastMonthEom: 2,
        yearEom: year,
        monthEom: month,
      })
      .subscribe({
        next: (res) => {
          this.listData = res.data ?? [];
          this.isLoading = false;
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
        },
      });
  }
}
