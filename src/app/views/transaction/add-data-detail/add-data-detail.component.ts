import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../config/app.config';
import { HelperService } from '../../../service/helper.service';
import { AppService } from '../../../service/app.service';
import moment from 'moment';
import { data } from 'jquery';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-delivery-order',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailDeliveryComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  selectedOrder: any = JSON.parse(
    localStorage[LS_INV_SELECTED_DELIVERY_ORDER]
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  listCurrentPage: number = 1;
  totalLengthList: number = 1;
  searchDetail = '';
  protected config = AppConfig.settings.apiServer;
  filteredListTypeOrder: any[] = [];
  validationMessages: { [key: number]: string } = {};
  validationQtyKecilKonversi: { [key: number]: string } = {};
  validationTotalStock: { [key: number]: string } = {};
  dtColumns: any = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  pageDt = new Page();

  searchListViewOrder: string = '';
  isShowModalStockExpired: boolean = false;

  @Output() dataCetak = new EventEmitter<any>();

  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private dataService: DataService,

  ) {
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.getDeliveryItemDetails()
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedOrder.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedOrder.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.g.navbarVisibility = false;
  }

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan
    };

    this.appService.getDeliveryItemDetails(params).subscribe(
      (res) => {
        this.listOrderData = res.data.map((data: any) => ({
          ...data,
          qtyBPesanOld: data.qtyPesanBesar,
          totalQtyPesanOld: data.totalQtyPesan,
          qtyPesanBesar: Number(data.qtyPesanBesar).toFixed(2),
          qtyPesanKecil: Number(data.qtyPesanKecil).toFixed(2),
        }));

        this.filteredListTypeOrder = this.listOrderData;
        this.totalLength = res?.data?.length;
        this.page = 1;
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      },
      () => {
        this.loading = false;
        // this.toastr.error(this.errorShowMessage, 'Maaf, Terjadi Kesalahan!');
      }
    );
  }

  dtPageChange(event: any) { }


  onFilterTextChange(newValue: string) {
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listOrderData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    const target = event.target;

    const value = target.value;
    let validationMessage = '';
    let validationQtyKecil = '';

    if (type === 'numeric') {
      const numericValue = parseFloat(value) || 0;
      const numericQtyKecil = parseFloat(this.listOrderData[index].qtyPesanKecil);
      const numericQtyBesar = parseFloat(this.listOrderData[index].qtyPesanBesar);

      if (this.listOrderData[index]) {
        this.listOrderData[index][target.name] = numericValue;
        let newTempTotal = 0;
        if (qtyType === 'besar') {
          newTempTotal = numericValue * (this.listOrderData[index].konversi || 1) +
            (numericQtyKecil || 0);
        } else if (qtyType === 'kecil') {
          newTempTotal = numericQtyBesar * (this.listOrderData[index].konversi || 1) + numericValue;
          if (numericQtyKecil >= this.listOrderData[index].konversi) {
            validationQtyKecil = 'Qty kecil tidak boleh sama atau lebih besar dari konversi '
          }
        }
        if (newTempTotal > (this.listOrderData[index].totalQtyPesanOld || 0)) {
          validationMessage = `Qty kirim tidak boleh lebih besar dari qty pesanan`;
        }
      }
    } else {
      if (this.listOrderData[index]) {
        this.listOrderData[index][target.name] = value;
      }
    }

    // Simpan pesan validasi berdasarkan index
    this.validationMessages[index] = validationMessage;
    this.validationQtyKecilKonversi[index] = validationQtyKecil;
  }

  get filteredList() {
    if (!this.searchListViewOrder) {
      return this.filteredListTypeOrder;
    }
    const searchText = this.searchListViewOrder.toLowerCase();
    return this.filteredListTypeOrder.filter(item =>
      JSON.stringify(item).toLowerCase().includes(searchText)
    );
  }

  get filteredListExpired() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
    );
  }

  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }
  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
  }

  onBackPressed() {
    this.router.navigate(['/transaction/delivery-item']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listOrderData'] && changes['listOrderData'].currentValue) {
      this.filteredListTypeOrder = JSON.parse(
        JSON.stringify(this.listOrderData)
      );
    }
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    this.adding = true;
    let totalKirim = 0;
    let hasInvalidData = false; // Tambahkan flag untuk mengecek validasi

    const listOrder = (this.listOrderData || [])
      .map((data: any) => {
        const totalKirim = this.helper.sanitizedNumber((data.qtyPesanBesar * data.konversi).toString()) + this.helper.sanitizedNumber(data.qtyPesanKecil);

        if (totalKirim > data.totalQtyPesanOld) {
          this.toastr.error(
            `Kode Barang: ${data.kodeBarang}, Qty Kirim (${totalKirim}) tidak boleh lebih besar dari Qty Pesan (${data.totalQtyPesanOld})`
          );
          hasInvalidData = true;
          return null;
        }

        return {
          kodeGudang: this.selectedOrder.kodeGudang,
          kodeTujuan: this.selectedOrder.codeDestination,
          tipeTransaksi: 3,
          nomorPesanan: this.selectedOrder.nomorPesanan,
          kodeBarang: data.kodeBarang,
          qtyBPesan: data.qtyBPesanOld,
          qtyKPesan: data.qtyPesanKecil,
          qtyBKirim: data.qtyPesanBesar,
          qtyKKirim: data.qtyPesanKecil,
          hargaSatuan: 0,
          userCreate: JSON.parse(localStorage.getItem("inv_currentUser") || "{}").namaUser,
          konversi: data.konversi,
          satuanKecil: data.satuanKecil,
          satuanBesar: data.satuanBesar,
          totalQtyPesanOld: data.totalQtyPesanOld,
          keterangan: this.selectedOrder.keterangan || '',
          tglKirimGudang: moment(this.selectedOrder.validatedDeliveryDate, "YYYY-MM-DD").format('D MMM YYYY')
        };
      })
      .filter((item) => item !== null);

    const param = {
      listOrder: listOrder,
      detailsExpired: (this.listEntryExpired || []).map(expiredItem => ({
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.selectedOrder.validatedDeliveryDate, "YYYY-MM-DD").format('D MMM YYYY'),
        tipeTransaksi: 3,
        kodeBarang: expiredItem.kodeBarang,
        tglExpired: moment(expiredItem.tglExpired, "DD-MM-YYYY").format("D MMM YYYY"),
        konversi: expiredItem.konversi,
        qtyBesar: -Math.abs(Number.parseInt(expiredItem.qtyPesanBesar || '0', 10)),
        qtyKecil: -Math.abs(Number.parseInt(expiredItem.qtyPesanKecil || '0', 10)),
        totalQty: expiredItem.totalQty ? -Math.abs(Number(expiredItem.totalQty)) : 0
      }))
    };

    if (hasInvalidData || this.listOrderData.length === 0) {
      this.adding = false;
      return;
    }

    if (this.listEntryExpired.length !== this.listOrderData.length) {
      this.toastr.warning( 'Qty expired belum dilengkapi!'
      );
      this.adding = false;
      return;
    }

    const self = this;

    Swal.fire({
      title: '<div style="color: white; background: #e55353; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Posting Data</div>',
      html: `
    <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
      <p>Pastikan Semua Data Sudah Di Input Dengan Benar,<br><strong>PERIKSA SEKALI LAGI...!!</strong></p>
      <p class="text-danger" style="font-weight: bold;">DATA YANG SUDAH DI POSTING TIDAK DAPAT DIPERBAIKI ..!!</p>
    </div>
    <div class="divider my-3"></div>
    <div class="d-flex justify-content-center gap-3 mt-3">
      <button class="btn btn-info text-white btn-150 pe-3" id="btn-submit">
        <i class="fa fa-check pe-2"></i> Proses Pengiriman
      </button>
      <button class="btn btn-secondary text-white btn-150" id="btn-cancel">
        <i class="fa fa-times pe-1"></i> Batal
      </button>
    </div>
  `,
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
          this.appService.saveDeliveryOrder(param).subscribe({

            next: (res) => {
              if (!res.success) {
                this.appService.handleErrorResponse(res);
              } else {
                this.toastr.success("Berhasil!");
                const paramGenerateReport = {
                  outletBrand: 'KFC',
                  isDownloadCsv: true,
                  noSuratJalan: res.message,
                }
                this.dataCetak.emit(paramGenerateReport)
                setTimeout(() => {
                  this.router.navigate(["/transaction/delivery-item/add-data"]);
                }, DEFAULT_DELAY_TIME);
              }
              this.adding = false;
            },
            error: (err) => {
              console.error("Error saat insert:", err);
              this.adding = false;
            },
          }); // 👈 bukan onSubmit lagi
          Swal.close();
        });

        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.adding = false
        });
      }
    })
    // ✅ Jika semua valid, lanjutkan dengan pemanggilan API

  }

  onSearchDetail(event: any) {
    this.searchDetail = event?.target?.value;
    if (event?.target?.value) {
      this.filteredListTypeOrder = this.listOrderData.filter(
        (value: any) =>
          Object.values(value).some(
            (columnValue) =>
              typeof columnValue === 'string' &&
              columnValue
                .toLowerCase()
                .includes(this.searchDetail.toLowerCase())
          ) ||
          (value.items &&
            Array.isArray(value.items) &&
            value.items.some((item: any) =>
              Object.values(item).some(
                (nestedValue: any) =>
                  typeof nestedValue === 'string' &&
                  nestedValue
                    .toLowerCase()
                    .includes(this.searchDetail.toLowerCase())
              )
            ))
      );
    } else {
      this.filteredListTypeOrder = JSON.parse(
        JSON.stringify(this.listOrderData)
      );
    }
  }

  onBlurQtyPesanBesar(index: number) {
    const value = this.listOrderData[index].qtyPesanBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyPesanBesar = parsed.toFixed(2);
    } else {
      this.listOrderData[index].qtyPesanBesar = '0.00';
    }
  }

  onBlurQtyPesanKecil(index: number) {
    const value = this.listOrderData[index].qtyPesanKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyPesanKecil = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index].qtyPesanKecil = '0.00'; // fallback if input is not a number
    }
  }

  selectedExpProduct: any = {};
  totalFilteredExpired: any = '0.0';
  isShowModalExpired: boolean = false;
  listEntryExpired: any[] = [];

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listOrderData[index];
    this.selectedExpProduct.totalQtyPesan = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPesanBesar) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPesanKecil)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyPesanBesar = parseFloat(
      this.selectedExpProduct.qtyPesanBesar
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPesanBesar) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPesanKecil)
      ).toFixed(2)
    ).toFixed(2);

    this.totalFilteredExpired = totalQtySum;
    if (
      !this.listEntryExpired.some(
        (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
      )
    ) {
      this.listEntryExpired.push({
        tglExpired: moment().add(1, 'days').toDate(),
        keteranganTanggal: moment()
          .add(1, 'days')
          .locale('id')
          .format('DD MMM YYYY'),
        qtyPesanBesar: parseFloat(
          this.selectedExpProduct.qtyPesanBesar
        ).toFixed(2),
        qtyPesanKecil: parseFloat(
          this.selectedExpProduct.qtyPesanKecil
        ).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.kodeBarang,
        validationExpiredMessageList: '',
        validationQty: '',
      });
    }

    this.isShowModalExpired = true;
  }

  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPesanBesar +=
          (Number(item.qtyPesanBesar) || 0) * konversi; // Multiply qtyPesanBesar by konversi
        acc.qtyPesanKecil += Number(item.qtyPesanKecil) || 0;
        return acc;
      },
      { qtyPesanBesar: 0, qtyPesanKecil: 0 }
    );

    return (
      totalExpired.qtyPesanBesar + totalExpired.qtyPesanKecil
    ).toFixed(2);
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

    const expiredDate = moment(inputDate, 'DD/MM/YYYY').toDate();
    const today = new Date();

    if (expiredDate < today) {
      validationMessage = `Tanggal kadaluarsa tidak boleh lebih <= dari sekarang!`;
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
          qtyPesanBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyPesanKecil) <=
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
          parseFloat(this.listEntryExpired[realIndex].qtyPesanBesar) <=
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
          qtyPesanKecil: value,
          validationQtyKecil: messageValidation,
        };
      }
    }
    this.updateTotalExpired();
  }

  updateTotalExpired() {
    this.totalFilteredExpired = this.filteredListExpired.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyPesanBesar) * Number(data.konversi) +
          Number(data.qtyPesanKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
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

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyPesanBesar: 0,
      qtyPesanKecil: 0,
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.kodeBarang
    })
  }

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyWaste = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyPesanBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyPesanKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPesanKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });


    if (totalQtyExpired !== totalQtyWaste) {
      this.toastr.error("Total Qty Expired harus sama dengan Qty Expired");
    } else {
      this.isShowModalExpired = false;
    }
  }

  listExpiredItem: any;
  selectedStockExp: any;

  onShowModalStockExp(index: number) {
    this.loading = true;
    this.selectedStockExp = this.listOrderData[index]
    this.selectedStockExp.totalStock = 0;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Bulan dimulai dari 0, jadi ditambah 1
    const startDate: any = today;
    const endDate: any = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let paramDtExpired: any = {};
    if (!this.selectedStockExp?.kodeBarang) {
      this.toastr.error('Barang belum dipilih.');
      return;
    }

    this.appService.insert('/api/stock-movement', {
      kodeGudang: this.g.getUserLocationCode(),
      kodeBarang: this.selectedStockExp.kodeBarang,
      yearEom: year,
      monthEom: month,
      isDetail: true,
    }).subscribe({
      next: (res) => {
        this.listExpiredItem = res;
        res.data.map((d: any) => {
          this.selectedStockExp.totalStock += (d.saldoAwal ?? 0) + (d.totalQtyIn ?? 0) - (d.totalQtyOut ?? 0);
          const totalStock = this.selectedStockExp.totalStock; // misal 25
          const konversi = this.selectedStockExp.konversi;     // misal 10 (1 besar = 10 kecil)

          this.selectedStockExp.qtyBesar = Math.floor(totalStock / konversi);  // 2
          this.selectedStockExp.qtyKecil = totalStock % konversi;              // 5
        });
        this.loading = false;
        let validationStock = '';

        if (this.selectedStockExp.qtyBesar <= 10) {
          validationStock = 'STOCK SEDIKIT'
          this.validationTotalStock[index] = validationStock;
        }
        paramDtExpired.kodeBarang = this.selectedStockExp.kodeBarang,
          paramDtExpired.startDate = this.g.transformDate(startDate),
          paramDtExpired.endDate = this.g.transformDate(endDate),

          this.renderDt(paramDtExpired, index);
        this.isShowModalStockExpired = true;
      },

      error: (err) => {
        console.error('Error fetching stock movement:', err);
        this.toastr.error('Gagal memuat data stok expired.');
      }
    });
  }

  renderDt(paramDtExpired: any, index: number) {
    this.dtOptions = {
      language: this.translation.getCurrentLanguage() == 'id' ? this.translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback:any) => {
        this.pageDt.start = dataTablesParameters.start;
        this.pageDt.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          kodeBarang: paramDtExpired.kodeBarang,
          // startDate: paramDtExpired.startDate
          startDate: '01 Apr 2025'
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL + '/api/expired-by-item/dt',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;

                const konversi = rest.konversi || 1;
                const totalQty = rest.totalQty;
                const qtyBesar = Math.floor(totalQty / konversi);
                const qtyKecil = totalQty % konversi;

                const finalData = {
                  ...rest,
                  dtIndex: this.pageDt.start + index + 1,

                  tglExpired: this.g.transformDate(rest.tglExpired),
                  qtyBesar: this.g.formatToDecimal(qtyBesar),
                  qtyKecil: this.g.formatToDecimal(qtyKecil),
                  totalQty: this.g.formatToDecimal(totalQty),
                };

                return finalData;

              });
              this.pageDt.recordsTotal = resp.recordsTotal;
              this.pageDt.recordsFiltered = resp.recordsFiltered;
              this.totalLength = mappedData.length;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });

            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'tglExpired', title: 'Tgl. Expired' },
        {
          data: 'tglExpired', title: 'Keterangan Tanggal',
            render: (data: any, _: any, row: any) => moment(data)
            .add(1, 'days')
            .locale('id')
            .format('DD MMM YYYY')
        },
        {
          data: 'qtyBesar', title: 'Qty Besar',
            render: (data: any, _: any, row: any) => `${data} ${row.satuanBesar}`
        },
        {
          data: 'qtyKecil', title: 'Qty Kecil',
            render: (data: any, _: any, row: any) => `${data} ${row.satuanKecil}`
        },
        {
          data: 'totalQty', title: 'Total Qty Expired',
            render: (data: any, _: any, row: any) => `${data} ${row.satuanKecil}`
        },
      ],
      searchDelay: 1000,
      order: [[1, 'asc']],
    };
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index: any) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

}
