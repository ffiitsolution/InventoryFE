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
import { DatePipe, formatDate } from '@angular/common';
import { AppService } from '../../../service/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-index-sync-data',
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class AllSyncDataComponent implements OnInit, OnDestroy, AfterViewInit {
  loadings: { [key: string]: boolean } = {};
  clicked: { [key: string]: boolean } = {};
  messages: { [key: string]: string } = {};
  listParams: { [key: string]: any } = {};
  selectedParam: { [key: string]: any } = {};
  columns: any;
  page: any;
  // page = new Page();
  data: any;
  selectedRowData: any;
  verticalItemCount: number = 6;
  reportCategoryData: any;
  selectedMenu: string = 'Kirim Data Transaksi';
  companyProfile: any = {};
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  currentDate: Date = new Date();
  paramTglTransaksi: any = new Date();
  startTglKirim: any = new Date();
  endTglKirim: any = new Date();
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
  listBackupDb: any[] = [];
  configSelect: any;
  listHistoryTerimaData: any[] = [];
  listHistoryKirimData: any[] = [];

  constructor(
    private service: AppService,
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.startOfMonth = moment().startOf('month').format('DD MMMM YYYY');
    this.endOfMonth = moment().endOf('month').format('DD MMMM YYYY');
    this.dateRangeString = `(Periode :${this.startOfMonth} - ${this.endOfMonth})`;

    this.dpConfigtrans.containerClass = 'theme-dark-blue';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass = 'today-highlight';

    this.configSelect = {
      placeholder: 'Pilih satu',
      dateInputFormat: 'DD/MM/YYYY',
      searchPlaceholder: 'Cari...',
      limitTo: this.listParams['Gudang']?.length,
      displayKey: 'description',
      search: true,
      height: '200px',
      customComparator: () => { },
      moreText: 'lebih banyak',
      noResultsFound: 'Tidak ada hasil',
      searchOnKey: 'description',
    };
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

    const menu = localStorage.getItem('inv_last_menu_sync_data') ?? '';
    if (menu) {
      this.onClickMenu(menu);
    }
    this.selectedParam['paginationHistoryTerimaData'] = 1;
    this.selectedParam['paginationHistoryKirimData'] = 1;

    const today = new Date();

    const min = new Date(today);
    this.startTglKirim.setDate(min.getDate() - 7);

    const max = new Date(today);
    this.endTglKirim.setDate(max.getDate() + 7);
  }

  ngOnDestroy(): void { }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void { }

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  onCategoryClick(category: any) {
    this.g.selectedReportCategory = category;
  }

  onClickMenu(menu: string) {
    this.selectedMenu = menu;
    localStorage.setItem('inv_last_menu_sync_data', menu);
    if (this.selectedMenu == 'Cek Hasil Kirim Data Ke HQ') {
      this.getListParam('Gudang');
    }
    if (this.selectedMenu == 'Cek Data Pengiriman (D.O)') {
      // this.router.navigate(['/sync-data/cek-data-pengiriman']);
    }
  }

  goToCekDataPengiriman() {
    const data = {
      startDate: this.startTglKirim,
      endDate: this.endTglKirim
    }
    this.g.saveLocalstorage(
            'dataCekPengiriman',
            JSON.stringify(data)
          );
    localStorage.setItem('inv_last_menu_sync_data', 'Cek Data Pengiriman (D.O)');
    this.selectedMenu = 'Cek Data Pengiriman (D.O)';
    this.router.navigate(['/sync-data/cek-data-pengiriman']);
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
    this.loadings['processBackupDb'] = true;
    this.messages['processBackupDb'] = '';
    Swal.fire({
      ...this.g.componentKonfirmasiSimpan,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup',
      },
      allowOutsideClick: false,
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');
        submitBtn?.addEventListener('click', () => {
          Swal.close();
          this.service
            .insert('/api/backup-database/process', {
              process: true,
              kodeGudang: this.userData?.defaultLocation?.kodeLocation,
            })
            .subscribe({
              next: (res) => {
                if (res.error) {
                  this.messages['processBackupDb'] = res.error;
                } else {
                  this.toastr.success('Backup database berhasil dilakukan');
                  this.getListBackup();
                }
                this.loadings['processBackupDb'] = false;
              },
              error: (err) => {
                console.log('err: ' + err);
                this.loadings['processBackupDb'] = false;
              },
            });
        });
        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.loadings['processBackupDb'] = false;
        });
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

  onTglPengirimanChange(value: Date): void {
    if (value) {
      this.startOfMonth = moment(value).startOf('month').format('DD MMMM YYYY');
      this.endOfMonth = moment(value).endOf('month').format('DD MMMM YYYY');

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
      firstDate: this.startOfMonth,
      lastDate: moment(this.paramTglTransaksi).format('DD MMM YYYY'),
      yearEom: previousMonth.format('YYYY'),
      monthEom: previousMonth.format('MM'),
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

  getListBackup() {
    this.loadings['getListBackup'] = true;
    this.clicked['getListBackup'] = true;
    this.service
      .insert('/api/backup-database/process', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getListBackup'] = res.error;
          } else {
            this.listBackupDb = res.item ?? [];
          }
          this.loadings['getListBackup'] = false;
        },
        error: (err) => {
          console.log('err: ' + err);
          this.loadings['getListBackup'] = false;
        },
      });
  }

  deleteBackup(data: any) {
    this.loadings['deleteBackup'] = true;
    Swal.fire({
      ...this.g.componentKonfirmasiSimpan,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup',
      },
      allowOutsideClick: false,
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');
        submitBtn?.addEventListener('click', () => {
          Swal.close();
          this.service
            .insert('/api/backup-database/process', {
              kodeGudang: this.userData?.defaultLocation?.kodeLocation,
              delete: data.fileName,
              download: false,
            })
            .subscribe({
              next: (res) => {
                if (res.error) {
                  this.messages['deleteBackup'] = res.error;
                  this.service.handleErrorResponse(res);
                } else {
                  this.toastr.success('Hapus backup berhasil dilakukan');
                }
                this.loadings['deleteBackup'] = false;
                this.getListBackup();
              },
              error: (err) => {
                console.log('err: ' + err);
                this.loadings['deleteBackup'] = false;
              },
            });
        });
        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.loadings['processBackupDb'] = false;
        });
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

  downloadBackup(data: any) {
    const url =
      this.service.getBaseUrl() +
      '/api/backup-database/download/' +
      data.fileName;
    window.open(url, '_blank');
  }

  getListParam(type: string, report: string = '') {
    this.loadingState[type] = true;
    this.service
      .insert('/api/report/list-report-param', {
        type: 'list' + type,
        report: report,
      })
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];
          // const allVal = {
          //   code: '',
          //   description: 'Semua',
          // };
          this.listParams[type] = [...data];
          for (let i = 0; i < this.listParams[type]?.length; i++) {
            const item = this.listParams[type][i];
            const kodeGudang = this.userData?.defaultLocation?.kodeLocation;
            if (item.code === kodeGudang) {
              this.selectedParam[type] = item;
              break;
            }
          }
          this.loadingState[type] = false;
        },
        error: (error) => {
          console.log(error);
          this.loadingState[type] = false;
        },
      });
  }

  goToCheckGudangVsHQ() {
    this.router.navigate(['/sync-data/check-data-sent'], {
      queryParams: {
        selectedGudang: this.selectedParam['Gudang']['code'],
        selectedGudangName: this.selectedParam['Gudang']['name'],
        startDate: formatDate(this.rangeDateVal[0], 'dd MMM yyyy', 'en-US'),
        endDate: formatDate(this.rangeDateVal[1], 'dd MMM yyyy', 'en-US'),
      },
      skipLocationChange: true,
    });
  }

  getHistoryTerimaData() {
    this.loadings['getHistoryTerimaData'] = true;
    this.clicked['getHistoryTerimaData'] = true;
    const limit = 100;
    const offset = (this.selectedParam['paginationHistoryTerimaData'] - 1) * limit;
    this.service
      .insert('/api/sync-data/history-terima-data-master', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        offset: offset,
        limit: limit,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getHistoryTerimaData'] = res.error;
          } else {
            this.listHistoryTerimaData = res.data ?? [];
          }
          this.loadings['getHistoryTerimaData'] = false;
        },
        error: (err) => {
          console.log('err: ' + err);
          this.loadings['getHistoryTerimaData'] = false;
        },
      });
  }


  getHistoryKirimData() {
    this.loadings['getHistoryKirimData'] = true;
    this.clicked['getHistoryKirimData'] = true;
    const limit = 100;
    const offset = (this.selectedParam['paginationHistoryKirimData'] - 1) * limit;
    this.service
      .insert('/api/sync-data/history-kirim-data-ke-pusat', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        offset: offset,
        limit: limit,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getHistoryKirimData'] = res.error;
          } else {
            this.listHistoryKirimData = res.data ?? [];
          }
          this.loadings['getHistoryKirimData'] = false;
        },
        error: (err) => {
          console.log('err: ' + err);
          this.loadings['getHistoryKirimData'] = false;
        },
      });
  }
}
