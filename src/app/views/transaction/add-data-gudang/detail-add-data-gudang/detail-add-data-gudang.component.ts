import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
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
import { lastValueFrom, Subject } from 'rxjs';
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
  listOrderData: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  cekPrint: any;
  printData: any;
  data: { qtyWasteKecil?: any } = {};

  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private dataService: DataService
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

  onBackPressed() {
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

  onCetakAtauPrintReport(isDownload: boolean, nomorPesanan: string) {
    const requestBody = {
      nomorPesanan: nomorPesanan,
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
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Pastikan data sudah benar sebelum menyimpan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.prosesSimpanData();
      }
    });
  }

  prosesSimpanData() {
    this.adding = true;
    let hasInvalidData = false;

    const param: any[] = this.listOrderData
      .map((data: any) => {
        if (!data) return null;
        let TOTAL_QTY_PESAN = data?.TOTAL_QTY_PESAN ?? 0;
        let TOTAL_QTY_EXPIRED = data?.TOTAL_QTY_EXPIRED ?? 0;
        let TOTAL_QTY_TERIMA = data?.TOTAL_QTY_TERIMA ?? 0;

        if (TOTAL_QTY_EXPIRED > TOTAL_QTY_PESAN) {
          this.toastr.error(
            `Total Qty Expired (${TOTAL_QTY_EXPIRED}) tidak boleh lebih besar dari Total Qty Pesan (${TOTAL_QTY_PESAN})`
          );
          hasInvalidData = true;
          return null;
        }

        return {
          kodeGudang: data.KODE_GUDANG ?? '',
          nomorPesanan: data.NOMOR_PESANAN ?? '',
          nomorSuratJalan: this.selectedOrder.nomorSuratJan ?? '',
          kodeBarang: (data.KODE_BARANG ?? '').substring(0, 10),
          qtyDiterima: Number(data.TOTAL_QTY_TERIMA),
          totalQtyPesan: Number(data.TOTAL_QTY_PESAN),
          totalQtyExp: Number(data.TOTAL_QTY_EXPIRED),
          timeCounter: new Date().toISOString(),
        };
      })
      .filter((item) => item !== null);

    if (hasInvalidData) {
      this.adding = false;
      return;
    }

    fetch(
      `${this.config.BASE_URL}/api/delivery-order/simpan-data-penerimaan-dari-gudang`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(param),
      }
    )
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.some((item: any) => item.message)) {
          this.toastr.success('Data penerimaan berhasil disimpan!');
          setTimeout(() => {
            this.router.navigate([
              '/transaction/receipt-from-warehouse/display-data-dari-gudang',
            ]);
          }, 1500);
        } else if (data.some((item: any) => item.error)) {
          this.toastr.error('Gagal menyimpan: ' + data[0].error);
        }
      })
      .catch((error) => {
        this.toastr.error('Terjadi kesalahan: ' + error.message);
      })
      .finally(() => {
        this.adding = false;
      });
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
      QTY_PESAN_BESAR: 0,
      QTY_PESAN_KECIL: 0,
      SATUAN_KECIL: this.selectedExpProduct.SATUAN_KECIL,
      SATUAN_BESAR: this.selectedExpProduct.SATUAN_BESAR,
      KONVERSI: this.selectedExpProduct.KONVERSI,
      totalQty: '',
      KODE_BARANG: this.selectedExpProduct.KODE_BARANG
    })
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
    }}

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
    
}
