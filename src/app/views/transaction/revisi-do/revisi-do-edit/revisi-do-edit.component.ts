import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
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
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

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
  searchListViewOrder: string = '';
  isShowModalKonfirmRevisi: boolean = false;
  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
  ) {
    this.g.navbarVisibility = false;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.getDeliveryItemDetails()
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );

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
          qtyBKirimOld: Number(data.qtyBKirim).toFixed(2),
          qtyKKirimOld: Number(data.qtyKKirim).toFixed(2),
          qtyBKirim: Number(data.qtyBKirim).toFixed(2),
          qtyKKirim: Number(data.qtyKKirim).toFixed(2),
          totalQtyKirimOld: Number(data.totalQtyKirim).toFixed(2),
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


  onFilterTextChange(newValue: string) {
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listOrderData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
  }

  get filteredList() {
    if (!this.searchListViewOrder) {
      return this.listOrderData;
    }
    const searchText = this.searchListViewOrder.toLowerCase();
    return this.listOrderData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(searchText)
    );
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

    const listItem = this.listOrderData
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
    const detailsExpired = (this.listEntryExpired || []).map(expiredItem => ({
      kodeGudang: this.g.getUserLocationCode(),
      tglTransaksi: moment(this.selectedOrder.tglTransaksi, "YYYY-MM-DD").format('D MMM YYYY'),
      tipeTransaksi: 3,
      kodeBarang: expiredItem.kodeBarang,
      tglExpired: moment(expiredItem.tglExpired, "DD-MM-YYYY").format("D MMM YYYY"),
      konversi: expiredItem.konversi,
      qtyBesar: -Math.abs(Number.parseInt(expiredItem.qtyBKirim || '0', 10)),
      qtyKecil: -Math.abs(Number.parseInt(expiredItem.qtyKKirim || '0', 10)),
      totalQty: expiredItem.totalQty ? -Math.abs(Number(expiredItem.totalQty)) : 0
    }))

    const detailsOutdtx = (this.listOrderData || [])
    .filter(item => item.kodeBarang === this.selectedRowData.kodeBarang)
    .map(item => ({
      noCounter: moment().format('DDMMYYHHmmss'),
      kodeGudang: this.g.getUserLocationCode(),
      tglTransaksi: moment(this.selectedOrder.tglTransaksi, "YYYY-MM-DD").format("D MMM YYYY"),
      tipeTransaksi: 3,
      kodeBarang: item.kodeBarang,
      konversi: parseInt(item.konversi),
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyBesarPesan: parseInt(item.qtyPesanBesar || '0', 10),
      qtyKecilPesan: parseInt(item.qtyPesanKecil || '0', 10),
      qtyBesarKirim: parseInt(item.qtyBKirimOld || '0', 10),
      qtyKecilKirim: parseInt(item.qtyKKirimOld || '0', 10),
      flagExpired: item.flagExpired,
      totalQtyKirim: parseInt(item.totalQtyKirimOld || '0', 10),
      totalQtyPesan: parseInt(item.totalQtyPesan || '0', 10),
      totalQtyExpired: parseInt(item.totalQtyKirimOld || '0', 10),
      hargaSatuan: 0,
      userCreate: JSON.parse(localStorage.getItem("inv_currentUser") || "{}").namaUser,
      revBKirim: parseInt(item.qtyBKirim || '0', 10),
      revKKirim: parseInt(item.qtyKKirim || '0', 10),
      ket1: item.ket1 || '',
      ket2: item.ket2 || '',
      statusSync: 0
    }));
  

    const param = {
      noSuratJalan: this.selectedOrder.noSuratJalan,
      listItem: listItem,
      detailsExpired: detailsExpired,
      detailsOutdtx: detailsOutdtx
    };

    if (hasInvalidData || listItem.length === 0) {
      this.adding = false;
      return;
    }

    this.appService.revisiQtyDo(param).subscribe({
      next: (res) => {
        if (!res.success) {
          this.appService.handleErrorResponse(res);
        } else {
          this.toastr.success("Berhasil revisi D.O!");
          this.getDeliveryItemDetails();
    
          this.isShowModalExpired = false;
          this.isShowModalExpiredEdit = false;
          this.isShowModalRevisi = false;
          this.isShowModalKonfirmRevisi = false;
        }
        this.adding = false;
      },
      error: (err) => {
        console.error("Error saat insert:", err);
        this.adding = false;
      },
    });
      }

  getTotalQtyRow() {
    return this.g.sumTotalQtyItem(Number.parseInt(this.selectedRowData.qtyBKirim), Number.parseInt(this.selectedRowData.qtyKKirim), Number.parseInt(this.selectedRowData.konversi));
  }

  onSubmitRevisi() {

    if (this.getTotalQtyRow() > this.selectedRowData.totalQtyPesanOld) {
      Swal.fire({
        title: 'Pesan Error',
        text: 'QTY KIRIM TIDAK BOLEH LEBIH BESAR DARI QTY PESAN..!!',
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#000080',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Kembali',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.close()
        }
      });
    } else {
      if (this.selectedRowData.flagExpired === 'Y') {
        this.onShowModalExpired()
        this.isShowModalExpiredEdit = true;
      } else {
        this.onSubmit()
      }
    }
  }

  onBlurQtyPesan(data: any, type: 'besar' | 'kecil') {
    const value = data;
    const parsed = Number(value);
    let formatted = this.g.formatToDecimal(parsed);
    if (isNaN(parsed)) {
      formatted = '0.00'; // will be a string like "4.00"
    }

    if (type === 'besar') {
      this.selectedRowData.qtyBKirim = formatted;
    } else if (type === 'kecil') {
      this.selectedRowData.qtyKKirim = formatted;
    }

    // Update juga di listOrderData berdasarkan kodeBarang yang sama
    this.listOrderData
      .filter(item => item.kodeBarang === this.selectedRowData.kodeBarang)
      .forEach(item => {
        if (type === 'besar') {
          item.qtyBKirim = formatted;
        } else if (type === 'kecil') {
          item.qtyKKirim = formatted;
        }
      });
  }

  listDataExpired: any[] = [];
  isShowModalExpired: boolean = false;
  selectedRowData: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  isShowModalRevisi: boolean = false;
  qtyBKirimOld: number = 0;
  qtyKKirimOld: number = 0;

  actionBtnClick(data: any = null) {
    this.selectedRowData = data
    const payload = {
      nomorTransaksi: this.selectedOrder.noSuratJalan,
      kodeBarang: data.kodeBarang,
      tipeTransaksi: 3,
    };

    this.appService
      .getExpiredData(payload)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res) {
            this.listDataExpired = res;
            this.isShowModalExpired = true;
          }
        },
        error: (err) => {
          // Handle error case and show error toast
          this.toastr.error('Kode barang tidak ditemukan!');
        },
      });
  }


  getTotalQty(): number {
    return this.listDataExpired.reduce((sum, item) => {
      return sum + Math.abs(Number(item.totalQty));
    }, 0);
  }

  onShowModalRevisi(data: any) {
    this.selectedRowData = data;
    this.isShowModalRevisi = true;
  }

  onCloseModal() {
    this.selectedRowData = {};
    this.isShowModalRevisi = false;
    this.isShowModalExpiredEdit = false;
    this.getDeliveryItemDetails();
  }

  // COMMIT EXPIRED 
  selectedExpProduct: any = {};
  totalFilteredExpired: any = '0.0';
  isShowModalExpiredEdit: boolean = false;
  listEntryExpired: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
    adaptivePosition: true
  };
  get filteredListExpired() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedRowData.kodeBarang
    );
  }

  updateKeteranganTanggal(item: any, event: any, index: number) {
    const dateFormatRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (event == 'Invalid Date' && !dateFormatRegex.test(item.tglExpired)) {
      // Reset if invalid format
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
          qtyBKirim: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyKKirim) <=
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
          parseFloat(this.listEntryExpired[realIndex].qtyBKirim) <=
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
          qtyKKirim: value,
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
          Number(data.qtyBKirim) * Number(data.konversi) +
          Number(data.qtyKKirim)
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
      qtyBKirim: 0,
      qtyKKirim: 0,
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.kodeBarang
    })
  }

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyWaste = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyBKirim) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyKKirim);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty = (this.helper.sanitizedNumber(item.qtyBKirim) * item.konversi) + this.helper.sanitizedNumber(item.qtyKKirim);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });


    if (totalQtyExpired !== totalQtyWaste) {
      this.toastr.error("Total Qty Expired harus sama dengan Total Qty Kirim");
    } else {
      this.isShowModalExpiredEdit = false;
      this.onShowModalKonfirmasi();
    }
  }

  onShowModalExpired() {
    this.selectedExpProduct = this.selectedRowData;
    this.selectedExpProduct.totalQtyPesan = parseFloat(
      (
        Number(this.selectedExpProduct.qtyBKirim) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyKKirim)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyBKirim = parseFloat(
      this.selectedExpProduct.qtyBKirim
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyBKirim) *
        Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyKKirim)
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
        qtyBKirim: parseFloat(
          this.selectedExpProduct.qtyBKirim
        ).toFixed(2),
        qtyKKirim: parseFloat(
          this.selectedExpProduct.qtyKKirim
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

    this.isShowModalExpiredEdit = true;
  }

  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyBKirim +=
          (Number(item.qtyBKirim) || 0) * konversi; // Multiply qtyBKirim by konversi
        acc.qtyKKirim += Number(item.qtyKKirim) || 0;
        return acc;
      },
      { qtyBKirim: 0, qtyKKirim: 0 }
    );

    return (
      totalExpired.qtyBKirim + totalExpired.qtyKKirim
    ).toFixed(2);
  }

  onShowModalKonfirmasi() {
    this.isShowModalKonfirmRevisi = true;
  }
}
