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
import moment from 'moment';
import { first, last } from 'rxjs';
import { DEFAULT_DATE_RANGE_RECEIVING_ORDER } from '../../../../constants';
import { Subject, takeUntil } from 'rxjs';
import { Page } from '../../../model/page';

@Component({
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrl: './stock-report.component.scss',
})
export class StockReportComponent implements OnInit, OnDestroy, AfterViewInit {
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
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  paramStatusAktif: string = '';
  paramJenisGudang: string = 'DRY';
  paramTipeListing: string = 'rekap';
  paramPilihanCetak: string = 'mutasi';
  paramHasilLaporanCetak: string = 'detail';
  dateRangeString: string;
  startOfMonth: any;
  endOfMonth: any;
  paramTglTransaksi: any = new Date();
  paramStatusExpired: string = 'Tidak';
  isShowModalBarang: boolean = false;
  kodeBarang: string = '';
  namaBarang: string = '';
  paramStockNumberHari: number = 30;
  tglExpiredSisaBarang: any;
  konversi: number = 1;
  satuanBesar: string = '';
  satuanKecil: string = '';
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  dtOptions: any = {};
  selectedRowData: any;
  page = new Page();

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];

  constructor(
    private service: AppService,
    public g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    
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

    const today = moment().format('DD MMMM YYYY');
    this.startOfMonth = moment().startOf('month').format('DD MMMM YYYY');
    this.endOfMonth = moment().endOf('month').format('DD MMMM YYYY');

    if (['Stock Barang By Expired', 'Inventory Movement'].includes(this.currentReport)) {
      this.endOfMonth = today;
    }

    this.dateRangeString = `(Periode :${this.startOfMonth} - ${this.endOfMonth})`;

    this.dpConfigtrans.containerClass = 'theme-dark-blue';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    // this.dpConfigtrans.minDate = moment().startOf('month').toDate();
    this.dpConfigtrans.customTodayClass = 'today-highlight';

    if (['Master Cabang'].includes(this.currentReport)) {
      this.getListParam('listRegion');
    }
    if (
      ['Transaksi Detail Barang Expired', 'Stock Card'].includes(
        this.currentReport
      )
    ) {
      this.renderDataTables();
    }
    if (
      ['Stock Yang Mendekati Tgl Expired', 'Stock Card', 'Stock Barang By Expired', 'Inventory Movement'].includes(
        this.currentReport
      )
    ) {
      this.onBlurStockExpired()
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit(): void { }

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

  async doSubmit(type: string) {
    if (
      this.currentReport === 'Master Cabang' &&
      !this.selectedRegion['description']
    ) {
      this.g.alertWarning('Gagal!', 'Silahkan pilih Kode Region');
    }

    this.loadingState['submit'] = true;

    let param = {};
    if (
      [
        'Stock Barang',
        'Stock Barang Dibawah Minimum',
        'Stock Barang Diatas Maximum',
      ].includes(this.currentReport)
    ) {
      const previousMonth = moment(this.paramTglTransaksi).subtract(1, 'month');

      param = {
        kodeGudang: this.g.getUserLocationCode(),
        kodeSingkat: this.g.getUserKodeSingkat(),
        status: this.paramStatusAktif,
        tipePilihanCetak: this.paramPilihanCetak,
        tipeListing: this.paramTipeListing,
        firstDate: this.startOfMonth,
        lastDate: moment(this.paramTglTransaksi).format('DD MMM YYYY'),
        yearEom: previousMonth.format('YYYY'),
        monthEom: moment().format('MM'),
      };
    } else if (this.currentReport === 'Transaksi Detail Barang Expired') {
      param = {
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        kodeBarang: this.kodeBarang,
      };
    } else if (this.currentReport === 'Stock Barang By Expired') {
      param = {
        startDate: this.startOfMonth,
        endDate: this.endOfMonth,
        kodeBarang: this.kodeBarang,
        tahunSaldo: moment(this.paramTglTransaksi).format('YYYY'),
        bulanSaldo: moment(this.paramTglTransaksi).format('M'),
      };
    }
    else if (this.currentReport === 'Stock Yang Mendekati Tgl Expired') {
      param = {
        tglAwal: this.startOfMonth,
        endDate: this.endOfMonth,
        kodeGudang: this.g.getUserLocationCode(),
        tahunSaldo: moment(this.paramTglTransaksi).format('YYYY'),
        bulanSaldo: moment(this.paramTglTransaksi).format('M'),
      };
    } else if (this.currentReport === 'Inventory Movement') {
      param = {
        startDate: this.startOfMonth,
        endDate: this.endOfMonth,
        kodeBarang: this.kodeBarang,
        tahunSaldo: moment(this.paramTglTransaksi).format('YYYY'),
        bulanSaldo: moment(this.paramTglTransaksi).format('M'),
        tipeListing: this.paramTipeListing,
        tipePilihanCetak: this.paramPilihanCetak,
        defaultGudang: this.g.getUserKodeSingkat()
      };
      console.log('param :', param)
    } else if (this.currentReport === 'Stock Card') {
      if (!this.kodeBarang || this.kodeBarang === '') {
        this.toastr.error('Silahkan Pilih Kode Barang Terlebih Dahulu!');
        this.loadingState['submit'] = false;
        return;
      }

      let cekKode = await this.getProductRow(this.kodeBarang);
      if (!cekKode) {
        this.loadingState['submit'] = false;
        return;
      }
      const previousMonth = moment(this.paramTglTransaksi).subtract(1, 'month');
      const firstDateOpname = previousMonth
        .clone()
        .startOf('month')
        .format('DD MMM YYYY');
      const lastDateOpname = previousMonth
        .clone()
        .endOf('month')
        .format('DD MMM YYYY');
      param = {
        kodeGudang: this.g.getUserLocationCode(),
        status: this.paramStatusAktif,
        tipePilihanCetak: this.paramPilihanCetak,
        tipeHasilLaporanCetak: this.paramHasilLaporanCetak,
        firstDate: this.startOfMonth,
        lastDate: moment(this.paramTglTransaksi).format('DD MMM YYYY'),
        yearEom: moment(this.paramTglTransaksi).format('YYYY'), // tanpa dikurangi
        monthEom: moment(this.paramTglTransaksi).format('M'),
        isShowExpired: this.paramStatusExpired,
        firstDateOpname: firstDateOpname,
        lastDateOpname: lastDateOpname,
        kodebarang: this.kodeBarang,
        namaBarang: this.namaBarang,
        konversi: this.konversi.toFixed(2),
        satuanBesar: this.satuanBesar,
        satuanKecil: this.satuanKecil,
      };
    } else if (this.currentReport === 'Stock JATIM-INDOTIM') {
      const previousMonth = moment(this.paramTglTransaksi).subtract(1, 'month');

      param = {
        kodeGudang1: this.prmKodeGudang.JATIM,
        kodeGudang2: this.prmKodeGudang.INDOTIM,
        kodeSingkat:this.paramJenisGudang,
        kodeSingkat2:this.g.getUserKodeSingkat(),
        tipePilihanCetak: this.paramPilihanCetak,
        firstDate: this.startOfMonth,
        lastDate: moment(this.paramTglTransaksi).format('DD MMM YYYY'),
        yearEom: previousMonth.format('YYYY'),
        monthEom: previousMonth.format('MM'),
      };
    }

    param = {
      ...param,
      userData: this.userData,
      isDownloadCsv: type === 'csv' || type === 'xlsx',
      isDownloadXlsx: type === 'xlsx',
      reportName: this.currentReport,
      reportSlug: this.g.formatUrlSafeString(this.currentReport),
      kodeGudang: this.userData.defaultLocation.kodeLocation,
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
    var blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
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

  onShowModalBarang() {
    this.isShowModalBarang = true;
  }

  handleEnter(event: any) {
    event.preventDefault();

    let kodeBarang = this.kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang);
    }
  }

  getProductRow(kodeBarang: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (kodeBarang !== '') {
        this.service
          .getProductResep(kodeBarang)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.namaBarang = res.namaBarang;
                this.konversi = res.konversi || 1;
                this.satuanBesar = res.satuanBesar;
                this.satuanKecil = res.satuanKecil;
                resolve(true);
              } else {
                resolve(false);
              }
            },
            error: (err: any) => {
              this.toastr.error(
                'KODE BARANG TIDAK ADA DI DATABASE, HARAP PERIKSA KEMBALI!',
                'Error'
              );
              resolve(false);
            },
          });
      } else {
        resolve(false);
      }
    });
  }


  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        // Provide page size options
        [5, 10], // Available page sizes
        ['5', '10'], // Displayed page size labels
      ],
      order: [
        [7, 'asc'],
        [1, 'asc'],
      ],
      drawCallback: (drawCallback: any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
        };
        this.service
          .getBahanBakuList(params)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode' },
        { data: 'namaBarang', title: 'Nama Barang' },
        {
          data: 'konversi',
          title: 'Konversi',
          render: function (data: any, type: any, row: any) {
            return Number(data).toFixed(2); // Ensures two decimal places
          },
        },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        {
          data: 'status',
          title: 'Status',
          searchable: false,
          render: (data: any) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          orderable: false,
          render: (data: any, type: any, row: any) => {
            const disabled = row.status !== 'Aktif' ? 'disabled' : '';
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white" ${disabled}>Pilih</button>`;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.onPilihBarang(data));

        $('td', row).on('click', () => {
          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
          if (this.selectedRowData !== data) {
            this.selectedRowData = data;
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
          } else {
            this.selectedRowData = undefined;
          }
        });

        return row;
      },
    };
  }

  onPilihBarang(data: any) {
    let errorMessage;
    this.isShowModalBarang = false;
    this.kodeBarang = data.kodeBarang;
    this.namaBarang = data.namaBarang;
    this.konversi = data.konversi;
    this.satuanBesar = data.satuanBesar;
    this.satuanKecil = data.satuanKecil;
  }

  onTglTransaksiChange(value: Date): void {
    if (value) {
      this.startOfMonth = moment(value).startOf('month').format('DD MMMM YYYY');

      // Perbedaan di sini: jika currentReport = 'Stock Barang By Expired', ambil tanggal hari ini
      if (this.currentReport === 'Stock Barang By Expired' || this.currentReport === 'Inventory Movement') {
        this.endOfMonth = moment(value).format('DD MMMM YYYY'); // tanggal berjalan
      } else {
        this.endOfMonth = moment(value).endOf('month').format('DD MMMM YYYY'); // default: akhir bulan
      }

      console.log('Start:', this.startOfMonth, 'End:', this.endOfMonth);

      this.dateRangeString = `(Periode :${this.startOfMonth} - ${this.endOfMonth})`;
    }
  }


  deleteBarang() {
    this.kodeBarang = '';
    this.namaBarang = '';
    this.konversi = 1;
    this.satuanBesar = '';
    this.satuanKecil = '';
  }

  onBlurStockExpired() {
    if (this.paramStockNumberHari) {
      const today = new Date();
      today.setDate(today.getDate() + Number(this.paramStockNumberHari));

      // Format: 12 June 2025
      this.tglExpiredSisaBarang = moment(today).format('DD MMMM YYYY');
    }
  }

  get prmKodeGudang() {
    const jenis = this.paramJenisGudang;
    return {
      JATIM: jenis === 'DRY' ? '01099' :
        jenis === 'COM' ? '01098' :
          jenis === 'PRD' ? '01097' : '',
      INDOTIM: jenis === 'DRY' ? '02999' :
        jenis === 'COM' ? '02998' :
          jenis === 'PRD' ? '' : ''
    };
  }


}
