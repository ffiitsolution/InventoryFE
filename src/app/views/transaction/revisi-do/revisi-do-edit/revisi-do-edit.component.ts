import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import moment from 'moment';
import { data } from 'jquery';
import { AppConfig } from '../../../../config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';
import { CANCEL_STATUS, DEFAULT_DELAY_TIME, LS_INV_SELECTED_DELIVERY_ORDER, SEND_PRINT_STATUS_SUDAH } from '../../../../../constants';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';

@Component({
  selector: 'app-revisi-do-edit',
  templateUrl: './revisi-do-edit.component.html',
  styleUrl: './revisi-do-edit.component.scss',
})
export class RevisiDoEditComponent
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
  protected config = AppConfig.settings.apiServer;
  validationMessages: { [key: number]: string } = {};

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
  ) {
    this.g.navbarVisibility = true;
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
  }

  getDeliveryItemDetails() {
    this.loading = true;
    this.listOrderData = [];

    const params = {
      noSuratJalan: this.selectedOrder.noSuratJalan,
      kodeGudang: this.g.getUserLocationCode()
    };

    this.appService.getItemRevisiDO(params).subscribe(
      (res) => {
        this.listOrderData = res.data.map((data: any) => ({
          ...data,
          qtyBPesanOld: data.qtyBKirim,
          totalQtyPesanOld: data.totalQtyPesan,
          qtyBKirim: Number(data.qtyBKirim).toFixed(2),
          qtyKKirim: Number(data.qtyKKirim).toFixed(2),
        }));
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
      const numericQtyKecil = parseFloat(this.listOrderData[index].qtyKKirim);
      const numericQtyBesar = parseFloat(this.listOrderData[index].qtyBKirim);

      if (this.listOrderData[index]) {
        this.listOrderData[index][target.name] = numericValue;
        let newTempTotal = 0;
        if (qtyType === 'besar') {
          newTempTotal = numericValue * (this.listOrderData[index].konversi || 1) +
            (numericQtyKecil || 0);
        } else if (qtyType === 'kecil') {
          newTempTotal = numericQtyBesar * (this.listOrderData[index].konversi || 1) + numericValue;
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
    this.router.navigate(['/transaction/delivery-item']);
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

    const param = this.listOrderData
      .map((data: any) => {
        totalKirim = (parseFloat(data.qtyBKirim) * data.konversi) + (parseFloat(data.qtyKKirim));

        if (totalKirim > data.totalQtyPesanOld) {
          this.toastr.error(
            `Kode Barang: ${data.kodeBarang}, Qty Kirim (${totalKirim}) tidak boleh lebih besar dari Qty Pesan (${data.totalQtyPesanOld})`
          );
          hasInvalidData = true;
          return null; // Hentikan pemrosesan item ini
        }

        return {
          kodeBarang: data.kodeBarang,
          qtyBKirim: data.qtyBKirim,
          qtyKKirim: data.qtyKKirim,
          konversi: data.konversi,
          noSuratJalan: this.selectedOrder.noSuratJalan,
          noPesanan: this.selectedOrder.nomorPesanan
        };
      })
      .filter((item) => item !== null);

    if (hasInvalidData || param.length === 0) {
      this.adding = false;
      return;
    }

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
        this.appService.revisiQtyDo(param).subscribe({
          next: (res) => {
            if (!res.success) {
              alert(res.message);
            } else {
              this.toastr.success("Berhasil!");
              setTimeout(() => {
                this.router.navigate(["/transaction/delivery-item/revisi-do"]);
              }, DEFAULT_DELAY_TIME);
            }
            this.adding = false;
          },
          error: (err) => {
            console.error("Error saat insert:", err);
            this.adding = false;
          },
        });
      } else {
        this.toastr.info('Penyimpanan dibatalkan');
      }
    });
  }

  onBlurQtyPesanBesar(index: number) {
    const value = this.listOrderData[index].qtyBKirim;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyBKirim = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index].qtyBKirim = '0.00'; // fallback if input is not a number
    }
  }

  onBlurQtyPesanKecil(index: number) {
    const value = this.listOrderData[index].qtyKKirim;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listOrderData[index].qtyKKirim = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listOrderData[index].qtyKKirim = '0.00'; // fallback if input is not a number
    }
  }
}
