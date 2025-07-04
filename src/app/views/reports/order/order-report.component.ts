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
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
import { DEFAULT_DATE_RANGE_RECEIVING_ORDER } from '../../../../constants';
@Component({
  selector: 'app-order-report',
  templateUrl: './order-report.component.html',
  styleUrl: './order-report.component.scss',
})
export class OrderReportComponent implements OnInit, OnDestroy, AfterViewInit {
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];

  [key: string]: any;
  loadingState: { [key: string]: boolean } = {
    submit: false,
    selectedRegion: false,
    statusAktif: false,
    tipeListing: false,
  };
  userData: any;
  currentReport: string = '';
  rangeDateVal = [new Date(), new Date()];
  downloadURL: any = [];

  configRegion: any;

  listRegion: any = [];

  selectedRegion: any;

  paramStatusAktif: string = '';
  // paramTipeListing: string = 'header';
  paramTipeListing: string = 'baru';
  paramStatusPesanan = '1';//pesann baru

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name' // Key to search
  };
  public dpConfigSinglePicker: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  dateFilter: any = new Date();

  constructor(
    private service: AppService,
    private g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';

    this.dpConfigSinglePicker.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigSinglePicker.adaptivePosition = true;
    this.dpConfigSinglePicker.minDate = new Date(new Date().setHours(0, 0, 0, 0));
    this.dpConfigSinglePicker.containerClass =  'theme-dark-blue';
    this.dpConfigSinglePicker.customTodayClass = 'today-highlight';

  }

  transformDate(date: any): string {
    return moment(date).format('DD MMM YYYY');
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('All') +
        ' ' +
        this.translation.instant('Report') +
        ' - ' +
        this.g.tabTitle
    );
    this.route.queryParams.subscribe((params) => {
      this.currentReport = params['report'];
    });

    this.configRegion = this.g.dropdownConfig('description');

    this.userData = this.service.getUserData();

    if (['Master Cabang'].includes(this.currentReport)) {
      this.getListParam('listRegion');
    }
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  getBack() {
    this.router.navigate(['/reports/all']);
  }

  getListParam(type: string, report: string = '') {
    this.loadingState['selectedRegion'] = true;
    this.service
      .insert('/api/report/list-report-param', { type: type, report: report })
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];
          const allVal = {
            code: '',
            description: 'Semua',
          };
          this.listRegion = [allVal, ...data];
          this.selectedRegion = allVal;
          this.loadingState['selectedRegion'] = false;
        },
        error: (error) => {
          console.log(error);
          this.loadingState['selectedRegion'] = false;
        },
      });
  }

  onChangeList(
    selected: any,
    paramCode: string,
    paramName: string,
    targetProperty: any
  ) {
    this[targetProperty] = selected;
  }

  doSubmit(type: string) {
    this.loadingState['submit'] = true;

    let param = {};
    if (this.currentReport === 'Pesanan Ke Gudang') {
      console.log('userdata', this.userData);
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        statusPesanan:this.paramStatusPesanan,
      };
    }

    if (this.currentReport === 'Pesanan Ke Supplier') {

      if(this.paramTipeListing == 'baru'){
        this.paramStatusPesanan= '1'; //pesan baru
      }else if(this.paramTipeListing == 'sisa'){
        this.paramStatusPesanan = '2'; //pesan sisa
      }else{
        this.paramStatusPesanan = '3'; //pesan selesai
      }
      
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        statusPesanan:this.paramStatusPesanan,
      };
    }

    if (this.currentReport === 'Tanggal Pesan vs Tanggal Kirim') {
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        statusPesanan:this.paramStatusPesanan,
      };
    }

    if (this.currentReport === 'Estimasi Pengiriman Barang') {
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        tglBrgDiKirim: this.g.transformDate(this.dateFilter),
      };
    }

     if (this.currentReport === 'Terima Pesanan Cabang') {
      console.log('userdata', this.userData);
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        statusPesanan:this.paramStatusPesanan,
      };
    }

    param = {
      ...param,
      userData: this.userData,
      isDownloadCsv: type === 'csv' || type === 'xlsx',
      isDownloadXlsx: type === 'xlsx',
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
        } else if (type === 'xlsx') {
          return this.downloadXlsx(res, type);
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

  downloadXlsx(res: any, reportType: string) {
    var blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
      )}.xlsx`;
      link.click();
      this.toastr.success('File sudah terunduh');
    } else this.toastr.error('File tidak dapat terunduh');
  }
}
