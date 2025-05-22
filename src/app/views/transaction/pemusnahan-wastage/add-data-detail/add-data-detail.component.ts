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
  ACTION_SELECT
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
import { DataService } from '../../../../service/data.service';
import { Page } from '../../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-wastage',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailWastageComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  headerWastage: any = JSON.parse(
    localStorage['headerWastage']
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
  // listProductData: any[] = [];
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
  listCurrentPage: number = 1;
  totalLengthList: number = 1;
  totalFilteredExpired: any = '0.0';
  @Output() dataCetak = new EventEmitter<any>();

  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private dataService: DataService,
    private service: AppService,

  ) {
    this.g.navbarVisibility = false;
    this.headerWastage = JSON.parse(this.headerWastage);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerWastage.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.headerWastage.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();

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
          qtyWasteBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyWasteKecil) <=
              0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
    }

    this.updateTotalExpired();
  }

  getExpiredData(kodeBarang: string) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyWasteBesar += Number(item.qtyWasteBesar) || 0;
        acc.qtyWasteKecil += Number(item.qtyWasteKecil) || 0;
        return acc;
      },
      { qtyWasteBesar: 0, qtyWasteKecil: 0 }
    );

    return totalExpired;
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
          parseFloat(this.listEntryExpired[realIndex].qtyWasteBesar) <=
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
          qtyWasteKecil: value,
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
          Number(data.qtyWasteBesar) * Number(data.konversi) +
          Number(data.qtyWasteKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    if (this.listProductData[index].qtyPesanKecil > this.listProductData[index].konversi) {
      this.validationMessageList[index] = "QTY kecil harus < Konversi";
    }
    else {
      this.validationMessageList[index] = "";
    }

    if (this.listProductData[index].qtyPesanKecil != 0 || this.listProductData[index].qtyPesanBesar != 0) {
      this.validationMessageQtyPesanList[index] = ""
    }
    else {
      this.validationMessageQtyPesanList[index] = "Quantity Pesan tidak Boleh 0"
    }
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
    this.router.navigate(['/order/send-order-to-warehouse/add']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.adding = true;
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.headerWastage.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
        statusPosting: 'P',
        keterangan: this.headerWastage.keterangan,
        namaSaksi: this.headerWastage.namaSaksi,
        jabatanSaksi: this.headerWastage.jabatanSaksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map(item => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.headerWastage.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
            tipeTransaksi: 4,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyWasteBesar || 0,
            qtyKecil: item.qtyWasteKecil || 0,
            flagExpired: 'Y',
            totalQty: (this.helper.sanitizedNumber(item.qtyWasteBesar) *
              item.konversi) + this.helper.sanitizedNumber(item.qtyWasteKecil),
            totalQtyExpired: (this.helper.sanitizedNumber(item.qtyWasteBesar) *
              item.konversi) + this.helper.sanitizedNumber(item.qtyWasteKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
        detailsExpired: this.listEntryExpired?.map(expiredItem => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.headerWastage.tglTransaksi, "DD-MM-YYYY").format("D MMM YYYY"),
          tipeTransaksi: 4,
          kodeBarang: expiredItem.kodeBarang,
          tglExpired: moment(expiredItem.tglExpired, "DD-MM-YYYY").format("D MMM YYYY"),
          konversi: expiredItem.konversi,
          qtyBesar: -Math.abs(parseInt(expiredItem.qtyWasteBesar)) || 0,
          qtyKecil: -Math.abs(parseInt(expiredItem.qtyWasteKecil)) || 0,
          totalQty: expiredItem.totalQty ? -Math.abs(expiredItem.totalQty) : 0
        })) || []
      };


      if (this.listProductData.length < 2) {
        this.toastr.warning('Mohon pilih barang!');
        this.adding = false;
        return;
      }

      const expiredButNotEntered = this.listProductData.filter((data: any) =>
        data.kodeBarang && // pastikan kodeBarang tidak kosong
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
            this.service.insert('/api/wastage/insert', param).subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  const now = new Date();
                  const paramGenerateReport = {
                    outletBrand: 'KFC',
                    isDownloadCsv: false,
                    nomorTransaksi: res.message,
                    userEntry: this.g.getLocalstorage('inv_currentUser').namaUser,
                    jamEntry: now.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }), 
                    tglEntry: now.toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short', // atau 'long' untuk "April"
                      year: 'numeric'
                    }), // hasil: 30 Apr 2025
                    namaSaksi: param.namaSaksi,
                    jabatanSaksi: param.jabatanSaksi,
                    keterangan: param.keterangan,
                    tglTransaksi: param.tglTransaksi
                  }
                  this.dataCetak.emit(paramGenerateReport)
                  setTimeout(() => {
                    this.toastr.success("Data wastage berhasil dibuat");
                    this.router.navigate(["/transaction/wastage/add-data"]);
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
    }

    else {
      this.toastr.error("Data tidak valid")
    }

  }


  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyWasteBesar +=
          (Number(item.qtyWasteBesar) || 0) * konversi; // Multiply qtyWasteBesar by konversi
        acc.qtyWasteKecil += Number(item.qtyWasteKecil) || 0;
        return acc;
      },
      { qtyWasteBesar: 0, qtyWasteKecil: 0 }
    );

    return (
      totalExpired.qtyWasteBesar + totalExpired.qtyWasteKecil
    ).toFixed(2);
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
    this.selectedExpProduct.totalQty = parseFloat(
      (
        Number(this.selectedExpProduct.qtyWasteBesar) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyWasteKecil)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyWasteBesar = parseFloat(
      this.selectedExpProduct.qtyWasteBesar
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyWasteBesar) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyWasteKecil)
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
        qtyWasteBesar: parseFloat(
          this.selectedExpProduct.qtyWasteBesar
        ).toFixed(2),
        qtyWasteKecil: parseFloat(
          this.selectedExpProduct.qtyWasteKecil
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

  // onShowModalExpired(event: any, index: number) {
  //   this.selectedExpProduct = this.listProductData[index];
  //   let totalQtySum = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteBesar) *
  //     this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteKecil);

  //   if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.kodeBarang)) {
  //     this.listEntryExpired.push({
  //       tglExpired: new Date(),
  //       keteranganTanggal: moment(new Date()).locale('id').format('D MMMM YYYY'),
  //       qtyWasteBesar: this.selectedExpProduct.qtyWasteBesar,
  //       qtyWasteKecil: this.selectedExpProduct.qtyWasteKecil,
  //       satuanKecil: this.selectedExpProduct.satuanKecil,
  //       satuanBesar: this.selectedExpProduct.satuanBesar,
  //       konversi: this.selectedExpProduct.konversi,
  //       totalQty: totalQtySum,
  //       kodeBarang: this.selectedExpProduct.kodeBarang
  //     })
  //   }

  //   this.isShowModalExpired = true;
  // }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyWasteBesar: 0,
      qtyWasteKecil: 0,
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.kodeBarang
    })
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

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyWaste = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyWasteKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });


    if (totalQtyExpired > totalQtyWaste) {
      this.toastr.error("Total Qty Expired harus sama dengan Qty Waste");
    } else {
      this.isShowModalExpired = false;
    }
  }


  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
    );
  }


  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      order: [
        [8, 'asc'], [1, 'asc'],
      ],
      ajax: (dataTablesParameters: any, callback: any) => {

        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.headerWastage?.kodeSingkat,
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        // this.appService.getNewReceivingOrder(params)
        this.dataService
          .postData(this.g.urlServer + '/api/product/dt-pesanan', params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
                // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                // tglPesan: this.g.transformDate(rest.tglPesan),
                // tglKirim: this.g.transformDate(rest.tglKirim),
                // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
              };
              return finalData;
            });
            this.pageModal.recordsTotal = resp.recordsTotal;
            this.pageModal.recordsFiltered = resp.recordsFiltered;
            // this.showFilterSection = false;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        {
          data: 'dtIndex',
          title: 'Pilih Barang  ',
          className: 'text-center',
          render: (data: any, _: any, row: any) => {
            let isChecked = this.selectedRow.some(item => item.kodeBarang === row.kodeBarang) ? 'checked' : '';
            return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked}>`;
          }
        },
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        {
          data: 'flagConversion',
          title: 'Conversion Factor',
          render: (data: any, _: any, row: any) => {
            if (data === 'T')
              return "Tidak";
            else if (data === 'Y')
              return "Ya";

            else
              return data
          },
          orderable: true
        },
        {
          data: 'statusAktif',
          title: 'Status Aktif',
          render: (data: any, _: any, row: any) => {
            return this.globalService.getStatusAktifLabel(data, true);
          },
          orderable: true
        },
      ],
      searchDelay: 1000,
      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $(row).find('.row-checkbox').off('change').on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
          this.handleCheckboxChange(event, data);
        });

        $('td', row).on('click', (event) => {
          const checkbox = $(row).find('.row-checkbox');
          const index = this.selectedRow.findIndex(item => item === data);

          if (index === -1) {
            this.selectedRow.push(data);
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', true);
          } else {
            this.selectedRow.splice(index, 1);
            $('td', row).css({ 'background-color': '' }).removeClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', false);
          }
          if ($(event.target).is('.select-row')) {
            event.stopPropagation();
          }
        });
        return row;
      },
    };
  }

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log("isChecked", isChecked)
    if (isChecked) {
      // Add kodeBarang if checked
      if (!this.selectedRow.some(item => item.kodeBarang === data.kodeBarang)) {
        this.selectedRow.push(data);
      }
    } else {
      // Remove kodeBarang if unchecked
      this.selectedRow = this.selectedRow.filter(item => item.kodeBarang !== data.kodeBarang);
      console.log("this.selectedRow else", this.selectedRow)
    }
    console.log("selectedRow", this.selectedRow)
  }

  onAddListDataBarang() {
    let errorMessage
    console.log("test")
    this.isShowModal = false;

    for (let barang of this.selectedRow) {
      console.log("barang", barang);

      if (!this.listProductData.some(order => order.kodeBarang === barang.kodeBarang)) {
        const productData = {
          totalQtyPesan: 0,
          qtyWasteBesar: '0.00',
          namaBarang: barang?.namaBarang,
          satuanKecil: barang?.satuanKecil,
          kodeBarang: barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          qtyWasteKecil: '0.00',
          isConfirmed: true,
          ...barang
        }
        this.listProductData.splice(this.listProductData.length - 1, 0, productData);
        this.validationMessageList.push("")
        // this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
        // this.mapOrderData(data);
        // this.onSaveData();
      }
      else {
        errorMessage = "Beberapa barang sudah ditambahkan"
      }
    }
    if (errorMessage)
      this.toastr.error(errorMessage);

  }

  deleteBarang() {
    this.listProductData.splice(this.indexDataDelete, 1);
    this.isShowModalDelete = false;
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

  insertDetail() {
    // param for order header detail
    const paramDetail = this.listProductData.map(item => ({
      kodeGudang: this.headerWastage.kodeGudang,
      kodeTujuan: this.headerWastage.supplier,
      nomorPesanan: this.headerWastage.nomorPesanan,
      kodeBarang: item.kodeBarang,
      konversi: item.konversi,
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar,
      qtyPesanKecil: item.qtyPesanKecil,
      totalQtyPesan: (this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPesanKecil),
      hargaUnit: item.unitPrice
    }));


    this.service.insert('/api/send-order-to-warehouse/insert-detail', paramDetail).subscribe({
      next: (res) => {
        if (!res.success) {
          this.service.handleErrorResponse(res);
        } else {

          this.toastr.success('Berhasil!');
          // setTimeout(() => {
          //   this.onPreviousPressed();
          // }, DEFAULT_DELAY_TIME);

        }
        this.adding = false;
      },
    });
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/wastage/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
      this.validationMessageList.some(msg => msg.trim() !== "") ||
      this.validationMessageQtyPesanList.some(msg => msg.trim() !== "");

    return dataInvalid
  }

  listProductData: any[] = [
    { kodeBarang: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyWasteBesar: '', qtyWasteKecil: '', isConfirmed: false }
  ];
  tempKodeBarang: string = '';

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listProductData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }

  getProductRow(kodeBarang: string, index: number) {
    let param = { kodeBarang: kodeBarang };

    if (kodeBarang !== '') {
      const isDuplicate = this.listProductData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error("Barang sudah ditambahkan")
        return;
      }

      this.appService.getProductById(param).subscribe({
        next: (res) => {
          if (res) {
            this.listProductData[index].namaBarang = res.namaBarang;
            this.listProductData[index].satuanKecil = res.satuanKecil;
            this.listProductData[index].satuanBesar = res.satuanBesar;
            this.listProductData[index].konversi = res.konversi;
            this.listProductData[index].konversi = res.konversi;
            this.listProductData[index].qtyWasteBesar = '0.00';
            this.listProductData[index].qtyWasteKecil = '0.00';

            this.listProductData[index].isConfirmed = true;
            this.listProductData[index].isLoading = false;

            if (index === this.listProductData.length - 1) {
              this.listProductData.push({
                kodeBarang: '', namaBarang: '', konversi: '',
                satuanKecil: '', satuanBesar: '', isConfirmed: false,
                isLoading: false
              });
            }
          }
        },
      });
    }
  }

  onBlurQtyWasteBesar(index: number) {
    const value = this.listProductData[index].qtyWasteBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyWasteBesar = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyWasteBesar = '0.00'; // fallback if input is not a number
    }
  }

  onBlurQtyWasteKecil(index: number) {
    const value = this.listProductData[index].qtyWasteKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyWasteKecil = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyWasteKecil = '0.00'; // fallback if input is not a number
    }
  }

}
