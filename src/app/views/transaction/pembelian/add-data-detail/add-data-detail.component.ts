import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
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

  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red',
  };

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => { }, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  listStatus: any[] = [
    {
      id: '1',
      name: 'Fresh',
    },
    {
      id: '2',
      name: 'Frozen',
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
          qtyTerimaBesar: data.qtyPesanBesar,
          qtyTerimaKecil: data.qtyPesanKecil,
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
        this.appService.saveDeliveryOrder(param).subscribe({

          next: (res) => {
            if (!res.success) {
              alert(res.message);
            } else {
              this.toastr.success("Berhasil!");
              setTimeout(() => {
                this.router.navigate(["/transaction/delivery-item"]);
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

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listOrderData[index];
    let totalQtySum = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyTerimaKecil);

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.kodeBarang)) {
      this.listEntryExpired.push({
        tglExpired: new Date(),
        keteranganTanggal: moment(new Date()).locale('id').format('D MMMM YYYY'),
        qtyTerimaBesar: this.selectedExpProduct.qtyTerimaBesar,
        qtyTerimaKecil: this.selectedExpProduct.qtyTerimaKecil,
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: this.selectedExpProduct.konversi,
        totalQty: totalQtySum,
        kodeBarang: this.selectedExpProduct.kodeBarang
      })
    }

    this.isShowModalExpired = true;
  }

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

  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.kodeBarang);
  }

  updateKeteranganTanggal(item: any) {
    item.keteranganTanggal = moment(item.tglExpired).locale('id').format('D MMMM YYYY');
  }

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
}
