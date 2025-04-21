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

  searchListViewOrder: string = '';

    @Output() dataCetak = new EventEmitter<any>();

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService
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

    const param = this.listOrderData
      .map((data: any) => {

        totalKirim = this.helper.sanitizedNumber((data.qtyPesanBesar * data.konversi).toString()) + this.helper.sanitizedNumber(data.qtyPesanKecil);

        if (totalKirim > data.totalQtyPesanOld) {
          this.toastr.error(
            `Kode Barang: ${data.kodeBarang}, Qty Kirim (${totalKirim}) tidak boleh lebih besar dari Qty Pesan (${data.totalQtyPesanOld})`
          );
          hasInvalidData = true; // Tandai bahwa ada data tidak valid
          return null; // Hentikan pemrosesan item ini
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
          tglKirimGudang: moment(this.selectedOrder.validatedDeliveryDate, 'DD-MM-YYYY').set({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          }).format('YYYY-MM-DD HH:mm:ss.SSS'),
        };
      })
      .filter((item) => item !== null); // Hapus item yang tidak valid

    if (hasInvalidData || param.length === 0) {
      this.adding = false;
      return;
    }

    const self = this;

    Swal.fire({
      title: '<div style="color: white; background: #c0392b; padding: 12px 20px; font-size: 18px;">Konfirmasi Proses Posting Data</div>',
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
                alert(res.message);
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


}
