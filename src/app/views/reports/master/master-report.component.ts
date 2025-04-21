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

@Component({
  selector: 'app-master-report',
  templateUrl: './master-report.component.html',
  styleUrl: './master-report.component.scss',
})
export class MasterReportComponent implements OnInit, OnDestroy, AfterViewInit {
  [key: string]: any;
  loadingState: { [key: string]: boolean } = {
    submit: false,
    selectedRegion: false,
    statusAktif: false,
    tipeListing: false,
    selectedRsc: false,
  };
  userData: any;
  currentReport: string = '';
  rangeDateVal = [new Date(), new Date()];
  downloadURL: any = [];

  configRegion: any;

  listRegion: any = [];

  selectedRegion: any;

  configRsc: any;
  listRsc: any = [];
  selectedRsc: any;

  paramStatusAktif: string = '';
  paramTipeListing: string = 'header';
  paramInisial: string;

  constructor(
    private service: AppService,
    private g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.paramInisial = this.service.getUserData().defaultLocation.kodeSingkat;
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
    this.configRsc = this.g.dropdownConfig('description');

    this.userData = this.service.getUserData();

    if (['Master Cabang'].includes(this.currentReport)) {
      this.getListParam('listRegion');
    } else if (
      ['Master Department', 'Master Gudang'].includes(this.currentReport)
    ) {
      this.getListParam('listRsc');
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
    if (type == 'listRegion') {
      this.loadingState['selectedRegion'] = true;
    } else if (type == 'listRsc') {
      this.loadingState['selectedRsc'] = true;
    }

    this.service
      .insert('/api/report/list-report-param', { type: type, report: report })
      .subscribe({
        next: (res) => {
          const data = res.data ?? [];
          const allVal = {
            code: '',
            description: 'Semua',
          };
          if (type == 'listRegion') {
            this.listRegion = [allVal, ...data];
            this.selectedRegion = allVal;
            this.loadingState['selectedRegion'] = false;
          } else if (type == 'listRsc') {
            this.listRsc = [allVal, ...data];
            this.selectedRsc = allVal;
            this.loadingState['selectedRsc'] = false;
          }
        },
        error: (error) => {
          console.log(error);
          this.loadingState['selectedRegion'] = false;
          this.loadingState['selectedRsc'] = false;
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
    if (
      this.currentReport === 'Master Cabang' &&
      !this.selectedRegion['description']
    ) {
      this.g.alertWarning('Gagal!', 'Silahkan pilih Kode Region');
    }

    this.loadingState['submit'] = true;

    let param = {};
    if (this.currentReport === 'Master Cabang') {
      param = {
        kodeGudang: '00072',
        kodeRegion: this.selectedRegion['code'],
        status: this.paramStatusAktif,
        tipeListing: this.paramTipeListing,
      };
    } else if (
      ['Master Department', 'Master Gudang'].includes(this.currentReport)
    ) {
      param = {
        kodeRsc: this.selectedRsc['code'],
        status: this.paramStatusAktif,
        tipeListing: this.paramTipeListing,
      };
    } else if (['Master Supplier'].includes(this.currentReport)) {
      param = {
        statusAktif: this.paramStatusAktif,
        tipeListing: this.paramTipeListing,
      };
    } else if (
      [
        'Master Barang',
        'Master Barang Bekas',
        'Master Barang Produksi',
      ].includes(this.currentReport)
    ) {
      param = {
        statusAktif: this.paramStatusAktif,
      };
    }

    param = {
      ...param,
      userData: this.userData,
      isDownloadCsv: type === 'csv',
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
      link.download = `${reportType} Report ${this.datePipe.transform(
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
      link.download = `${reportType} Report ${this.datePipe.transform(
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
