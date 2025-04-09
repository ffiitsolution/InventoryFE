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

@Component({
  selector: 'app-detail-add-data-gudang',
  templateUrl: './detail-add-data-gudang.component.html',
  styleUrls: ['./detail-add-data-gudang.component.scss'],
})
export class AddDataDetailGudangComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
          TOTAL_QTY_TERIMA: this.addDecimalPlaces(data.TOTAL_QTY_TERIMA),
          TOTAL_QTY_EXPIRED: this.addDecimalPlaces(data.TOTAL_QTY_EXPIRED),
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

    this.listOrderData[index].TOTAL_QTY_EXPIRED = parseFloat(inputValue);
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
          alert('Gagal mengambil laporan. Silakan coba lagi.');
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
        let totalQtyPesan = data?.TOTAL_QTY_PESAN ?? 0;
        let totalQtyExpired = data?.TOTAL_QTY_EXPIRED ?? 0;
        let qtyDiterima = data?.TOTAL_QTY_TERIMA ?? 0;

        if (totalQtyExpired > totalQtyPesan) {
          this.toastr.error(
            `Total Qty Expired (${totalQtyExpired}) tidak boleh lebih besar dari Total Qty Pesan (${totalQtyPesan})`
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
      `${this.config.BASE_URL}inventory/api/delivery-order/simpan-data-penerimaan-dari-gudang`,
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
}
