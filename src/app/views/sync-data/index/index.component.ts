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
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { AppService } from '../../../service/app.service';

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
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  currentDate: Date = new Date();
  paramTglTransaksi: any = new Date();
  dateRangeString: string;
  startOfMonth: any;
  endOfMonth: any;
  loadingState: { [key: string]: boolean } = {
    submit: false,
    selectedRegion: false,
    statusAktif: false,
    tipeListing: false,
  };
  userData: any;
  downloadURL: any = [];
  currentReport: string = 'Cek Data Stock Minus';
  rangeDateVal = [new Date(), new Date()];
  constructor(
    private service: AppService,
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe,
  ) {
    this.startOfMonth = moment().startOf('month').format('DD MMMM YYYY');
    this.endOfMonth = moment().endOf('month').format('DD MMMM YYYY');
    this.dateRangeString = `(Periode :${this.startOfMonth} - ${this.endOfMonth})`;

    this.dpConfigtrans.containerClass = 'theme-dark-blue';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    // this.dpConfigtrans.minDate = moment().startOf('month').toDate();
    this.dpConfigtrans.customTodayClass = 'today-highlight';
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Kirim') +
        ' ' +
        this.translation.instant('Terima') +
        ' Data - ' +
        this.g.tabTitle
    );
    this.getCompanyProfile();
    this.userData = this.service.getUserData();
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

  processBackupDb() {
    this.service.insert('/api/backup-database/process', {}).subscribe({
      next: (res) => {
        const data = res.data ?? {};
        console.log(data);
      },
      error: (err) => {
        console.log('err: ' + err);
      },
    });
  }

  onTglTransaksiChange(value: Date): void {
    if (value) {
      this.startOfMonth = moment(value).startOf('month').format('DD MMMM YYYY');
      this.endOfMonth = moment(value).endOf('month').format('DD MMMM YYYY');
      console.log('Start:', this.startOfMonth, 'End:', this.endOfMonth);

      this.dateRangeString = `(Periode :${this.startOfMonth} - ${this.endOfMonth})`;
    }
  }

  doSubmit(type: string) {
    this.loadingState['submit'] = true;
    const previousMonth = moment(this.paramTglTransaksi).subtract(1, 'month');
    
    let param = {
      userData: this.userData,
      isDownloadCsv: type === 'csv',
      kodeGudang: this.g.getUserLocationCode(),
      firstDate:this.startOfMonth,
      lastDate:moment(this.paramTglTransaksi).format('DD MMM YYYY'),
      yearEom:previousMonth.format('YYYY'),
      monthEom:previousMonth.format('MM'),
      reportName: this.currentReport,
      reportSlug: this.g.formatUrlSafeString(this.currentReport),
    };

    this.service.getFile('/api/report/report-jasper', param).subscribe({
      next: (res) => {
        this.loadingState['submit'] = false;

        if (type === 'preview') {
          return this.previewPdf(res);
        } else if (type === 'csv') {
          return this.downloadCsv(res, type);
        } else {
          return this.downloadPDF(res, type);
        }
      },
      error: (error) => {
        console.log(error);
        this.loadingState['submit'] = false;
      },
    });
  }

  previewPdf(res: any) {
    var blob = new Blob([res], { type: 'application/pdf' });
    this.downloadURL = window.URL.createObjectURL(blob);
    window.open(this.downloadURL);
  }

  downloadPDF(res: any, reportType: string) {
    var blob = new Blob([res], { type: 'application/pdf' });
    this.downloadURL = window.URL.createObjectURL(blob);

    if (this.downloadURL.length) {
      var link = document.createElement('a');
      link.href = this.downloadURL;
      link.download = `${reportType} Report ${this.g.formatUrlSafeString(
        this.currentReport
      )} ${this.datePipe.transform(
        this.rangeDateVal[0],
        'dd-MMM-yyyy'
      )} s.d. ${this.datePipe.transform(
        this.rangeDateVal[1],
        'dd-MMM-yyyy'
      )}.pdf`;
      link.click();
      this.toastr.success('File sudah terunduh');
    } else this.toastr.error('File tidak dapat terunduh');
  }

  downloadCsv(res: any, reportType: string) {
    var blob = new Blob([res], { type: 'text/csv' });
    this.downloadURL = window.URL.createObjectURL(blob);

    if (this.downloadURL.length) {
      var link = document.createElement('a');
      link.href = this.downloadURL;
      link.download = `${reportType} Report ${this.g.formatUrlSafeString(
        this.currentReport
      )} ${this.datePipe.transform(
        this.rangeDateVal[0],
        'dd-MMM-yyyy'
      )} s.d. ${this.datePipe.transform(
        this.rangeDateVal[1],
        'dd-MMM-yyyy'
      )}.csv`;
      link.click();
      this.toastr.success('File sudah terunduh');
    } else this.toastr.error('File tidak dapat terunduh');
  }
}
