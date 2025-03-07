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
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detail-add-data-gudang',
  templateUrl: './detail-add-data-gudang.component.html',
  styleUrls: ['./detail-add-data-gudang.component.scss'],
})
export class AddDataDetailGudangComponent {
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

  protected config = AppConfig.settings.apiServer;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dataService: DataService
  ) {
    this.g.navbarVisibility = true;
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

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan,
    };

    this.appService.getDetailTransaksiPenerimaanGudang(params).subscribe(
      (res) => {
        this.listOrderData = res.detailPesanan.map((data: any) => ({
          ...data,
        }));
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

  // onInputValueItemDetail(event: any, index: number) {
  //   const target = event.target;
  //   const value = target.value;

  //   if (target.type === 'number') {
  //     this.listOrderData[index][target.name] = Number(value);
  //   } else {
  //     this.listOrderData[index][target.name] = value;
  //   }
  // }

  // onFilterSearch(
  //   listData: any[],
  //   filterText: string,
  //   startAfter: number = 1
  // ): any[] {
  //   return this.helper.applyFilterList(listData, filterText, startAfter);
  // }

  // ngAfterViewInit(): void {}

  // ngOnDestroy(): void {
  //   this.g.navbarVisibility = true;
  // }

  onBackPressed() {
    this.router.navigate(['/transaction/receipt-from-warehouse/tambah-data']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    Swal.fire({
      title: 'Apa Anda Sudah Yakin?',
      text: 'Pastikan data yang dimasukkan sudah benar!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.prosesSimpan(); // Jalankan fungsi simpan
      } else {
        this.toastr.info('Penyimpanan dibatalkan');
      }
    });
  }
  

  onInputValueItemDetail(event: any, index: number) {
    const target = event.target;
    const value = target.value;

    if (target.type === 'number') {
      this.listOrderData[index][target.name] = Number(value);
    } else {
      this.listOrderData[index][target.name] = value;
    }
  }

  prosesSimpan() {
    this.adding = true;
  
    const param: any[] = this.listOrderData
      .map((data: any) => {
        if (!data) return null;
  
        let totalQtyPesan = data?.TOTAL_QTY_PESAN ?? 0;
        let totalQtyExpired = data?.TOTAL_QTY_EXPIRED ?? 0;
  
        if (data.TOTAL_QTY_EXPIRED > data.TOTAL_QTY_PESAN) {
          this.toastr.error(
            `Total Qty Expired (${totalQtyExpired}) tidak boleh lebih besar dari Total Qty Pesan (${totalQtyPesan})`
          );
          return null;
        }
  
        return {
          kodeGudang: data.KODE_GUDANG ?? '',
          nomorPesanan: data.NOMOR_PESANAN ?? '',
          nomorSuratJalan: this.selectedOrder.nomorSuratJan ?? '',
          kodeBarang: (data.KODE_BARANG ?? '').substring(0, 10),
          qtyDiterima: data.TOTAL_QTY_TERIMA.toString(),
          totalQtyPesan: data.TOTAL_QTY_PESAN,
          totalQtyExp: data.TOTAL_QTY_EXPIRED,
          timeCounter: new Date().toISOString(),
        };
      })
      .filter((item) => item !== null);
  
    if (param.length === 0) {
      this.adding = false;
      return;
    }
  
    // Simpan data ke server
    fetch(
      'http://localhost:8093/inventory/api/delivery-order/simpan-data-penerimaan-dari-gudang',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(param),
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.some((item: any) => item.message)) {
          Swal.fire({
            title: 'Sukses!',
            text: 'Data penerimaan berhasil disimpan!',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            // ✅ Navigasi ke halaman setelah penyimpanan berhasil
            this.router.navigate(['/transaction/receipt-from-warehouse/display-data-dari-gudang']);
          });
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

  handleCetakAtauPrint(isDownload: boolean) {
    this.onCetakAtauPrintReport(isDownload, this.selectedOrder.nomorPesanan);
  }

  onCetakAtauPrintReport(isDownload: boolean, nomorPesanan: string) {
    const requestBody = {
      nomorPesanan: nomorPesanan,
      isDownload: isDownload, // true untuk download, false untuk print
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
            // Download PDF
            const a = document.createElement('a');
            a.href = url;
            a.download = 'report-penerimaan-dari-gudang.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            // Print PDF (Buka di tab baru)
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
}
