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
import { Subject, takeUntil } from 'rxjs';
import moment from 'moment';
import { Page } from '../../../model/page';
import {
  BUTTON_CAPTION_SELECT,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  REPORT_ANALYSIS_DO_REVISI,
  REPORT_DEFAULT_SUPPLIER_NAME_NULL,
  REPORT_PEMBELIAN_BY_SUPPLIER,
} from '../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataService } from '../../../service/data.service';

@Component({
  selector: 'app-analysis-report',
  templateUrl: './analysis-report.component.html',
  styleUrl: './analysis-report.component.scss',
})
export class AnalysisReportComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
  paramTipeListing: string = 'rekap';
  kodePenerima: string = '';
  selectedSupplierName: string = REPORT_DEFAULT_SUPPLIER_NAME_NULL;
  selectedSupplierCode: string = '';
  namaPenerima: string = 'KOSONG = CETAK SEMUA PENERIMA';
  isShowModalPenerima: boolean = false;
  supplierModalVisibility: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  today: Date = new Date();
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  dtOptions: any = {};
  dtOptionsProduct: any = {};
  dtOptionsProduct2: any = {};
  selectedRowData: any;
  page = new Page();
  buttonCaptionSelect: string = BUTTON_CAPTION_SELECT;
  periode1Filter: [any, any];
  periode2Filter: [any, any];
  periode3Filter: [any, any];
  kodeTransaksi: string = '';
  namaTransaksi: string = 'WAJIB PILIH TRANSAKSI';
  isShowModalTransaksi: boolean = false;
  REPORT_ANALYSIS_DO_REVISI: string = REPORT_ANALYSIS_DO_REVISI;
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  paramTglTransaksi: any = new Date();
  REPORT_PEMBELIAN_BY_SUPPLIER: string = REPORT_PEMBELIAN_BY_SUPPLIER;
  kodeBarang: string = '';
  namaBarang: string = '';
  konversi: number = 1;
  satuanBesar: string = '';
  satuanKecil: string = '';
  isShowModalBarang: boolean = false;
  isShowModalBarang2: boolean = false;
  kodeBarang2: string = '';
  namaBarang2: string = '';

  constructor(
    private service: AppService,
    private g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private dataService: DataService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';

    this.dpConfigtrans.containerClass = 'theme-dark-blue';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass = 'today-highlight';
  }

  ngOnInit(): void {
    console.log('currentDate: ', this.currentDate);
    console.log('new Date: ', new Date());
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

    if (['Mutasi Stock Harian'].includes(this.currentReport)) {
      this.renderDataTablesProduct();
      this.renderDataTablesProduct2();
    }

    if (
      [
        'Pengirim By Tujuan',
        'Penerimaan By Pengirim',
        'Mutasi Stock Harian',
      ].includes(this.currentReport)
    ) {
      this.renderDataTablesBranch();
    } else if (
      ['Rekap Transaksi 3 Periode (By Type)'].includes(this.currentReport)
    ) {
      this.renderDataTablesSetupTransaksi();
    } else if (['Pembelian By Supplier'].includes(this.currentReport)) {
      console.log('Pembelian by supplier');
      this.renderDataTablesSupplier();
    }

    const now = moment();
    // Periode 1: 2 months before (start to end of that month)
    this.periode1Filter = [
      moment(now).subtract(2, 'months').startOf('month').toDate(),
      moment(now).subtract(2, 'months').endOf('month').toDate(),
    ];
    // Periode 2: 1 month before (start to end of that month)
    this.periode2Filter = [
      moment(now).subtract(1, 'months').startOf('month').toDate(),
      moment(now).subtract(1, 'months').endOf('month').toDate(),
    ];
    // Periode 3: current month (start to end)
    this.periode3Filter = [
      moment(now).startOf('month').toDate(),
      moment(now).endOf('month').toDate(),
    ];

    

    if (REPORT_ANALYSIS_DO_REVISI.includes(this.currentReport)) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.dateRangeFilter = [startDate, endDate];
    } else if (['Persiapan Pengiriman Barang'].includes(this.currentReport)) {
      const startDate = new Date(); // Hari ini

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Tambah 7 hari dari hari ini

      this.dateRangeFilter = [startDate, endDate];
    } else if (['Mutasi Stock Harian'].includes(this.currentReport)) {
      this.dpConfig.maxDate = new Date();
      const startOfMonth = moment().startOf('month').toDate();
      const today = new Date();
      this.dateRangeFilter = [startOfMonth, today];
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

  onShowModalBarang() {
    this.isShowModalBarang = true;
  }

  onShowModalBarang2() {
    this.isShowModalBarang2 = true;
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
    } else if (this.currentReport === 'Master Department') {
      param = {
        kodeRegion: this.selectedRegion['code'],
        status: this.paramStatusAktif,
        tipeListing: this.paramTipeListing,
      };
    } else if (this.currentReport === 'Persiapan Pengiriman Barang') {
      const startDate = new Date(this.dateRangeFilter[0]);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // set jam ke 00:00 untuk dibandingkan hanya tanggal

      if (startDate < today) {
        this.toastr.error('TANGGAL TIDAK BOLEH LEBIH KECIL DARI TANGGAL HARI INI');
        this.loadingState['submit'] = false;
        return;
      }
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
      };
    } else if (this.currentReport === 'Mutasi Stock Harian') {
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        startDate: this.g.transformDate(this.dateRangeFilter[0]),
        endDate: this.g.transformDate(this.dateRangeFilter[1]),
        tahunSaldo: moment(this.dateRangeFilter[0]).format('YYYY'),
        bulanSaldo: moment(this.dateRangeFilter[0]).format('M'),
        kodeBarang1: this.kodeBarang,
        kodeBarang2: this.kodeBarang2,
      };
    } else if (
      ['Rekap Transaksi 3 Periode (By Type)'].includes(this.currentReport)
    ) {
      if (!this.kodeTransaksi) {
        this.toastr.error('Pilih tipe transaksi terlebih dahulu!');
        this.loadingState['submit'] = false;
        return;
      }

      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeTransaksi: this.kodeTransaksi,
        namaTransaksi: this.namaTransaksi,
        firstDateP1: this.g.transformDate(this.periode1Filter[0]),
        endDateP1: this.g.transformDate(this.periode1Filter[1]),
        firstDateP2: this.g.transformDate(this.periode2Filter[0]),
        endDateP2: this.g.transformDate(this.periode2Filter[1]),
        firstDateP3: this.g.transformDate(this.periode3Filter[0]),
        endDateP3: this.g.transformDate(this.periode3Filter[1]),
      };
    } else if (this.currentReport === 'DO Yang Belum Balik') {
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        tipeListing: this.paramTipeListing,
        startDate: '01 Jan 2010',
        endDate: this.g.transformDate(this.paramTglTransaksi),
      };
    } else if (this.currentReport === 'Jumlah Transaksi') {
      const tglTransaksi = new Date(this.paramTglTransaksi);
      const startOfMonth = new Date(
        tglTransaksi.getFullYear(),
        tglTransaksi.getMonth(),
        1
      );
      const startOfMonthString = startOfMonth.toISOString();
      param = {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        startDate: this.g.transformDate(startOfMonthString),
        endDate: this.g.transformDate(this.paramTglTransaksi),
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
        this.dateRangeFilter[0],
        'dd-MMM-yyyy'
      )} s.d. ${this.datePipe.transform(
        this.dateRangeFilter[1],
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

  onShowModalPenerima() {
    this.isShowModalPenerima = true;
  }

  onShowModalTransaksi() {
    this.isShowModalTransaksi = true;
  }

  handleEnter(event: any) {
    event.preventDefault();

    let kodePenerima = this.kodePenerima?.trim();
    if (kodePenerima !== '') {
      this.getPenerimaRow(kodePenerima);
    }
  }

  handleEnterBarang(event: any) {
    event.preventDefault();

    let kodeBarang = this.kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang);
    }
  }

  handleEnterBarang2(event: any) {
    event.preventDefault();

    let kodeBarang2 = this.kodeBarang2?.trim();
    if (kodeBarang2 !== '') {
      this.getProductRow2(kodeBarang2);
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
                this.kodeBarang2 = res.kodeBarang;
                this.namaBarang2 = res.namaBarang;
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

  getProductRow2(kodeBarang2: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (kodeBarang2 !== '') {
        this.service
          .getProductResep(kodeBarang2)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res: any) => {
              if (res) {
                this.namaBarang2 = res.namaBarang;
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

  getPenerimaRow(kodePenerima: string) {
    if (kodePenerima !== '') {
      this.service
        .getProductResep(kodePenerima)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.namaPenerima = res.namaPenerima;
            }
          },
          error: (err: any) => {
            // Handle error case and show error toast
            this.toastr.error('Kode barang tidak ditemukan!');
          },
        });
    }
  }

  renderDataTablesProduct(): void {
    this.dtOptionsProduct = {
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
    this.kodeBarang2 = data.kodeBarang;
    this.namaBarang2 = data.namaBarang;
    this.konversi = data.konversi;
    this.satuanBesar = data.satuanBesar;
    this.satuanKecil = data.satuanKecil;
  }

  renderDataTablesProduct2(): void {
    this.dtOptionsProduct2 = {
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
        $('.action-select', row).on('click', () => this.onPilihBarang2(data));

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

  onPilihBarang2(data: any) {
    let errorMessage;
    this.isShowModalBarang2 = false;
    this.kodeBarang2 = data.kodeBarang;
    this.namaBarang2 = data.namaBarang;
    this.konversi = data.konversi;
    this.satuanBesar = data.satuanBesar;
    this.satuanKecil = data.satuanKecil;
  }

  deleteBarang() {
    this.kodeBarang = '';
    this.namaBarang = '';
    this.konversi = 1;
    this.satuanBesar = '';
    this.satuanKecil = '';
  }

  deleteBarang2() {
    this.kodeBarang2 = '';
    this.namaBarang2 = '';
    this.konversi = 1;
    this.satuanBesar = '';
    this.satuanKecil = '';
  }

  renderDataTablesBranch(): void {
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
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
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
        this.service.getBranchList(params).subscribe((resp: any) => {
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'kodeCabang', title: 'Kode', searchable: true },
        // { data: 'kodeSingkat', title: 'Inisial', searchable: true },
        // { data: 'tipeCabang', title: 'Tipe', searchable: true },
        { data: 'namaCabang', title: 'Nama Site', searchable: true },
        { data: 'deskripsiGroup', title: 'Group', searchable: true },
        {
          data: 'alamat1', // or data: 'alamat' if needed, but `null` works fine when using render
          title: 'Alamat',
          searchable: false,
          width: '200px',
          render: function (data: any, type: any, row: any) {
            return `${row.alamat1 || ''}, ${row.alamat2 || ''}`.trim();
          },
        },
        { data: 'kota', title: 'Kota', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data: any) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: (data: any, _: any, row: any) => {
            if (row.statusAktif === 'A') {
              return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white">${this.buttonCaptionSelect}</button>
                </div>
              `;
            }
            return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white" disabled>${this.buttonCaptionSelect}</button>
                </div>
              `;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.actionBtnClick(data));
        if (index === 0 && !this.selectedRowData) {
          setTimeout(() => {
            $(row).trigger('td');
          }, 0);
        }
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

  actionBtnClick(data: any) {
    switch (this.currentReport) {
      case REPORT_PEMBELIAN_BY_SUPPLIER: {
        this.selectedSupplierCode = data.kodeSupplier;
        this.selectedSupplierName = data.namaSupplier;
        this.supplierModalVisibility = !this.supplierModalVisibility;
        break;
      }
      default: {
        let errorMessage;
        this.isShowModalPenerima = false;
        this.kodePenerima = data.kodeCabang;
        this.namaPenerima = data.namaCabang;
        break;
      }
    }
  }

  actionBtnClickSetupTransaksi(data: any) {
    console.log('actionBtnClick', data);
    let errorMessage;
    this.isShowModalTransaksi = false;
    this.kodeTransaksi = data.keyTransaksi;
    this.namaTransaksi = data.keterangan;
  }

  deletePenerima() {
    this.kodePenerima = '';
    this.namaPenerima = 'KOSONG = CETAK SEMUA PENERIMA';
  }

  deleteTransaksi() {
    this.kodeTransaksi = '';
    this.namaTransaksi = 'WAJIB PILIH TRANSAKSI';
  }

  exportExcel() {
    this.loadingState['submit'] = true;
    let apiUrl = '';
    let param = {};

    switch (this.currentReport) {
      case 'Pengirim By Tujuan': {
        param = {
          kodeGudang: this.userData.defaultLocation.kodeLocation,
          namaGudang: this.g.getUserLocationNama(),
          kodeTujuan: this.kodePenerima,
          startDate: this.g.transformDate(this.dateRangeFilter[0]),
          endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };

        apiUrl = '/api/report/analysis/pengirim-by-tujuan';
        break;
      }

      case 'Penerimaan By Pengirim': {
        param = {
          kodeGudang: this.userData.defaultLocation.kodeLocation,
          namaGudang: this.g.getUserLocationNama(),
          kodePengirim: this.kodePenerima,
          startDate: this.g.transformDate(this.dateRangeFilter[0]),
          endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };

        apiUrl = '/api/report/analysis/penerimaan-by-pengirim';
        break;
      }

      case REPORT_ANALYSIS_DO_REVISI: {
        param = {
          kodeGudang: this.userData.defaultLocation.kodeLocation,
          startDate: this.g.transformDate(this.dateRangeFilter[0]),
          endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        apiUrl = '/api/report/analysis/do-revisi';
        break;
      }

      case REPORT_PEMBELIAN_BY_SUPPLIER: {
        param = {
          kodeSupplier: this.selectedSupplierCode,
          kodeGudang: this.userData.defaultLocation.kodeLocation,
          startDate: this.g.transformDate(this.rangeDateVal[0].toString()),
          endDate: this.g.transformDate(this.rangeDateVal[1].toString()),
        };
        apiUrl = '/api/report/analysis/pembelian-by-supplier';
        break;
      }

      default:
        break;
    }

    param = {
      ...param,
      userData: this.userData,
      reportName: this.currentReport,
      reportSlug: this.g.formatUrlSafeString(this.currentReport),
    };

    this.service.getFile(apiUrl, param).subscribe({
      next: (res) => {
        this.loadingState['submit'] = false;
        return this.downloadCsv(res, '');
      },
      error: (error) => {
        this.loadingState['submit'] = false;
      },
    });
  }

  renderDataTablesSetupTransaksi(): void {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 8,
      lengthMenu: [
        // Provide page size options
        [8, 20], // Available page sizes
        ['8', '20'], // Displayed page size labels
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
        this.service.listSetupTransaksiDt(params).subscribe((resp: any) => {
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
        { data: 'keyTransaksi', title: 'Kode', searchable: true },
        // { data: 'kodeSingkat', title: 'Inisial', searchable: true },
        // { data: 'tipeCabang', title: 'Tipe', searchable: true },
        { data: 'kodeTransaksi', title: 'Inisial', searchable: true },
        { data: 'keterangan', title: 'Keterangan', searchable: true },
        {
          title: 'Action',
          render: (data: any, _: any, row: any) => {
            return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white">${this.buttonCaptionSelect}</button>
                </div>
              `;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClickSetupTransaksi(data)
        );
        if (index === 0 && !this.selectedRowData) {
          setTimeout(() => {
            $(row).trigger('td');
          }, 0);
        }
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

  onRemoveSupplierPressed() {
    this.selectedSupplierCode = '';
    this.selectedSupplierName = REPORT_DEFAULT_SUPPLIER_NAME_NULL;
  }

  onSupplierModalPressed() {
    this.supplierModalVisibility = !this.supplierModalVisibility;
  }

  renderDataTablesSupplier(): void {
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
      lengthMenu: [5, 10, 25],
      drawCallback: (drawCallback: any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          status: '',
        };
        this.dataService
          .postData(`${this.g.urlServer}/api/supplier/dt`, params)
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'kodeSupplier', title: 'Kode', searchable: true },
        { data: 'namaSupplier', title: 'Nama Supplier', searchable: true },
        { data: 'alamat', title: 'Alamat', searchable: true },
        { data: 'kota', title: 'Kota', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data: any) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: (data: any, _: any, row: any) => {
            if (row.statusAktif === 'A') {
              return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white">${this.buttonCaptionSelect}</button>
                </div>
              `;
            }
            return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-select btn-info btn-60 text-white" disabled>${this.buttonCaptionSelect}</button>
                </div>
              `;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.actionBtnClick(data));
        if (index === 0 && !this.selectedRowData) {
          setTimeout(() => {
            $(row).trigger('td');
          }, 0);
        }
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
}
