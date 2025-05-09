import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  CANCEL_STATUS,
  DEFAULT_DELAY_TIME,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../../constants';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import moment from 'moment';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { DataService } from '../../../../service/data.service';
import { Page } from '../../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-data-detail-production',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailProductionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  orders: any[] = [];
  headerProduction: any = JSON.parse(localStorage['headerProduction']);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: any = {};
  selectedRow: any[] = [];
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  indexDataDelete: any;
  selectedExpProduct: any = {};
  loadingSimpan: boolean = false;
  @Output() onBatalPressed = new EventEmitter<string>();
  @Output() jumlahBahanbaku = new EventEmitter<number>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  validationExpiredMessageList: any[] = [];
  totalFilteredExpired: any = '0.0';
  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red my-datepicker-top',
    customTodayClass: 'today-highlight',
    minDate: new Date(),
  };
  protected config = AppConfig.settings.apiServer;
  isUpdate: boolean = false;
  headerData: any = {};

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private service: AppService
  ) {
    this.g.navbarVisibility = false;
    this.headerProduction = JSON.parse(this.headerProduction);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerProduction.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
    this.headerProduction.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');

    console.log(this.isUpdate,'isUpdate');
    if(!this.isUpdate) this.loadBahanBaku();

  }

  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const extraItem = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerProduction.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        tipeTransaksi: 12,
        kodeBarang: this.headerProduction.kodeBarang,
        tglExpired: moment(this.headerProduction.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        konversi: this.headerProduction.satuanHasilProduksi,
        satuanKecil: this.headerProduction.satuanKecil,
        satuanBesar: this.headerProduction.satuanBesar,
        qtyBesar: this.headerProduction.jumlahHasilProduksi,
        qtyKecil: '0.00',
        totalQty: this.headerProduction.totalHasilProduksi,
        totalQtyExpired: this.headerProduction.totalHasilProduksi,
        flagExpired: 'Y',
        tipeProduksi: 'F',
        hargaSatuan: this.headerProduction.hargaSatuan,
      };

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerProduction.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'P',
        keterangan: this.headerProduction.keterangan,
        kodeResep: this.headerProduction.kodeBarang,
        tglExp: moment(this.headerProduction.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        jumlahResep: this.headerProduction.jumlahHasilProduksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: [
          ...this.listProductData
            .filter((item) => item.bahanBaku && item.bahanBaku.trim() !== '')
            .map((item) => ({
              kodeGudang: this.g.getUserLocationCode(),
              tglTransaksi: moment(
                this.headerProduction.tglTransaksi,
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
              this.headerProduction.tglTransaksi,
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
        ...this.g.componentKonfirmasiPosting,
         showConfirmButton: false,
         showCancelButton: false,
         width: '600px',
         customClass: {
           popup: 'custom-popup'
         },
         didOpen: () => {
          const submitBtn = document.getElementById('btn-submit');
          const cancelBtn = document.getElementById('btn-cancel');

          submitBtn?.addEventListener('click', () => {
            this.service
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
              Swal.close();
            });

            cancelBtn?.addEventListener('click', () => {
              Swal.close();
              this.loadingSimpan = false;
              this.toastr.info('Posting dibatalkan');
            });
          }
      });
    }
  }

  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listProductData[index];
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

      this.totalFilteredExpired = totalQtySum;
    }else{
      this.totalFilteredExpired = this.listEntryExpired
      .filter((item) => item.kodeBarang === this.selectedExpProduct.bahanBaku)
      .reduce((sum, item) => sum + parseFloat(item.totalQty) || 0, 0).toFixed(2);
    }

    this.isShowModalExpired = true;
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

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;
    let validationExpiredMessageList='';
    let totalQtyEmpty = 0;

    const totalQtyPemakaian =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.bahanBaku) {
        item.totalQty =
          this.helper.sanitizedNumber(item.qtyPemakaianBesar) * item.konversi +
          this.helper.sanitizedNumber(item.qtyPemakaianKecil);
        item.kodeBarang = this.selectedExpProduct.bahanBaku;
        totalQtyExpired += item.totalQty;

        if(item.totalQty <= 0){
          totalQtyEmpty++;
        }
        validationExpiredMessageList = item.validationExpiredMessageList;
      }
    });

    if (totalQtyExpired != totalQtyPemakaian) {
      this.toastr.error('Total Qty Expired harus sama dengan Qty Pemakaian');
    } else if(validationExpiredMessageList){
      this.toastr.error(validationExpiredMessageList);
    }else if(totalQtyEmpty > 0){
      this.toastr.error('Total Qty Expired tidak boleh 0 !');
    } else {
      this.isShowModalExpired = false;
    }

  }

  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.bahanBaku
    );
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;

    const invalidItems = this.listProductData.filter(
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

  listProductData: any[] = [
    {
      bahanBaku: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      isConfirmed: false,
      tipeProduksi: 'R',
    },
  ];
  tempKodeBarang: string = '';

  loadBahanBaku() {
    console.log('loadBahanBaku', this.headerProduction.kodeBarang);
    let param = this.headerProduction?.kodeBarang;

    this.appService.getBahanBakuByResep(param).subscribe({
      next: (res) => {
        this.listProductData = res.data.map((item: any) => ({
          jumlahHasilProduksi: this.headerProduction.jumlahHasilProduksi,
          bahanBaku: item.bahanBaku,
          namaBarang: item.namaBarang,
          konversi: parseFloat(item.konversi).toFixed(2),
          qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          tipeProduksi: 'R',
          qtyPemakaianBesar: Math.floor(
            (item.qtyPemakaian * this.headerProduction.jumlahHasilProduksi) /
              item.konversi
          ).toFixed(2),
          qtyPemakaianKecil: (
            item.qtyPemakaian * this.headerProduction.jumlahHasilProduksi -
            Math.floor(
              (item.qtyPemakaian * this.headerProduction.jumlahHasilProduksi) /
                item.konversi
            ) *
              item.konversi
          ).toFixed(2),
          totalQtyPemakaian: (
            item.qtyPemakaian * this.headerProduction.jumlahHasilProduksi
          ).toFixed(2),
          isConfirmed: item.flagExpired == 'Y' ? true : false,
        }));

        this.jumlahBahanbaku.emit(this.listProductData.length);
      },
    });
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

  onModalDeleteRow(kodeBarang: string, index: number) {
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    // Step 2: Find the actual index in the original list
    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    // Step 3: Remove the entry only if realIndex is valid
    if (realIndex !== -1) {
      this.listEntryExpired.splice(realIndex, 1);
    }

    this.updateTotalExpired();
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

    // ✅ Get only the filtered list of entries for the same `kodeBarang`
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );
    console.log('tgllist', filteredEntries);

    // ✅ Validate empty input
    if (!inputDate) {
      validationMessage = 'Tanggal tidak boleh kosong!';
    } else {
      // ✅ Check if the item is expired
      const expiredData = this.listEntryExpired.find(
        (exp) => exp.kodeBarang === kodeBarang
      );

      // ✅ Check for duplicate expiration dates within the same kodeBarang
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
      // ✅ Update the correct entry in the original list
      this.listEntryExpired[realIndex] = {
        ...this.listEntryExpired[realIndex],
        tglExpired: expiredDate, // Update the date in the list
        validationExpiredMessageList: validationMessage,
      };

      console.log('Updated Validation:', this.listEntryExpired[realIndex]);
    }
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

    // ✅ Find all entries with the same kodeBarang
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyPemakaianBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyPemakaianKecil) <=
            0
              ? 'Quantity tidak boleh <= 0'
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
      value = '0.00'; // Default if empty
    }

    // ✅ Find all entries with the same kodeBarang
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        let messageValidation = '';

        if (
          parseFloat(value) +
            parseFloat(this.listEntryExpired[realIndex].qtyPemakaianBesar) <=
          0
        ) {
          messageValidation = 'Quantity tidak boleh <= 0';
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

    if(this.totalFilteredExpired == 0){
        this.toastr.error(`Total Qty tidak boleh 0!`);
    }

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
  }

  @Input()
  set dataProduct(value: any) {
    console.log(value,'value')
    this.listProductData = value; // or any logic
  }

  @Input()
  set dataExired(value: any) {
    this.listEntryExpired = value; // or any logic
  }

  @Input()
  set dataUpdate(value: any) {
    this.isUpdate = value;
  }



  @Input()
  set dataHeader(value: any) {
    console.log(value,'dataHeader')
    this.headerData = value;
  }


  onUpdate() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const extraItem = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerProduction.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        tipeTransaksi: 12,
        kodeBarang: this.headerProduction.kodeBarang,
        tglExpired: moment(this.headerData.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        konversi: this.headerProduction.satuanHasilProduksi,
        satuanKecil: this.headerProduction.satuanKecil,
        satuanBesar: this.headerProduction.satuanBesar,
        qtyBesar: this.headerData.jumlahHasilProduksi,
        qtyKecil: '0.00',
        totalQty: this.headerData.totalHasilProduksi,
        totalQtyExpired: this.headerData.totalHasilProduksi,
        flagExpired: 'Y',
        tipeProduksi: 'F',
        hargaSatuan: this.headerProduction.hargaSatuan,
      };

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        nomorTransaksi: this.headerProduction.nomorTransaksi,
        tglTransaksi: moment(
          this.headerProduction.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'K',
        keterangan: this.headerData.keterangan,
        kodeResep: this.headerProduction.kodeBarang,
        tglExp: moment(this.headerData.tglExp, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        jumlahResep: this.headerData.jumlahHasilProduksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: [
          ...this.listProductData
            .filter((item) => item.bahanBaku && item.bahanBaku.trim() !== '')
            .map((item) => ({
              kodeGudang: this.g.getUserLocationCode(),
              tglTransaksi: moment(
                this.headerProduction.tglTransaksi,
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
              this.headerProduction.tglTransaksi,
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
        ...this.g.componentKonfirmasiSimpan,
         showConfirmButton: false,
         showCancelButton: false,
         width: '600px',
         customClass: {
           popup: 'custom-popup'
         },
         didOpen: () => {
          const submitBtn = document.getElementById('btn-submit');
          const cancelBtn = document.getElementById('btn-cancel');

          submitBtn?.addEventListener('click', () => {
            this.service
              .insert('/api/production/update', param)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                  } else {
                    // this.onBackPressed(res.data);
                    setTimeout(() => {
                      this.toastr.success('Data production berhasil diubah!');
                      this.router.navigate(['/transaction/production/list-dt-for-posting']);
                    }, DEFAULT_DELAY_TIME);
                  }
                  this.adding = false;
                  this.loadingSimpan = false;
                },
                error: () => {
                  this.loadingSimpan = false;
                },
              });
              Swal.close();
            });

            cancelBtn?.addEventListener('click', () => {
              Swal.close();
              this.loadingSimpan = false;
              this.toastr.info('Posting dibatalkan');
            });
          }
      });
    }
  }
}
