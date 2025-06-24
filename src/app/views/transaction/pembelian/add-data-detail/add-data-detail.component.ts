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
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
  ACTION_SELECT,
  RANGE_BERAT_KGS
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';

import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import moment from 'moment';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-pembelian',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailPembelianComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  selectedOrder: any = JSON.parse(
    localStorage['headerPembelian']
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
  configSelect: any
  formStatusFilter: any
  isShowModalExpired: boolean = false;
  selectedExpProduct: any = {};
  listEntryExpired: any[] = [];
  totalQtyExpired: { [key: number]: number } = {};
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red',
  };
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  validationMsg: { [index: number]: { [field: string]: string } } = {};

  @Output() dataCetak = new EventEmitter<any>();

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => { }, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  totalFilteredExpired: any = '0.0';

  listStatus: any[] = [
    {
      id: '1',
      name: '1.FRESH',
    },
    {
      id: '2',
      name: '2.FROZEN',
    },
  ];
  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
  ) {
    this.configSelect = {
      ...this.baseConfig,
      placeholder: 'Pilih Status',
      searchPlaceholder: 'Cari Status',
      limitTo: this.listStatus.length,
    };
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.getDetailAddPembelian()
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

  getDetailAddPembelian() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan,
      kodeGudang: this.g.getUserLocationCode(),
    };

    this.appService.getDetailAddPembelian(params).subscribe(
      (res) => {
        this.listOrderData = res.data.map((data: any) => ({
          ...data,
          qtyTerimaBesar: Number(data.qtyPesanBesar).toFixed(2),
          qtyTerimaKecil: Number(data.qtyPesanKecil).toFixed(2),
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

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    const target = event.target;

    const value = target.value;
    let validationMessage = '';

    if (type === 'numeric') {
      const numericValue = parseFloat(value) || 0;

      if (this.listOrderData[index]) {
        this.listOrderData[index][target.name] = numericValue;
        let newTempTotal = 0;
        if (qtyType === 'besar') {
          newTempTotal = numericValue * (this.listOrderData[index].konversi || 1) +
            (this.listOrderData[index].qtyPesanKecil || 0);
        } else if (qtyType === 'kecil') {
          newTempTotal = this.listOrderData[index].qtyPesanBesar * (this.listOrderData[index].konversi || 1) + numericValue;
        }
        if (newTempTotal > (this.listOrderData[index].totalQtyPesanOld || 0)) {
          validationMessage = `qty kirim harus < dari qty pesan`;
        }
      }
    } else {
      if (this.listOrderData[index]) {
        this.listOrderData[index][target.name] = value;
      }
    }

    // Simpan pesan validasi berdasarkan index
    this.validationMessages[index] = validationMessage;
  }

  onBlurParsed(index: number, field: string) {
    const value = this.listOrderData[index][field];
    const kodeBarang = this.listOrderData[index].kodeBarang;
    const qtyTerima = this.listOrderData[index].qtyTerimaBesar;
    let qtyKgs = this.listOrderData[index].qtyKgs;
    let parsed = Number(value);
    if (!isNaN(parsed) && value !== 'jenis') {
      this.listOrderData[index][field] = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index][field] = '0.00'; // fallback if input is not a number
    }

    if ((field === 'qtyKgs' || field === 'qtyTerimaBesar') && qtyKgs) {
      const rangeInfo = RANGE_BERAT_KGS.find((item) => item.value === kodeBarang);

      if (rangeInfo) {
        const min = rangeInfo.min;
        const max = rangeInfo.max;
        const averagePerPcs = qtyKgs / (qtyTerima || 1); // hindari pembagian dengan 0

        if (averagePerPcs < min || averagePerPcs > max) {
          Swal.fire({
            title: 'Pesan Error!',
            text: `ITEM ${kodeBarang} ${rangeInfo.description}`,
            confirmButtonText: 'OK'
          });
          this.listOrderData[index][field] = '';
          this.validationMsg[index][field] = 'Wajib diisi!';
        }
      }
    }

    if (this.listOrderData[index][field] === '' || this.listOrderData[index][field] === '0.00' && !this.listOrderData[index].qtyTerimaKecil) {
      this.validationMsg[index] = this.validationMsg[index] || {};
      this.validationMsg[index][field] = 'Wajib diisi!';
    } else {
      this.validationMsg[index][field] = '';
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
          qtyTerimaBesar: value,
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
          parseFloat(this.listEntryExpired[realIndex].qtyTerimaBesar) <=
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
          qtyTerimaKecil: value,
          validationQtyKecil: messageValidation,
        };
      }
    }
    this.updateTotalExpired();
  }

  onBlurParsedExp(index: number, field: string) {
    const value = this.listEntryExpired[index][field];
    const kodeBarang = this.listEntryExpired[index].kodeBarang;
    const qtyTerima = this.listEntryExpired[index].qtyTerimaBesar;
    let parsed = Number(value);
    if (!isNaN(parsed) && value !== 'jenis') {
      this.listEntryExpired[index][field] = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listEntryExpired[index][field] = '0.00'; // fallback if input is not a number
    }


    if (field === 'qtyKgs') {
      const rangeInfo = RANGE_BERAT_KGS.find((item) => item.value === kodeBarang);

      if (rangeInfo) {
        const min = rangeInfo.min;
        const max = rangeInfo.max;
        const averagePerPcs = parsed / (qtyTerima || 1); // hindari pembagian dengan 0

        if (averagePerPcs < min || averagePerPcs > max) {
          Swal.fire({
            title: 'Pesan Error!',
            text: `ITEM ${kodeBarang} ${rangeInfo.description}`,
            confirmButtonText: 'OK'
          });
          this.listEntryExpired[index][field] = '';
          this.validationMsg[index][field] = 'Wajib diisi!';
        }
      }
    }

    if (this.listEntryExpired[index][field] === '' || this.listEntryExpired[index][field] === '0.00' && !this.listEntryExpired[index].qtyTerimaKecil) {
      this.validationMsg[index] = this.validationMsg[index] || {};
      this.validationMsg[index][field] = 'Wajib diisi!';
    } else {
      this.validationMsg[index][field] = '';
    }

    this.updateTotalExpired();
  }

  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
  }

  onBackPressed() {
    this.router.navigate(['/transaction/pembelian/list-dt']);
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


  isDataInvalid() {
    const hasValidationMessageList =
      this.validationMessageList?.some(msg => msg.trim() !== "") ?? false;

    const hasValidationMessageQtyPesanList =
      this.validationMessageQtyPesanList?.some(msg => msg.trim() !== "") ?? false;

    const hasValidationMsg = Object.values(this.validationMsg).some(fieldMsgs =>
      Object.values(fieldMsgs).some(msg => msg && msg.trim() !== "")
    );

    return hasValidationMessageList || hasValidationMessageQtyPesanList || hasValidationMsg;
  }



  onPreviousPressed(): void {
    this.router.navigate(['/transaction/pembelian/list-dt']);
  }

  validateData(data: any): boolean {
    let isValid = true;

    // Validasi di data.details
    for (const [i, item] of data.details.entries()) {
      const qtyBesarKosong = item.qtyBesar === '0.00' || item.qtyBesar === '' || item.qtyBesar == null;
      const qtyKecilKosong = item.qtyKecil === '0.00' || item.qtyKecil === '' || item.qtyKecil == null;

      // Validasi: qtyBesar dan qtyKecil tidak boleh dua-duanya kosong
      if (qtyBesarKosong && qtyKecilKosong) {
        this.toastr.warning(`Data pada baris ${i + 1}: Mohon isi minimal qtyBesar atau qtyKecil`, 'Validasi');
        isValid = false;
        break;
      }

      // Validasi qtyKgs jika flagJenis === 'Y'
      if (item.flagJenis === 'Y' && (item.qtyKgs === 0 || item.qtyKgs === '0' || item.qtyKgs == null)) {
        this.toastr.warning(`Data pada baris ${i + 1}: TOTAL BERAT dan JENIS `, 'Validasi');
        isValid = false;
        break;
      }
    }

    // Validasi di data.detailsExpired
    for (const [i, exp] of data.detailsExpired.entries()) {
      const relatedDetail = data.details.find((d: any) => d.kodeBarang === exp.kodeBarang);
      const flagExpired = relatedDetail?.flagExpired;

      if (flagExpired === 'Y' && (exp.totalQty === 0 || exp.totalQty === '0' || exp.totalQty == null)) {
        this.toastr.warning(`Data expired pada baris ${i + 1}: totalQty wajib diisi karena flagExpired = 'Y'`, 'Validasi');
        isValid = false;
        break;
      }
    }

    return isValid;
  }


  onSubmit() {
    if (!this.isDataInvalid()) {
      this.adding = true;
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.selectedOrder.tglTerimaBrg, "DD-MM-YYYY").format("D MMM YYYY"),
        tipeTransaksi: 1,
        nomorDokumen: this.selectedOrder.nomorDokumen,
        kodeSupplier: this.selectedOrder.supplier,
        nomorPo: this.selectedOrder.nomorPesanan,
        tglDokumen: moment(this.selectedOrder.tglDokumen, "DD-MM-YYYY").format("D MMM YYYY"),
        keterangan: this.selectedOrder.notes,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.filteredListTypeOrder
          .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map(item => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.selectedOrder.tglTerimaBrg, "DD-MM-YYYY").format("D MMM YYYY"),
            tipeTransaksi: 1,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyTerimaBesar || 0,
            qtyKecil: item.qtyTerimaKecil || 0,
            flagExpired: item.flagExpired,
            totalQty: (this.helper.sanitizedNumber(item.qtyTerimaBesar) *
              item.konversi) + this.helper.sanitizedNumber(item.qtyTerimaKecil),
            totalQtyExpired: this.totalQtyExpired[item.kodeBarang] || 0,
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
            statusSync: "T",
            qtyKgs: item.qtyKgs || 0,
            jenisItem: item.jenis || " ",
            flagJenis: item.flagJenis,
          })),
        detailsExpired: this.listEntryExpired?.map(expiredItem => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.selectedOrder.tglTerimaBrg, "DD-MM-YYYY").format("D MMM YYYY"),
          tipeTransaksi: 4,
          kodeBarang: expiredItem.kodeBarang,
          tglExpired: moment(expiredItem.tglExpired, "DD-MM-YYYY").format("D MMM YYYY"),
          konversi: expiredItem.konversi,
          qtyBesar: Math.abs(parseInt(expiredItem.qtyTerimaBesar)) || 0,
          qtyKecil: Math.abs(parseInt(expiredItem.qtyTerimaKecil)) || 0,
          totalQty: expiredItem.totalQty ? Math.abs(expiredItem.totalQty) : 0
        })) || []
      };

      if (!this.validateData(param)) {
        this.adding = false;
        return;
      }

      const expiredButNotEntered = this.listOrderData.filter((data: any) =>
        data.flagExpired === 'Y' &&
        !this.listEntryExpired.some((entry: any) => entry.kodeBarang === data.kodeBarang)
      );

      if (expiredButNotEntered.length > 0) {
        this.toastr.warning('Qty expired belum dilengkapi!');
        this.adding = false;
        return;
      }


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
              <i class="fa fa-check pe-2"></i> Proses Posting
            </button>
            <button class="btn btn-secondary text-white btn-150" id="btn-cancel">
              <i class="fa fa-times pe-1"></i> Batal Proses
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
            Swal.close();
            this.adding = true;
            this.appService.insert('/api/pembelian/insert', param).subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  setTimeout(() => {
                    const paramGenerateReport = {
                      outletBrand: 'KFC',
                      isDownloadCsv: false,
                      nomorTransaksi: res.message,
                      kodeGudang: this.g.getUserLocationCode(),
                    };
                    this.toastr.success("Data pembelian berhasil dibuat");
                    this.dataCetak.emit(paramGenerateReport);
                    setTimeout(() => {
                      this.router.navigate(["/transaction/pembelian/add-data"]);
                    }, DEFAULT_DELAY_TIME);
                  }, DEFAULT_DELAY_TIME);
                }
                this.adding = false;
              },
              error: (err) => {
                console.error("Error saat insert:", err);
                this.adding = false;
              },
            }); // 👈 bukan onSubmit lagi
          });

          cancelBtn?.addEventListener('click', () => {
            this.adding = false;
            Swal.close();
          });
        }
      });


    } else {
      this.toastr.error("Data tidak valid")

    }
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

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listOrderData[index];
    let totalQtySum = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaKecil);

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.kodeBarang)) {
      this.listEntryExpired.push({
        tglExpired: new Date(),
        keteranganTanggal: moment(new Date()).locale('id').format('D MMMM YYYY'),
        qtyTerimaBesar: Number(this.selectedExpProduct.qtyTerimaBesar || 0).toFixed(2),
        qtyTerimaKecil: Number(this.selectedExpProduct.qtyTerimaKecil || 0).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: Number(this.selectedExpProduct.konversi || 0).toFixed(2),
        totalQty: Number(totalQtySum || 0).toFixed(2),
        kodeBarang: this.selectedExpProduct.kodeBarang
      })
    }

    this.updateTotalExpired()

    this.isShowModalExpired = true;
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyTerimaBesar: 0,
      qtyTerimaKecil: 0,
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.kodeBarang
    })
  }

  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.kodeBarang);
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

  updateTotalExpired() {
    this.totalFilteredExpired = this.filteredList.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyTerimaBesar) * Number(data.konversi) +
          Number(data.qtyTerimaKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
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


  onSaveEntryExpired() {
    const totalQtyWaste = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaKecil);

    // Reset totalQtyExpired untuk kodeBarang yang sedang diproses
    this.totalQtyExpired[this.selectedExpProduct.kodeBarang] = 0;

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyTerimaBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyTerimaKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;

        // Pastikan nilai tidak undefined sebelum menambahkan
        this.totalQtyExpired[this.selectedExpProduct.kodeBarang] += item.totalQty ?? 0;
      }
    });

    // Validasi perhitungan total qty expired
    if (this.totalQtyExpired[this.selectedExpProduct.kodeBarang] !== totalQtyWaste) {
      this.toastr.error("Total Qty Expired harus sama dengan Total Qty Terima!");
    } else {
      this.isShowModalExpired = false;
    }
  }
}
