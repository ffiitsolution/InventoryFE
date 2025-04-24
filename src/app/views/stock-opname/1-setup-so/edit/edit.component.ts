import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import {
  ACTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
  LS_INV_SELECTED_SO,
} from '../../../../../constants';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-so',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [DatePipe],
})
export class StockSoEditComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRow: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  selectedRowData: any;
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  buttonCaptionPrint: String = 'Cetak';
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;

  selectedSo: any = JSON.parse(
    localStorage.getItem(LS_INV_SELECTED_SO) ?? '{}'
  );

  public loading: boolean = false;
  adding: boolean = false;
  loadingSimpan: boolean = false;
  isValidQtyExpired: boolean = true;
  isShowModalExpired: boolean = false;
  selectedExpProduct: any = {};
  listEntryExpired: any[] = [];
  totalFilteredExpired: any = '0.0';
  userData: any;
  currentPage = 1;
  searchText: string = '';
  listPages: any[] = [];

  validationMessageListSatuanKecil: any[] = [];
  validationMessageListSatuanBesar: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  loadingUpdateQtyBesar: boolean[] = [];
  loadingUpdateQtyKecil: boolean[] = [];
  errorUpdateQtyBesar: boolean[] = [];
  errorUpdateQtyKecil: boolean[] = [];

  listDetail: any[] = [];
  tempKodeBarang: string = '';
  @Output() onBatalPressed = new EventEmitter<string>();
  @Output() jumlahBahanbaku = new EventEmitter<number>();

  @ViewChild('formModal') formModal: any;
  // Form data object

  constructor(
    private router: Router,
    public helper: HelperService,
    public g: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private appService: AppService,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass = 'today-highlight';

    this.dpConfigtrans.containerClass = 'theme-red';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass = 'today-highlight';
  }

  myForm: FormGroup;

  ngOnInit(): void {
    this.userData = this.appService.getUserData();
    this.g.navbarVisibility = false;
    this.selectedSo = JSON.parse(this.selectedSo);
    if (!this.selectedSo?.nomorSo) {
      this.onBackPressed();
    }
    this.getStockDetail();

    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );

    const todayDate = new Date();
    this.defaultDate = this.helper.formatDate(todayDate);

    this.myForm = this.form.group({
      kodeBarang: ['', [Validators.required]],
      namaBarang: ['', [Validators.required]],
      satuanHasilProduksi: ['', [Validators.required]],
      tglTransaksi: [this.defaultDate, [Validators.required]],
      jumlahHasilProduksi: ['', [Validators.required, Validators.min(1)]],
      keterangan: [''],
      tglExp: [this.defaultDate, [Validators.required]],
      totalHasilProduksi: ['', [Validators.required, Validators.min(1)]],
      labelSatuanHasilProduksi: [''],
      totalBahanBaku: [0],
      hargaSatuan: [0],
      satuanKecil: [''],
      satuanBesar: [''],
    });

    this.myForm
      .get('jumlahHasilProduksi')
      ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.calculateTotalHasilProduksi();
      });

    this.myForm
      .get('satuanHasilProduksi')
      ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.calculateTotalHasilProduksi();
      });
  }

  getStockDetail() {
    this.appService
      .insert('/api/stock-opname/detail', {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        nomorSo: this.selectedSo?.nomorSo,
      })
      .subscribe({
        next: (res) => {
          this.listDetail = res.data ?? [];
          // this.listDataSubdetail.forEach((sub) => {
          //   this.totalSubdetailIn += sub.qtyIn;
          //   this.totalSubdetailOut += sub.qtyOut;
          // });
          if (this.listDetail.length > 0) {
            let pageCount = Math.ceil(this.listDetail.length / 10);
            this.listPages = this.g.generateNumberRange(1, pageCount);

            this.loadingUpdateQtyBesar = new Array(this.listDetail.length).fill(
              false
            );
            this.loadingUpdateQtyKecil = new Array(this.listDetail.length).fill(
              false
            );
          }
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
          this.loading = false;
        },
      });
  }

  reloadTable() {
    // setTimeout(() => {
    //   this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.ajax.reload();
    //   });
    // }, DEFAULT_DELAY_TABLE);
  }

  onAddDetail() {
    console.log('Before:', this.myForm.value.tglTransaksi); // Lihat apakah sudah 21 atau masih 20
    console.log('Raw Moment:', moment(this.myForm.value.tglTransaksi));
    console.log(
      'Formatted:',
      moment(this.myForm.value.tglTransaksi, 'YYYY-MM-DD').format('DD/MM/YYYY')
    );
    this.myForm.patchValue({
      tglTransaksi: moment(
        this.myForm.value.tglTransaksi,
        'DD/MM/YYYY',
        true
      ).format('DD/MM/YYYY'),
      tglExp: moment(this.myForm.value.tglExp, 'DD/MM/YYYY', true).format(
        'DD/MM/YYYY'
      ),
    });

    this.g.saveLocalstorage('selectedSo', JSON.stringify(this.myForm.value));

    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return true;
    // return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.g.removeLocalstorage('selectedSo');
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.g.navbarVisibility = true;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/stock-opname/setup-so']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = JSON.stringify(data);
    this.isShowModal = false;
    this.mapOrderData(data);
  }

  private mapOrderData(data: any): void {
    this.myForm.patchValue({
      kodeBarang: data.kodeBarang,
      namaBarang: data.namaBarang,
      satuanHasilProduksi: parseFloat(data.konversi).toFixed(2),
      labelSatuanHasilProduksi: data.satuanKecil + '/' + data.satuanBesar,
      hargaSatuan: 0,
      satuanKecil: data.satuanKecil,
      satuanBesar: data.satuanBesar,
    });
  }

  calculateTotalHasilProduksi(): void {
    const jumlahHasilProduksi = this.myForm.get('jumlahHasilProduksi')?.value;
    const satuanHasilProduksi = this.myForm.get('satuanHasilProduksi')?.value;

    if (jumlahHasilProduksi && satuanHasilProduksi) {
      const totalHasilProduksi = jumlahHasilProduksi * satuanHasilProduksi;
      this.myForm.patchValue({
        totalHasilProduksi: totalHasilProduksi,
      });
    }
  }

  addJumlahBahanBaku($event: any): void {
    this.myForm.patchValue({
      totalBahanBaku: $event,
    });
  }

  formatDate(date: string | Date): string {
    console.log(date, 'date');
    if (typeof date === 'string') {
      return date;
    } else {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    }
  }

  onShowModalPrint(data: any) {
    this.paramGenerateReport = {
      noTransaksi: data.nomorTransaksi,
      userEntry: data.userCreate,
      jamEntry: this.g.transformTime(data.timeCreate),
      tglEntry: this.g.transformDate(data.dateCreate),
      outletBrand: 'KFC',
      kodeGudang: this.g.getUserLocationCode(),
      isDownloadCsv: false,
      reportName: 'cetak_production',
      confirmSelection: 'Ya',
    };
    this.isShowModalReport = true;
    // this.onBackPressed();
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyPemakaian =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty =
          this.helper.sanitizedNumber(item.qtyPemakaianBesar) * item.konversi +
          this.helper.sanitizedNumber(item.qtyPemakaianKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });

    if (totalQtyExpired > totalQtyPemakaian) {
      this.toastr.error('Total Qty Expired harus sama dengan Qty Pemakaian');
    } else {
      this.isShowModalExpired = false;
    }
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyPemakaianBesar: '0.0',
      qtyPemakaianKecil: '0.0',
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
      totalQty: '0.0',
      kodeBarang: this.selectedExpProduct.bahanBaku,
      validationExpiredMessageList: 'Tanggal tidak boleh kosong!',
      validationQty: '',
    });
  }

  onModalDeleteRow(kodeBarang: string, index: number) {
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    if (realIndex !== -1) {
      this.listEntryExpired.splice(realIndex, 1);
    }

    this.updateTotalExpired();
  }

  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.bahanBaku
    );
  }

  updateTotalExpired() {
    this.totalFilteredExpired = this.filteredList.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyPemakaianBesar) * Number(data.konversi) +
            Number(data.qtyPemakaianKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
  }

  onInputQtyBesarExpired(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = numericValue.toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyPemakaianBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyPemakaianKecil) <=
            0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
    }

    this.updateTotalExpired();
  }

  onInputQtyKecilExpired(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = numericValue.toFixed(2);
    } else {
      value = '0.00';
    }

    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);
      if (realIndex !== -1) {
        let messageValidation = '';
        if (
          parseFloat(value) +
            parseFloat(this.listEntryExpired[realIndex].qtyPemakaianBesar) <=
          0
        ) {
          messageValidation = 'Quantity tidak boleh < 0';
        } else if (
          Math.round(value) >=
          Math.round(this.listEntryExpired[realIndex].konversi)
        ) {
          messageValidation = 'Quantity kecil tidak boleh >= konversi';
          value = '0.0';
        }

        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyPemakaianKecil: value,
          validationQtyKecil: messageValidation,
        };
      }
    }
    this.updateTotalExpired();
  }

  updateKeteranganTanggal(item: any, event: any, index: number) {
    const dateFormatRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (event == 'Invalid Date' && !dateFormatRegex.test(item.tglExpired)) {
      // Reset if invalid format
      console.log('zzz');
      item.tglExpired = null; // Reset model value
      item.validationExpiredMessageList = 'Invalid date format!';
    } else {
      // item.validationExpiredMessageList='';
      item.keteranganTanggal = moment(item.tglExpired)
        .locale('id')
        .format('D MMMM YYYY');
      this.validateDate(event, item.kodeBarang, index);
    }
  }

  validateDate(event: any, kodeBarang: string, index: number) {
    let inputDate: any = '';
    let source: string;
    let validationMessage = '';

    if (event?.target?.value) {
      inputDate = event.target.value;
      source = 'manual input';
    } else {
      inputDate = event;
      source = 'datepicker';
    }

    const expiredDate = moment(inputDate, 'DD/MM/YYYY').startOf('day').toDate();
    const today = moment().startOf('day').toDate();

    console.log('today', today);
    console.log('expiredDate', expiredDate);

    if (expiredDate < today) {
      validationMessage = `Tanggal kadaluarsa tidak boleh lebih < dari sekarang!`;
    }

    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );
    console.log('tgllist', filteredEntries);

    if (!inputDate) {
      validationMessage = 'Tanggal tidak boleh kosong!';
    } else {
      const expiredData = this.listEntryExpired.find(
        (exp) => exp.kodeBarang === kodeBarang
      );

      const isDuplicate = filteredEntries.some(
        (otherEntry, otherIndex) =>
          otherIndex !== index &&
          moment(otherEntry.tglExpired).format('YYYY-MM-DD') ===
            moment(expiredDate).format('YYYY-MM-DD')
      );

      if (isDuplicate) {
        validationMessage = 'Tanggal ini sudah ada dalam daftar!';
      }
    }

    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    if (realIndex !== -1) {
      this.listEntryExpired[realIndex] = {
        ...this.listEntryExpired[realIndex],
        tglExpired: expiredDate,
        validationExpiredMessageList: validationMessage,
      };

      console.log('Updated Validation:', this.listEntryExpired[realIndex]);
    }
  }

  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPemakaianBesar +=
          (Number(item.qtyPemakaianBesar) || 0) * konversi; // Multiply qtyPemakaianBesar by konversi
        acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
        return acc;
      },
      { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 }
    );

    return (
      totalExpired.qtyPemakaianBesar + totalExpired.qtyPemakaianKecil
    ).toFixed(2);
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listDetail[index];
    this.selectedExpProduct.totalQtyProduksi = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPemakaianBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPemakaianKecil)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyPemakaianBesar = parseFloat(
      this.selectedExpProduct.qtyPemakaianBesar
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPemakaianBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPemakaianKecil)
      ).toFixed(2)
    ).toFixed(2);

    this.totalFilteredExpired = totalQtySum;
    if (
      !this.listEntryExpired.some(
        (item) => item.kodeBarang === this.selectedExpProduct.bahanBaku
      )
    ) {
      this.listEntryExpired.push({
        tglExpired: moment().add(1, 'days').toDate(),
        keteranganTanggal: moment()
          .add(1, 'days')
          .locale('id')
          .format('DD MMM YYYY'),
        qtyPemakaianBesar: parseFloat(
          this.selectedExpProduct.qtyPemakaianBesar
        ).toFixed(2),
        qtyPemakaianKecil: parseFloat(
          this.selectedExpProduct.qtyPemakaianKecil
        ).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.bahanBaku,
        validationExpiredMessageList: '',
        validationQty: '',
      });
    }

    this.isShowModalExpired = true;
  }

  onBackPressed(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const extraItem = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.selectedSo.tglTransaksi, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        tipeTransaksi: 12,
        kodeBarang: this.selectedSo.kodeBarang,
        tglExpired: moment(this.selectedSo.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        konversi: this.selectedSo.satuanHasilProduksi,
        satuanKecil: this.selectedSo.satuanKecil,
        satuanBesar: this.selectedSo.satuanBesar,
        qtyBesar: this.selectedSo.jumlahHasilProduksi,
        qtyKecil: '0.00',
        totalQty: this.selectedSo.totalHasilProduksi,
        totalQtyExpired: this.selectedSo.totalHasilProduksi,
        flagExpired: 'Y',
        tipeProduksi: 'F',
        hargaSatuan: this.selectedSo.hargaSatuan,
      };

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.selectedSo.tglTransaksi, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        statusPosting: 'P',
        keterangan: this.selectedSo.keterangan,
        kodeResep: this.selectedSo.kodeBarang,
        tglExp: moment(this.selectedSo.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        jumlahResep: this.selectedSo.jumlahHasilProduksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: [
          ...this.listDetail
            .filter((item) => item.bahanBaku && item.bahanBaku.trim() !== '')
            .map((item) => ({
              kodeGudang: this.g.getUserLocationCode(),
              tglTransaksi: moment(
                this.selectedSo.tglTransaksi,
                'DD-MM-YYYY'
              ).format('D MMM YYYY'),
              tipeTransaksi: 12,
              kodeBarang: item.bahanBaku,
              konversi: item.konversi,
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              qtyBesar: item.qtyPemakaianBesar || 0,
              qtyKecil: item.qtyPemakaianKecil || 0,
              flagExpired: item.isConfirmed ? 'Y' : 'T',
              tipeProduksi: 'R',
              totalQty:
                this.helper.sanitizedNumber(item.qtyPemakaianBesar) *
                  item.konversi +
                this.helper.sanitizedNumber(item.qtyPemakaianKecil),
              totalQtyExpired:
                this.helper.sanitizedNumber(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helper.sanitizedNumber(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianKecil
                ),
              hargaSatuan: 0,
              userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
            })),
          extraItem,
        ],

        detailsExpired: [
          ...this.listEntryExpired?.map((expiredItem) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(
              this.selectedSo.tglTransaksi,
              'DD-MM-YYYY'
            ).format('D MMM YYYY'),
            tipeTransaksi: 12,
            kodeBarang: expiredItem.kodeBarang,
            tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
              'D MMM YYYY'
            ),
            konversi: Math.abs(expiredItem.konversi).toFixed(2),
            qtyBesar:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianBesar)).toFixed(2) ||
              0,
            qtyKecil:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianKecil)).toFixed(2) ||
              0,
            totalQty: -parseFloat(
              (
                Number(expiredItem.qtyPemakaianBesar) *
                  Number(expiredItem.konversi) +
                Number(expiredItem.qtyPemakaianKecil)
              ).toFixed(2)
            ).toFixed(2),
          })),
          extraItem,
        ],
      };

      Swal.fire({
        title: 'Pastikan semua data sudah di input dengan benar!',
        text: 'DATA YANG SUDAH DIPOSTING TIDAK DAPAT DIPERBAIKI..!!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proses Posting',
        cancelButtonText: 'Batal Posting',
      }).then((result) => {
        if (result.isConfirmed) {
          this.appService
            .insert('/api/production/insert', param)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  this.onBackPressed(res.data);
                  // setTimeout(() => {
                  //   this.toastr.success('Data production berhasil diposting!');
                  //   this.onPreviousPressed();
                  // }, DEFAULT_DELAY_TIME);
                }
                this.adding = false;
                this.loadingSimpan = false;
              },
              error: () => {
                this.loadingSimpan = false;
              },
            });
        } else {
          this.toastr.info('Posting dibatalkan');
          this.loadingSimpan = false;
        }
      });
    }
  }

  isDataInvalid() {
    let dataInvalid = false;

    const invalidItems = this.listDetail.filter(
      (item) =>
        item.totalQtyPemakaian !==
          this.getTotalExpiredData(item.bahanBaku, item.konversi) &&
        item.isConfirmed === true
    );

    const invalidExpired = this.listEntryExpired.filter(
      (item) => item.validationExpiredMessageList !== ''
    );

    if (invalidItems.length > 0) {
      dataInvalid = true;
      this.toastr.error('Data Qty Pemakaian harus sama dengan Qty Expired');
    }

    if (invalidExpired.length > 0) {
      dataInvalid = true;
      this.toastr.error(
        `Data tgl expired tidak sesuai di kode barang ${invalidExpired[0].kodeBarang} !`
      );
    }

    return dataInvalid;
  }

  getExpiredData(kodeBarang: string) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPemakaianBesar += Number(item.qtyPemakaianBesar) || 0;
        acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
        return acc;
      },
      { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 }
    );

    return totalExpired;
  }

  onBlurQtyKecil(index: number) {
    const value = this.listDetail[index].qtyKecilSo;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listDetail[index].qtyKecilSo = parsed.toFixed(2);
    } else {
      this.listDetail[index].qtyKecilSo = '0.00';
      this.validationMessageListSatuanKecil[index] = '';
    }
    this.reCountTotal(index, 'kecil');
  }

  onBlurQtyBesar(index: number) {
    const value = this.listDetail[index].qtyBesarSo;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listDetail[index].qtyBesarSo = parsed.toFixed(2);
    } else {
      this.listDetail[index].qtyBesarSo = '0.00';
      this.validationMessageListSatuanBesar[index] = '';
    }
    this.reCountTotal(index, 'besar');
  }

  reCountTotal(index: number, input: 'besar' | 'kecil') {
    const value1 = this.listDetail[index].qtyKecilSo;
    let valKecil = Number(value1);
    const value2 = this.listDetail[index].qtyBesarSo;
    let valBesar = Number(value2);
    const value3 = this.listDetail[index].konversi;
    let valKonversi = Number(value3);

    this.listDetail[index].totalQtySo =
      (valBesar > 0 ? valBesar * valKonversi : 0) + valKecil;

    this.listDetail[index].selisihQty =
      this.listDetail[index].totalQtySystem - this.listDetail[index].totalQtySo;

    if (!this.validationMessageQtyPesanList[index] && valKonversi >= valKecil) {
      this.updateQtyDbDetail(index, input);
    }
  }

  onInputValueItemDetail(
    event: any,
    index: number,
    type: string,
    qtyType: string
  ) {
    // const target = event.target;
    // const value = target.value;
    let validationMessage = '';
    if (this.isNotNumber(this.listDetail[index].qtyKecilSo)) {
      this.validationMessageListSatuanKecil[index] = 'QTY kecil harus angka';
    } else if (
      this.listDetail[index].qtyKecilSo > this.listDetail[index].konversi
    ) {
      this.validationMessageListSatuanKecil[index] =
        'QTY kecil harus < Konversi';
    } else {
      this.validationMessageListSatuanKecil[index] = '';
    }

    if (this.isNotNumber(this.listDetail[index].qtyBesarSo)) {
      this.validationMessageListSatuanBesar[index] = 'QTY besar harus angka';
    } else {
      this.validationMessageListSatuanBesar[index] = '';
    }

    if (
      this.listDetail[index].qtyKecilSo != 0 ||
      this.listDetail[index].qtyBesarSo != 0
    ) {
      this.validationMessageQtyPesanList[index] = '';
    } else {
      this.validationMessageQtyPesanList[index] =
        'Quantity Pesan tidak Boleh 0';
    }
  }

  isNotNumber(value: any) {
    return !/^\d+(\.\d+)?$/.test(value);
  }

  updateQtyDbDetail(index: number, input: 'besar' | 'kecil') {
    this.setLoadingUpdateQty(index, input, true);
    this.setErrorUpdateQty(index, input, false);

    let data = this.listDetail[index];
    this.appService
      .insert('/api/stock-opname/update-qty', {
        kodeGudang: data.kodeGudang,
        kodeBarang: data.kodeBarang,
        qtyBesarSo: parseFloat(data.qtyBesarSo) || 0,
        qtyKecilSo: parseFloat(data.qtyKecilSo) || 0,
        nomorSo: data.nomorSo,
        totalQtySo: parseFloat(data.totalQtySo) || 0,
        selisihQty: data.totalQtySystem - data.totalQtySo,
      })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.setErrorUpdateQty(index, input, true);
          }
          this.setLoadingUpdateQty(index, input, false);
        },
        error: () => {
          this.setLoadingUpdateQty(index, input, false);
        },
      });
  }

  setLoadingUpdateQty(index: number, input: 'besar' | 'kecil', val: boolean) {
    if (input === 'besar') {
      this.loadingUpdateQtyBesar[index] = val;
    } else {
      this.loadingUpdateQtyKecil[index] = val;
    }
  }

  setErrorUpdateQty(index: number, input: 'besar' | 'kecil', val: boolean) {
    if (input === 'besar') {
      this.errorUpdateQtyBesar[index] = val;
    } else {
      this.errorUpdateQtyKecil[index] = val;
    }
  }

  focusPrevInput(event: Event) {
    const current = event.target as HTMLElement;
    const prev = current
      .closest('tr')
      ?.previousElementSibling?.querySelector('input');

    if (prev) {
      (prev as HTMLElement).focus();
    } else {
      const currentIndex = this.listPages.indexOf(this.currentPage);
      const isFirstPage = currentIndex === 0;

      if (!isFirstPage) {
        this.currentPage--;

        setTimeout(() => {
          const inputs = document.querySelectorAll(
            'input[id^="inputQtyBesar"]'
          );
          const lastInput = inputs[inputs.length - 1];
          if (lastInput) {
            (lastInput as HTMLElement).focus();
          }
        }, 100);
      }
    }
  }

  focusNextInput(event: Event) {
    const current = event.target as HTMLElement;
    const next = current
      .closest('tr')
      ?.nextElementSibling?.querySelector('input');

    if (next) {
      (next as HTMLElement).focus();
    } else {
      const currentIndex = this.listPages.indexOf(this.currentPage);
      const isLastPage = currentIndex === this.listPages.length - 1;

      if (!isLastPage) {
        this.currentPage++;

        setTimeout(() => {
          const firstInput = document.querySelector(
            'input[id^="inputQtyBesar"]'
          );
          if (firstInput) {
            (firstInput as HTMLElement).focus();
          }
        }, 100);
      }
    }
  }
}
