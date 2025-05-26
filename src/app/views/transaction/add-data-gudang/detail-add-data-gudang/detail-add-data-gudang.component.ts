import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslationService } from '../../../../service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Page } from '../../../../model/page';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../../config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import * as moment from 'moment';
import { data } from 'jquery';
import { HttpHeaders } from '@angular/common/http';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-detail-add-data-gudang',
  templateUrl: './detail-add-data-gudang.component.html',
  styleUrls: ['./detail-add-data-gudang.component.scss'],
})
export class AddDataDetailGudangComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  selectedOrder: any = JSON.parse(localStorage[LS_INV_SELECTED_DELIVERY_ORDER]);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  @Output() jumlahItem = new EventEmitter<number>();
  validationMessageList: string[] = [];
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  listProductData: any[] = []; 
  loadingSimpan: boolean = false; 
  @Output() onBatalPressed = new EventEmitter<string>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  page: number = 1;
  cekPrint: any;
  printData: any;
  data: { qtyWasteKecil?: any } = {};
  paramGenerateReport = {};
  isShowModalReport: boolean = false;

  protected config = AppConfig.settings.apiServer;
  listCurrentPage: number = 1;
  itemsPerPage: number = 5;
  searchListViewOrder: string = '';

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private dataService: DataService,
    private service: AppService,
    private globalService: GlobalService,
  ) {
    this.g.navbarVisibility = false;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.getDeliveryItemDetails();
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
    this.listProductData = [
      {
        kodeBarang: '',
        namaBarang: '',
        konversi: '',
        satuanKecil: '',
        satuanBesar: '',
        qtyWasteBesar: '',
        qtyWasteKecil: '',
        isConfirmed: false
      }
    ];
  }

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    console.log(this.selectedOrder);

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan,
    };

    this.appService.getDetailTransaksiPenerimaanGudang(params).subscribe(
      (res) => {
        this.listOrderData = res.detailPesanan.map((data: any) => ({
          ...data,
          KONVERSI: this.addDecimalPlaces(data.KONVERSI),
          QTY_PESAN_BESAR: this.addDecimalPlaces(data.QTY_PESAN_BESAR),
          QTY_PESAN_KECIL: this.addDecimalPlaces(data.QTY_PESAN_KECIL),
          TOTAL_QTY_PESAN: this.addDecimalPlaces(data.TOTAL_QTY_PESAN),
          TOTAL_QTY_TERIMA: this.addDecimalPlaces(data.TOTAL_QTY_PESAN),
          TOTAL_QTY_EXPIRED: this.addDecimalPlaces(data.TOTAL_QTY_EXPIRED),
          QTY_TERIMA_BESAR: this.addDecimalPlaces(data.QTY_PESAN_BESAR),
          QTY_TERIMA_KECIL: this.addDecimalPlaces(data.QTY_PESAN_KECIL),
        }));
        console.log('listorderdata1', this.listOrderData);
        this.totalLength = res?.data?.length;
        this.page = 1;
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      },
      () => {
        this.loading = false;
      }
    );
  }

  addDecimalPlaces(value: any): string {
    if (value !== undefined && value !== null) {
      return parseFloat(value).toFixed(2);
    }
    return '0';
  }

  onInputValueItemDetail(event: any, index: number): void {
    let inputValue = event.target.value;

    if (!inputValue || isNaN(inputValue)) {
      inputValue = '0.00';
    } else {
      if (!inputValue.includes('.')) {
        inputValue = inputValue + '.00';
      } else {
        let [integerPart, decimalPart] = inputValue.split('.');
        decimalPart =
          decimalPart.length > 2
            ? decimalPart.slice(0, 2)
            : decimalPart.padEnd(2, '0');
        inputValue = `${integerPart}.${decimalPart}`;
      }
    }

    event.target.value = inputValue;
    this.listOrderData[index].QTY_TERIMA_BESAR = parseFloat(inputValue);
    this.listOrderData[index].TOTAL_QTY_TERIMA =
      (
        Number(inputValue) * Number(this.listOrderData[index].KONVERSI) +
        Number(this.listOrderData[index].QTY_TERIMA_KECIL)
      ).toFixed(2);
  }

  onInputValueItemDetailkecil(event: any, index: number): void {
    let inputValue = event.target.value;

    if (!inputValue || isNaN(inputValue)) {
      inputValue = '0.00';
    } else {
      if (!inputValue.includes('.')) {
        inputValue = inputValue + '.00';
      } else {
        let [integerPart, decimalPart] = inputValue.split('.');
        decimalPart =
          decimalPart.length > 2
            ? decimalPart.slice(0, 2)
            : decimalPart.padEnd(2, '0');
        inputValue = `${integerPart}.${decimalPart}`;
      }
    }

    event.target.value = inputValue;

    this.listOrderData[index].QTY_TERIMA_KECIL = parseFloat(inputValue);
    this.listOrderData[index].TOTAL_QTY_TERIMA =
      (
        Number(this.listOrderData[index].QTY_TERIMA_BESAR) * Number(this.listOrderData[index].KONVERSI) +
        Number(inputValue)
      ).toFixed(2);

  }


  onFilterSearch(
    listData: any[],
    filterText: string,
    startAfter: number = 1
  ): any[] {
    return this.helper.applyFilterList(listData, filterText, startAfter);
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
  }

  // onBackPressed() {
  //   this.router.navigate(['/transaction/receipt-from-warehouse/tambah-data']);
  // }

  onBackPressed(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/receipt-from-warehouse/tambah-data']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  handleCetakAtauPrint(data: any) {
    this.cekPrint = data;
    this.printData = data;
  }

  onCetakAtauPrintReport(isDownload: boolean, nomorTransaksi: string) {
    const requestBody = {
      nomorTransaksi: nomorTransaksi,
      isDownload: isDownload,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
    });

    this.dataService
      .postData(
        `${this.config.BASE_URL}/api/delivery-order/report-penerimaan-dari-gudang`,
        requestBody,
        true
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          if (isDownload) {
            const a = document.createElement('a');
            a.href = url;
            a.download = 'report-penerimaan-dari-gudang.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.print();
              };
            }
          }
        },
        (error) => {
          console.error('Gagal mengambil laporan:', error);
          console.log('Gagal mengambil laporan. Silakan coba lagi.');
        }
      );
  }

  onSubmit() {
    let hasInvalidData = false; // Tambahkan flag untuk mengecek validasi
        if (!this.isDataInvalid()) {
          if (!this.listProductData || this.listProductData.length === 0) {
            Swal.fire({
              title: 'Pesan Error',
              html: 'TIDAK ADA QUANTITY YANG DIPAKAI, PERIKSA KEMBALI..!!',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
            });
            return;
          }
    Swal.fire({
      title:
        '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Posting Data</div>',
      html: `
        <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
          <p>Pastikan Semua Data Sudah Di Input Dengan Benar,<br><strong>PERIKSA SEKALI LAGI...!!</strong></p>
          <p class="text-danger" style="font-weight: bold;">DATA YANG SUDAH DI POSTING TIDAK DAPAT DIPERBAIKI ..!!</p>
        </div>
        <div class="divider my-3"></div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proses Pengiriman',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.proceedPosting();
      }
    });
  }
}

isDataInvalid() {
  let dataInvalid = false;
  dataInvalid =
    this.validationMessageList.some((msg) => msg.trim() !== '') ||
    this.validationMessageList.some((msg) => msg.trim() !== '');

  return dataInvalid;
}

  // prosesSimpanData() {
  //   this.adding = true;
  //   let hasInvalidData = false;

  //   const param: any[] = this.listOrderData
  //     .map((data: any) => {
  //       if (!data) return null;
  //       let TOTAL_QTY_PESAN = data?.TOTAL_QTY_PESAN ?? 0;
  //       let TOTAL_QTY_EXPIRED = data?.TOTAL_QTY_EXPIRED ?? 0;
  //       let TOTAL_QTY_TERIMA = data?.TOTAL_QTY_TERIMA ?? 0;

  //       if (TOTAL_QTY_EXPIRED > TOTAL_QTY_PESAN) {
  //         this.toastr.error(
  //           `Total Qty Expired (${TOTAL_QTY_EXPIRED}) tidak boleh lebih besar dari Total Qty Pesan (${TOTAL_QTY_PESAN})`
  //         );
  //         hasInvalidData = true;
  //         return null;
  //       }

  //       return {
  //         kodeGudang: data.KODE_GUDANG ?? '',
  //         nomorPesanan: data.NOMOR_PESANAN ?? '',
  //         nomorSuratJalan: this.selectedOrder.nomorSuratJan ?? '',
  //         kodeBarang: (data.KODE_BARANG ?? '').substring(0, 10),
  //         qtyDiterima: Number(data.TOTAL_QTY_TERIMA),
  //         totalQtyPesan: Number(data.TOTAL_QTY_PESAN),
  //         totalQtyExp: Number(data.TOTAL_QTY_EXPIRED),
  //         timeCounter: new Date().toISOString(),
  //       };
  //     })
  //     .filter((item) => item !== null);

  //   if (hasInvalidData) {
  //     this.adding = false;
  //     return;
  //   }

  //   this.appService.insert(
  //     // `/api/delivery-order/simpan-data-penerimaan-dari-gudang`,
  //     `/api/penerimaan-gudang/insert`,
  //     param
  //   ).subscribe((response) => {
  //       const data = response.data;
  //       if (data.some((item: any) => item.message)) {
  //         this.toastr.success('Data penerimaan berhasil disimpan!');
  //         setTimeout(() => {
  //           this.router.navigate([
  //             '/transaction/receipt-from-warehouse/display-data-dari-gudang',
  //           ]);
  //         }, 1500);
  //       } else if (data.some((item: any) => item.error)) {
  //         this.toastr.error('Gagal menyimpan: ' + data[0].error);
  //       }
  //     });
  // }

  proceedPosting() {
      this.loadingSimpan = true;

      console.log('this.headerProduction Insert :', this.selectedOrder);
      console.log('this.listProductData Insert : ', this.listProductData);
  
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tipeTransaksi: 2,
        nomorTransaksi: this.selectedOrder.nomorTransaksi,
        nomorPesanan: this.selectedOrder.nomorPesanan,
        tglSuratJalan: moment(this.selectedOrder.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
        keterangan: this.selectedOrder.notes,
        suratPesanan: "Y",
        kodePengirim: this.selectedOrder.codeDestination,
        tglTransaksi: moment(this.selectedOrder.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
        kodeBarang: this.selectedOrder.kodeBarang,
        konversi: this.selectedOrder.konversi,
        satuanKecil: this.selectedOrder.satuanKecil,
        satuanBesar: this.selectedOrder.satuanBesar,
        qtyBesar: this.selectedOrder.qtyBesar,
        qtyKecil: this.selectedOrder.qtyKecil,
        flagExpired: this.selectedOrder.flagExpired,
        totalQty: this.selectedOrder.totalQty,
        totalQtyExpired: this.selectedOrder.totalQtyExpired,
        nomorSuratJalan: this.selectedOrder.nomorSuratJan,
        hargaSatuan: this.selectedOrder.hargaSatuan,
        timeCounter: new Date().toISOString(),
        userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
        dateCreate: new Date().toISOString(),
        timeCreate: new Date().toISOString(),
        statusPosting: 'P',
        // keterangan: this.selectedOrder.noReturnPengirim + '-' + this.selectedOrder.keterangan,
        // userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
        statusSync: 'Y',
        details: this.listOrderData
          .filter((item) => item.KODE_BARANG && item.KODE_BARANG.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.selectedOrder.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
            tipeTransaksi: 2,
            kodeBarang: item.KODE_BARANG,
            konversi: item.KONVERSI,
            satuanKecil: item.SATUAN_KECIL,
            satuanBesar: item.SATUAN_BESAR,
            qtyPesanBesar: item.QTY_PESAN_BESAR || 0,
            qtyPesanKecil: item.QTY_PESAN_KECIL || 0,
            qtyTerimaBesar: item.QTY_TERIMA_BESAR || 0,
            qtyTerimaKecil: item.QTY_TERIMA_KECIL || 0,
            // flagExpired: item.flagExpired,
            flagExpired: 'Y',
            totalQty: (this.helper.sanitizedNumber(item.QTY_TERIMA_BESAR) * item.KONVERSI) +
                      this.helper.sanitizedNumber(item.QTY_TERIMA_KECIL),
            totalQtyExpired: (this.helper.sanitizedNumber(this.getExpiredData(item.KODE_BARANG).QTY_TERIMA_BESAR) * item.KONVERSI) +
                             this.helper.sanitizedNumber(this.getExpiredData(item.KODE_BARANG).QTY_TERIMA_KECIL),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
            statusSync: 'Y',
          })),
        detailsExpired: this.listEntryExpired?.map(expiredItem => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.selectedOrder.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
          tipeTransaksi: 2,
          kodeBarang: expiredItem.KODE_BARANG,
          tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format('D MMM YYYY'),
          konversi: Number(expiredItem.KONVERSI),
          qtyBesar: (-Math.abs(parseFloat(expiredItem.QTY_TERIMA_BESAR))).toFixed(2) || 0,
          qtyKecil: (-Math.abs(parseFloat(expiredItem.QTY_TERIMA_KECIL))).toFixed(2) || 0,
          totalQty: (-parseFloat(
            (Number(expiredItem.QTY_TERIMA_BESAR) * Number(expiredItem.KONVERSI) + Number(expiredItem.QTY_TERIMA_KECIL)).toFixed(2)
          )).toFixed(2),
        })) || [],
      };

      const paramUpdate = {
        // returnNo: this.selectedOrder.noReturnPengirim,
        // status: 'T',
        // user: this.g.getLocalstorage('inv_currentUser').kodeUser,
        // flagBrgBekas: 'T',
        kodeGudang: this.g.getUserLocationCode(),
        // nomorTransaksi: this.selectedOrder.nomorTransaksi,
      };
  
      Swal.fire({
        title: '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Posting Data</div>',
        html: `
          <div>Pastikan semua data sudah di input dengan benar!, <strong>PERIKSA SEKALI LAGI...!!</strong></div>
          <div style="color: red; font-weight: bold; margin-top: 10px;">
            DATA YANG SUDAH DIPOSTING TIDAK DAPAT DIPERBAIKI..!!
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '<i class="fa fa-check pe-2"></i> Proses Posting',
        cancelButtonText: '<i class="fa fa-times pe-1"></i> Batal Posting',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service
            // .insert('/api/terima-barang-retur-dari-site/insert', param)
            .insert('/api/penerimaan-gudang/insert', param)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                  this.loadingSimpan = false;
                } else {
                  this.service
                    // .updateWarehouse('/api/return-order/update', paramUpdate)
                    .insertInventory('/api/receiving-order/update-gudang', paramUpdate)

                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                      next: (res2) => {
                        if (!res2.success) {
                          this.toastr.warning('Data berhasil diposting, tetapi update status penerimaan gudang gagal!');
                        } else {
                          this.toastr.success('Data penerimaan gudang berhasil diposting dan status retur diperbarui!');
                        }
                        this.adding = false;
                        this.loadingSimpan = false;
                        this.onPreviousPressed();
                      },
                      error: () => {
                        this.toastr.warning('Data berhasil diposting, tetapi gagal update status penerimaan gudang!');
                        this.loadingSimpan = false;
                      },
                    });
                  this.onBackPressed(res.data);
                  console.log('Simpan Data :', res.data)
                }
                this.adding = false;
                this.loadingSimpan = false;
              },
              error: () => {
                this.toastr.error('Posting dibatalkan');
                this.loadingSimpan = false;
              },
            });
        } else {
          this.toastr.info('Posting dibatalkan');
          this.loadingSimpan = false;
        }
      });
    }

    getExpiredData(qtyTerimaBesar: string) {
      const filtered = this.listEntryExpired.filter(item => item.qtyTerimaBesar === qtyTerimaBesar);
  
      const totalExpired = filtered.reduce((acc, item) => {
        acc.qtyTerimaBesar += Number(item.qtyTerimaBesar) || 0;
        acc.qtyTerimaKecil += Number(item.qtyTerimaKecil) || 0;
        return acc;
      }, { qtyTerimaBesar: 0, qtyTerimaKecil: 0 });
  
      return totalExpired;
  
    }
  // COMMIT EXPIRED 
  selectedExpProduct: any = {};
  totalFilteredExpired: any = '0.0';
  isShowModalExpired: boolean = false;
  listEntryExpired: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
  get filteredListExpired() {
    return this.listEntryExpired.filter(
      (item) => item.KODE_BARANG === this.selectedExpProduct.KODE_BARANG
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
      this.validateDate(event, item.KODE_BARANG, index);
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
      (entry) => entry.KODE_BARANG === kodeBarang
    );
    console.log('tgllist', filteredEntries);

    // ✅ Validate empty input
    if (!inputDate) {
      validationMessage = 'Tanggal tidak boleh kosong!';
    } else {
      // ✅ Check if the item is expired
      const expiredData = this.listEntryExpired.find(
        (exp) => exp.KODE_BARANG === kodeBarang
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
        entry.KODE_BARANG === kodeBarang &&
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

  onInputQtyBesarExpired(event: any, KODE_BARANG: string, index: number) {
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
      (entry) => entry.KODE_BARANG === KODE_BARANG
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          QTY_TERIMA_BESAR: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].QTY_TERIMA_KECIL) <=
              0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
    }

    this.updateTotalExpired();
  }

  onInputQtyKecilExpired(event: any, KODE_BARANG: string, index: number) {
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
      (entry) => entry.KODE_GUDANG === KODE_BARANG
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        let messageValidation = '';

        if (
          parseFloat(value) +
          parseFloat(this.listEntryExpired[realIndex].QTY_TERIMA_BESAR) <=
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
          QTY_TERIMA_KECIL: value,
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
          Number(data.QTY_PESAN_BESAR) * Number(data.KONVERSI) +
          Number(data.QTY_PESAN_KECIL)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
  }

  onModalDeleteRow(KODE_BARANG: string, index: number) {
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.KODE_BARANG === KODE_BARANG
    );

    // Step 2: Find the actual index in the original list
    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.KODE_BARANG === KODE_BARANG &&
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
      QTY_PESAN_BESAR: '0.00',
      QTY_PESAN_KECIL: '0.00',
      QTY_TERIMA_BESAR: '0.00',
      QTY_TERIMA_KECIL: '0.00',
      SATUAN_KECIL: this.selectedExpProduct.SATUAN_KECIL,
      SATUAN_BESAR: this.selectedExpProduct.SATUAN_BESAR,
      KONVERSI: this.selectedExpProduct.KONVERSI,
      totalQty: '',
      KODE_BARANG: this.selectedExpProduct.KODE_BARANG
    })
  }

  onAdd(){
    this.listProductData.push({
      KODE_BARANG: '',
      NAMA_BARANG: '',
      KONVERSI: '',
      SATUAN_KECIL: '',
      SATUAN_BESAR: '',
      QTY_PESAN_BESAR: '0.00',
      QTY_PESAN_KECIL: '0.00',
      TOTAL_QTY_PESAN: '0.00',
      isConfirmed: false,
    });

    this.jumlahItem.emit(this.listProductData.length);
  }

  onFilterTextChange(newValue: string) {
    this.listCurrentPage = 1;
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listProductData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
  }

  getPaginationIndex(i: number): number {
    return (this.listCurrentPage - 1) * this.itemsPerPage + i;
  }
  onSaveEntryExpired() {
    let TOTAL_QTY_EXPIRED = 0;

    const totalQtyWaste = (this.helper.sanitizedNumber(this.selectedExpProduct.QTY_TERIMA_BESAR) *
      this.selectedExpProduct.KONVERSI) + this.helper.sanitizedNumber(this.selectedExpProduct.QTY_TERIMA_KECIL);
    console.log('iniwaste', totalQtyWaste);
    console.log('INI LIST ENTRY EXPIRED', this.listEntryExpired);
    this.listEntryExpired.forEach((item: any) => {
      if (item.KODE_BARANG === this.selectedExpProduct.KODE_BARANG) {
        item.totalQty = (this.helper.sanitizedNumber(item.QTY_TERIMA_BESAR) * item.KONVERSI) + this.helper.sanitizedNumber(item.QTY_TERIMA_KECIL);
        item.KODE_BARANG = this.selectedExpProduct.KODE_BARANG;
        TOTAL_QTY_EXPIRED += item.totalQty;
      }
    });
    console.log('ini total', TOTAL_QTY_EXPIRED);

    if (TOTAL_QTY_EXPIRED !== totalQtyWaste) {
      this.toastr.error("Total Qty Expired harus sama dengan Qty Expired");
    } else {
      this.isShowModalExpired = false;
    }
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listOrderData[index];

    const totalInputValue = parseFloat(this.selectedExpProduct.QTY_TERIMA_BESAR) + parseFloat(this.selectedExpProduct.QTY_TERIMA_KECIL);

    const maxAllowedBesar = Number(this.selectedExpProduct.QTY_PESAN_BESAR);
    const maxAllowedKecil = Number(this.selectedExpProduct.QTY_PESAN_KECIL);

    if (totalInputValue > (maxAllowedBesar + maxAllowedKecil)) {
      Swal.fire({
        title: 'Error!',
        text: 'QTY TERIMA TIDAK BOLEH LEBIH BESAR DARI QTY PESANAN... HARAP DIPERIKSA KEMBALI',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else {

      this.selectedExpProduct.TOTAL_QTY_PESAN = parseFloat(
        (
          Number(this.selectedExpProduct.QTY_PESAN_BESAR) *
          Number(this.selectedExpProduct.KONVERSI) +
          Number(this.selectedExpProduct.QTY_PESAN_KECIL)
        ).toFixed(2)
      ).toFixed(2);
      this.selectedExpProduct.KONVERSI = parseFloat(
        this.selectedExpProduct.KONVERSI
      ).toFixed(2);
      this.selectedExpProduct.QTY_PESAN_BESAR = parseFloat(
        this.selectedExpProduct.QTY_PESAN_BESAR
      ).toFixed(2);

      let totalQtySum = parseFloat(
        (
          Number(this.selectedExpProduct.QTY_PESAN_BESAR) *
          Number(this.selectedExpProduct.KONVERSI) +
          Number(this.selectedExpProduct.QTY_PESAN_KECIL)
        ).toFixed(2)
      ).toFixed(2);

      this.totalFilteredExpired = totalQtySum;
      if (
        !this.listEntryExpired.some(
          (item) => item.KODE_BARANG === this.selectedExpProduct.KODE_BARANG
        )
      ) {
        this.listEntryExpired.push({
          tglExpired: moment().add(1, 'days').toDate(),
          keteranganTanggal: moment()
            .add(1, 'days')
            .locale('id')
            .format('DD MMM YYYY'),
          QTY_PESAN_BESAR: parseFloat(
            this.selectedExpProduct.QTY_PESAN_BESAR
          ).toFixed(2),
          QTY_PESAN_KECIL: parseFloat(
            this.selectedExpProduct.QTY_PESAN_KECIL
          ).toFixed(2),
          QTY_TERIMA_BESAR: parseFloat(
            this.selectedExpProduct.QTY_TERIMA_BESAR
          ).toFixed(2),
          QTY_TERIMA_KECIL: parseFloat(
            this.selectedExpProduct.QTY_TERIMA_KECIL
          ).toFixed(2),
          SATUAN_KECIL: this.selectedExpProduct.SATUAN_KECIL,
          SATUAN_BESAR: this.selectedExpProduct.SATUAN_BESAR,
          KONVERSI: parseFloat(this.selectedExpProduct.KONVERSI).toFixed(2),
          totalQty: parseFloat(totalQtySum).toFixed(2),
          KODE_BARANG: this.selectedExpProduct.KODE_BARANG,
          validationExpiredMessageList: '',
          validationQty: '',
        });
      }

      this.isShowModalExpired = true;
    }
  }

  getTotalExpiredData(KODE_BARANG: string, KONVERSI: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.KODE_BARANG === KODE_BARANG
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.QTY_TERIMA_BESAR +=
          (Number(item.QTY_TERIMA_BESAR) || 0) * KONVERSI;
        acc.QTY_PESAN_KECIL += Number(item.QTY_TERIMA_KECIL) || 0;
        return acc;
      },
      { QTY_TERIMA_BESAR: 0, QTY_TERIMA_KECIL: 0 }
    );

    return (
      totalExpired.QTY_TERIMA_BESAR + totalExpired.QTY_TERIMA_KECIL
    ).toFixed(2);
  }

  onShowModalPrint(data: any) {
    this.paramGenerateReport = {
      nomorTransaksi: data.nomorTransaksi,
      userEntry: data.userCreate,
      jamEntry: this.globalService.transformTime(data.timeCreate),
      tglEntry: this.globalService.transformDate(data.dateCreate),
      outletBrand: 'KFC',
      kodeGudang: this.globalService.getUserLocationCode(),
      isDownloadCsv: false,
      reportName: 'cetak_pemakaian_barang',
      confirmSelection: 'Ya',
    };
    this.isShowModalReport = true;
    // this.onBackPressed();
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }
  
  
    getJumlahItem(): number {
      if (this.listOrderData.length === 0) {
        return 0;
      }
  
      // Menghitung jumlah item yang memiliki namaBarang tidak kosong
      const validItems = this.listOrderData.filter(item => item.KODE_BARANG.trim() !== "");
      return validItems.length;
    }
    
}
