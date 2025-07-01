import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CANCEL_STATUS,
  DEFAULT_DELAY_TIME,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../../constants';
import { Router } from '@angular/router';
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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-data-detail-kirim-barang-return-ke-supplier',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailKirimBarangReturnKeSupplierComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  headerProduction: any = JSON.parse(
    localStorage['headerProduction']
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
  loadingSimpan: boolean = false;
  @Output() onBatalPressed = new EventEmitter<string>();
  @Output() jumlahBahanbaku  = new EventEmitter<number>();
  @Output() jumlahItem = new EventEmitter<number>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  validationExpiredMessageList: any[] = [];
  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red my-datepicker-top',
    customTodayClass: 'today-highlight',
    // minDate: new Date(),
  };
  protected config = AppConfig.settings.apiServer;
  validationMessageListSatuanBesar: any[] = [];
  validationMessageListSatuanKecil: any[] = [];
  listOrderData: any[] = [];
  barangTemp: any[] = [];
  newOrhdk: any = (localStorage.getItem('TEMP_ORDHDK') || '{}'  );
  totalFilteredExpired: any = '0.0';
  currentSelectedForModal: number;
  totalData: any = '0.0';

  selectedRowData: any;

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
    private globalService: GlobalService,
    private translationService: TranslationService,
    private dataService: DataService,
    private service: AppService,

  ) {
    this.g.navbarVisibility = false;
    this.newOrhdk = JSON.parse(this.newOrhdk);
    this.headerProduction = JSON.parse(this.headerProduction);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail kirim barang retur ke Supplier') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerProduction.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
    this.headerProduction.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.loadBahanBaku();
    this.renderDataTables();
    this.jumlahItem.emit(this.listProductData.length);
    this.listProductData = [
      {
        kodeBarang: '',
        namaBarang: '',
        qtyPesanBesar: 0,
        qtyPesanKecil: 0,
        konversi: '',
        satuanBesar: '',
        satuanKecil: '',
        isFromRetur: false,
        isConfirmed : ''
      }
    ];

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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  proceedPosting(): void {
    this.loadingSimpan = true;

    console.log('this.headerProduction Insert:', this.headerProduction);
    console.log('this.listProductData Insert:', this.listProductData);

    const param = {
      kodeGudang: this.g.getUserLocationCode(),
      tipeTujuan: 'S',
      tipeTransaksi: 6,
      kodeTujuan: this.headerProduction.kodeBarang,
      tglTransaksi: moment(this.headerProduction.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
      statusPosting: 'P',
      keterangan: `${this.headerProduction.keterangan}`,
      userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
      statusSync: 'T',
      details: this.listProductData
        .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
        .map(item => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.headerProduction.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
          tipeTransaksi: 6,
          kodeBarang: item.kodeBarang,
          konversi: item.konversi,
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          qtyBesar: item.qtyPemakaianBesar || 0,
          qtyKecil: item.qtyPemakaianKecil || 0,
          flagExpired: item.isConfirmed ? 'Y' : 'T',
          // flagExpired: item.flagExpired,
          totalQty: (this.helper.sanitizedNumber(item.qtyPemakaianBesar) * item.konversi) +
                    this.helper.sanitizedNumber(item.qtyPemakaianKecil),
          totalQtyExpired: (this.helper.sanitizedNumber(this.getExpiredData(item.kodeBarang).qtyPemakaianBesar) * item.konversi) +
                           this.helper.sanitizedNumber(this.getExpiredData(item.kodeBarang).qtyPemakaianKecil),
          hargaSatuan: 0,
          userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
          statusSync: 'T',
        })),
      detailsExpired: this.listEntryExpired?.map(expiredItem => ({
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.headerProduction.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
        tipeTransaksi: 6,
        kodeBarang: expiredItem.kodeBarang,
        tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format('D MMM YYYY'),
        konversi: Math.abs(expiredItem.konversi).toFixed(2),
        qtyBesar: (-Math.abs(parseFloat(expiredItem.qtyPemakaianBesar))).toFixed(2) || 0,
        qtyKecil: (-Math.abs(parseFloat(expiredItem.qtyPemakaianKecil))).toFixed(2) || 0,
        totalQty: (-parseFloat(
          (Number(expiredItem.qtyPemakaianBesar) * Number(expiredItem.konversi) +
           Number(expiredItem.qtyPemakaianKecil)).toFixed(2)
        )).toFixed(2),
      })) || [],
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
    }).then(result => {
      if (result.isConfirmed) {
        this.service.insert('/api/send-return-to-site/insert', param)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: (res) => {
              if (!res.success) {
                this.toastr.error(res.message);
              } else {
                console.log('res Data : ', res.data)
                this.onBackPressed(res.data);
                this.adding = false;
                this.loadingSimpan = false;
                // this.onPreviousPressed();
                this.toastr.success('Data berhasil diposting!');
              }
            },
            error: () => {
              this.toastr.error('Gagal posting data Kirim ke Supplier!');
              this.loadingSimpan = false;
            }
          });
      } else {
        this.toastr.info('Posting dibatalkan');
        this.loadingSimpan = false;
      }
    });
  }


  onSubmit() {
      if (!this.isDataInvalid()) {
        if (!this.listProductData || this.listProductData.length === 0) {
          Swal.fire({
            title: 'Pesan Error',
            html: 'Belum ada data produk yang diinput. Mohon cek kembali!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          return;
        }

        // Menambahkan pengecekan untuk kodeBarang dan namaBarang yang kosong
        const invalidItems = this.listProductData.filter(item =>
          !item.qtyPemakaianBesar || item.qtyPemakaianBesar == 0 ||
          !item.kodeBarang || !item.namaBarang
        );

        if (invalidItems.length > 0) {
          const invalidItemsList = invalidItems.map(item => `
            <li>
              ${item.kodeBarang} - ${item.namaBarang}
            </li>
          `).join('');

          Swal.fire({
            title: 'Pesan Error',
            html: `<div>Ada data dengan <b>Quantity kosong atau 0</b></div>
                  <ul style="padding-left: 20px; margin: 0;>${invalidItemsList}</ul>`,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK',
          });
          return;
        } else {
          this.proceedPosting();
        }
      }
    }

    onShowModal(localIndex: number) {
      this.currentSelectedForModal = (this.listCurrentPage - 1) * this.itemsPerPage + localIndex;
      this.isShowModal = true;
    }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listProductData[index];
    this.selectedExpProduct.totalQtyProduksi=
    parseFloat(
        (
            (Number(this.selectedExpProduct.qtyPemakaianBesar) * Number(this.selectedExpProduct.konversi)) +
            Number(this.selectedExpProduct.qtyPemakaianKecil)
        ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(this.selectedExpProduct.konversi).toFixed(2);
    this.selectedExpProduct.qtyPemakaianBesar = parseFloat(this.selectedExpProduct.qtyPemakaianBesar).toFixed(2);

    let totalQtySum =  parseFloat(
          (
              (Number(this.selectedExpProduct.qtyPemakaianBesar) * Number(this.selectedExpProduct.konversi)) +
              Number(this.selectedExpProduct.qtyPemakaianKecil)
          ).toFixed(2)
      ).toFixed(2);

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.kodeBarang)) {
      this.listEntryExpired.push({
        tglExpired: moment().add(1, 'days').toDate(),
        keteranganTanggal: moment().add(1, 'days').locale('id').format('DD MMM YYYY'),
        qtyPemakaianBesar: parseFloat(this.selectedExpProduct.qtyPemakaianBesar).toFixed(2),
        qtyPemakaianKecil: parseFloat(this.selectedExpProduct.qtyPemakaianKecil).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.kodeBarang,
        validationExpiredMessageList:'',
        validationQty:'',
      });
    }

    this.isShowModalExpired = true;
    this.updateTotalExpired();
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyPemakaianBesar: '0.0',
      qtyPemakaianKecil: '0.0',
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
      totalQty: '0.0',
      kodeBarang: this.selectedExpProduct.kodeBarang,
      validationExpiredMessageList: 'Tanggal tidak boleh kosong!',
      validationQty: '',
    });
  }


  updateKeteranganTanggal(item: any, event: any, index: number): void {
    if (!item) {
      console.error('Item is null or undefined');
      return;
    }

    const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    const inputDate = typeof event === 'string'
      ? event
      : moment(event).format('DD/MM/YYYY'); // pastikan dalam format string

    if (inputDate === 'Invalid Date' || !dateFormatRegex.test(inputDate)) {
      // Jika format salah
      item.tglExpired = null;
      item.validationExpiredMessageList = 'Format tanggal tidak valid!';
      console.warn('Tanggal invalid:', item);
    } else {
      item.keteranganTanggal = moment(inputDate, 'DD/MM/YYYY')
        .locale('id')
        .format('D MMMM YYYY');

      this.validateDate(inputDate, item.kodeBarang, index);
      console.log('Item updated successfully:', item);
    }
  }

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyPemakaian =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    console.log('listEntryExpired', this.listEntryExpired);

    // Validasi data kosong
    const isInvalid = this.listEntryExpired.some((item: any) => {
      return (
        item.kodeBarang === this.selectedExpProduct.kodeBarang &&
        (!item.tglExpired || item.qtyPemakaianBesar === '' || item.keteranganTanggal === '' || item.qtyPemakaianBesar === '0.00')
      );
    });

    if (isInvalid) {
      this.toastr.error('Tanggal expired, Qty Pemakaian Besar, dan Keterangan Tanggal tidak boleh kosong.');
      return;
    }

    this.listEntryExpired.forEach((item: any) => {
      console.log('item expired', item);
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty =
          this.helper.sanitizedNumber(item.qtyPemakaianBesar) * item.konversi +
          this.helper.sanitizedNumber(item.qtyPemakaianKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });

    if (totalQtyExpired > totalQtyPemakaian) {
      this.toastr.error('Total Qty Expired harus sama dengan Qty Pemakaian');
    } else {
      this.isShowModalExpired = false;
    }
  }

  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.kodeBarang);
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/kirim-barang-return-ke-supplier/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;

    // Validasi qty retur vs expired
    const invalidItems = this.listProductData.filter(
      item =>
        item.totalQtyPemakaian !== this.getTotalExpiredData(item.kodeBarang || item.kodeBarang, item.konversi) &&
        (item.isConfirmed === true || item.isConfirmed === 'Y')
    );

    // Validasi expired error
    const invalidExpired = this.listEntryExpired.filter(
      item => item.validationExpiredMessageList !== ''
    );

    const bahanBakuList = invalidItems.map(item => `
      <li><strong>${item.kodeBarang || item.kodeBarang}</strong> - ${item.namaBarang}</li>
    `).join('');

    const expiredList = invalidExpired.map(item => `
      <li><strong>${item.kodeBarang}</strong> - ${item.namaBarang || ''}</li>
    `).join('');

    // Gabungkan semua error menjadi satu Swal (jika mau)
    if (invalidItems.length > 0 || invalidExpired.length > 0) {
      dataInvalid = true;

      let htmlContent = '';

      if (invalidItems.length > 0) {
        htmlContent += `
          <div>TOTAL QTY RETUR TIDAK SAMA DENGAN TOTAL QTY EXPIRED... PERIKSA KEMBALI..!!!</div>
          <div style="margin-top: 10px; text-align: left;">
            <ul style="padding-left: 20px;">
              ${bahanBakuList}
            </ul>
          </div>
        `;
      }

      if (invalidExpired.length > 0) {
        htmlContent += `
          <div style="margin-top: 20px;">Data tanggal expired tidak sesuai:</div>
          <div style="margin-top: 10px; text-align: left;">
            <ul style="padding-left: 20px;">
              ${expiredList}
            </ul>
          </div>
          <div style="color: red; font-weight: bold; margin-top: 10px;">
            PERIKSA KEMBALI DATA EXPIRED SEBELUM POSTING..!!
          </div>
        `;
      }

      Swal.fire({
        title: 'Pesan Error',
        html: htmlContent,
        confirmButtonText: 'OK'
      });
    }

    return dataInvalid;
  }

  listProductData: any[] = [
    { kodeBarang: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyWasteBesar: '', qtyWasteKecil: '', isConfirmed: false }
  ];
  tempKodeBarang: string = '';

  loadBahanBaku() {
    let param = { returnNo: this.headerProduction?.noReturnPengirim };
    console.log('testing header production : ', this.headerProduction);
    this.dataService
    .postData(this.config.BASE_URL_HQ + '/api/return-order/list-detail', param)
    .subscribe({
        next: (res) => {
            if (!res || !res.item) {
                console.error('Response dari API tidak valid:', res);
                return;
            }

            const filteredItems = res.item.filter((item: any) => item.flagBrgBekas === 'T');

              this.listProductData = filteredItems.map((item: any) => ({
                kodeBarang: item.itemCode,
                namaBarang: item.namaBarang,
                konversi: parseFloat(item.konversi).toFixed(2),
                qtyPemakaian: parseFloat(item.totalQty).toFixed(2),
                satuanKecil: item.uomWhKcl,
                satuanBesar: item.uomWhBsr,
                qtyPemakaianBesar: parseFloat(item.qtyBsr).toFixed(2),
                qtyPemakaianKecil: parseFloat(item.qtyKcl).toFixed(2),
                totalQtyPemakaian: parseFloat(item.totalQty).toFixed(2),
                isConfirmed: item.flagExpired === 'Y',
                flagExpired : item.flagExpired
              }));


              console.log('listProductData : ', this.listProductData)

              this.jumlahBahanbaku.emit(this.listProductData.length);
            },
        error: (err) => {
            console.error('Terjadi kesalahan saat memanggil API:', err);
        },
    });
  }

  getExpiredData(kodeBarang: string) {
    const filtered = this.listEntryExpired.filter(item => item.kodeBarang === kodeBarang);

    const totalExpired = filtered.reduce((acc, item) => {
      acc.qtyPemakaianBesar += Number(item.qtyPemakaianBesar) || 0;
      acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
      return acc;
    }, { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 });

    return totalExpired;

  }


  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(item => item.kodeBarang === kodeBarang);

    const totalExpired = filtered.reduce((acc, item) => {
      acc.qtyPemakaianBesar += (Number(item.qtyPemakaianBesar) || 0) * konversi;  // Multiply qtyPemakaianBesar by konversi
      acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
      return acc;
    }, { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 });

    return (totalExpired.qtyPemakaianBesar + totalExpired.qtyPemakaianKecil).toFixed(2);
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


  validateDate(inputDateString: string, kodeBarang: string, index: number): void {
    if (!inputDateString) {
      console.error('Input date string is null or empty');
      return;
    }

    const inputDate = moment(inputDateString, 'DD/MM/YYYY').toDate();
    const today = new Date();
    let validationMessage = '';

    console.log('Validating date:', inputDateString, 'for kodeBarang:', kodeBarang);

    // if (inputDate < today) {
    //   validationMessage = 'Tanggal kadaluarsa tidak boleh lebih kecil atau sama dengan hari ini!';
    // }

    const filteredEntries = this.listEntryExpired.filter(
      entry => entry.kodeBarang === kodeBarang
    );

    if (!inputDateString) {
      validationMessage = 'Tanggal tidak boleh kosong!';
    } else {
      const isDuplicate = filteredEntries.some((entry, idx) =>
        idx !== index &&
        moment(entry.tglExpired).format('YYYY-MM-DD') === moment(inputDate).format('YYYY-MM-DD')
      );

      if (isDuplicate) {
        validationMessage = 'Tanggal ini sudah ada dalam daftar!';
      }
    }

    const realIndex = this.listEntryExpired.findIndex(entry =>
      entry.kodeBarang === kodeBarang &&
      moment(entry.tglExpired).format('YYYY-MM-DD') ===
      moment(filteredEntries[index]?.tglExpired).format('YYYY-MM-DD')
    );

    if (realIndex !== -1) {
      this.listEntryExpired[realIndex] = {
        ...this.listEntryExpired[realIndex],
        tglExpired: inputDate,
        validationExpiredMessageList: validationMessage
      };

      console.log('Validation updated at index:', realIndex, this.listEntryExpired[realIndex]);
    } else {
      console.warn('Real index not found for validation update.');
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
          qtyPemakaianBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyPemakaianKecil) <=
            0
              ? 'Quantity tidak boleh < 0'
              : '',
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
          Number(data.qtyPemakaianBesar) * Number(data.konversi) +
            Number(data.qtyPemakaianKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
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
            parseFloat(this.listEntryExpired[realIndex].qtyPemakaianBesar) <=
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
          qtyPemakaianKecil: value,
          validationQtyKecil: messageValidation,
        };
      }
    }
    this.updateTotalExpired();
  }

  isNotNumber(value: any){
    return !/^\d+(\.\d+)?$/.test(value)
  }

  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    // const target = event.target;
    // const value = target.value;
    let validationMessage = '';



    if (this.isNotNumber(this.listProductData[index].qtyPesanKecil)) {
      this.validationMessageListSatuanKecil[index] = "QTY kecil harus angka";
    }

    else if(this.listProductData[index].qtyPesanKecil > this.listProductData[index].konversi  ){
      this.validationMessageListSatuanKecil[index] = "QTY kecil harus < Konversi";
    }
    else{
      this.validationMessageListSatuanKecil[index] = "";
    }

    if (this.isNotNumber(this.listProductData[index].qtyPesanBesar)) {
      this.validationMessageListSatuanBesar[index] = "QTY besar harus angka";
    }
    else{
      this.validationMessageListSatuanBesar[index] = "";
    }

    if(this.listProductData[index].qtyPesanKecil!=0 || this.listProductData[index].qtyPesanBesar!=0){
      this.validationMessageQtyPesanList[index] = ""
    }
    else{
      this.validationMessageQtyPesanList[index] = "Quantity Pesan tidak Boleh 0"
    }
  }

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listProductData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }


  // Saat memanggil API, pastikan default-nya terisi
  getProductRow(kodeBarang: string, index: number) {
    const param = { kodeBarang };

    if (kodeBarang !== '') {
      const isDuplicate = this.listProductData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error("Barang sudah ditambahkan");
        return;
      }

      this.appService.getProductById(param).subscribe({
        next: (res) => {
          if (res) {
            const updatedData = {
              ...this.listProductData[index],
              kodeBarang: res.kodeBarang,
              namaBarang: res.namaBarang,
              satuanKecil: res.satuanKecil || '',
              satuanBesar: res.satuanBesar || '',
              konversi: ((res.konversi ?? 1) as number).toFixed(2), 
              isConfirmed: res.flagExpired === 'Y',
              isLoading: false,
              totalQtyPesan: '0.00',
              qtyPesanKecil: '0.00',
              qtyPesanBesar: '0.00',
              qtyPemakaianKecil: '0.00',
              qtyPemakaianBesar: '0.00',
              totalQtyPemakaian: '0.00',
            };

            this.listProductData[index] = updatedData;

            if (index === this.listProductData.length - 1) {
              this.listProductData.push({ kodeBarang: '', namaBarang: '' });
            }

            this.validationMessageListSatuanKecil.push("");
            this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0");
            this.validationMessageListSatuanBesar.push("");
          }
        },
      });
    }
  }

  // Fungsi pemformatan angka ke dua desimal
  formatQty(data: any, tipe: 'besar' | 'kecil') {
    if (tipe === 'besar') {
      data.qtyPemakaianBesar = this.formatToFixed(data.qtyPemakaianBesar);
    } else {
      data.qtyPemakaianKecil = this.formatToFixed(data.qtyPemakaianKecil);
    }
  }

  formatToFixed(value: any): string {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  }

  

  onBlurQtyPesanBesar(index: number) {
    const value = this.listProductData[index].qtyPesanBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyPesanBesar = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyPesanBesar = '0.00'; // fallback if input is not a number
      this.validationMessageListSatuanBesar[index] = "";
    }
  }

  onBlurQtyPesanKecil(index: number) {
    const value = this.listProductData[index].qtyPesanKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyPesanKecil = parsed.toFixed(2); // will be a string like "4.00"
    } else {
      this.listProductData[index].qtyPesanKecil = '0.00'; // fallback if input is not a number
      this.validationMessageListSatuanKecil[index] = "";
    }
  }

  onAddListDataBarang(){
    let errorMessage
    this.isShowModal = false;

    if(this.listProductData.length !== 0){
      if (this.listProductData[this.listProductData.length - 1].namaBarang.trim() === "") {
        // If the name is empty or contains only whitespace, remove the last item
        this.listProductData.splice(this.listProductData.length - 1, 1);
      }
    }

    for (let barang of this.barangTemp) {

      if(!this.listProductData.some(order => order.kodeBarang === barang.kodeBarang)){
        this.listProductData.push({
          totalQtyPesan:(0).toFixed(2),
          qtyPesanBesar: (0).toFixed(2),
          namaBarang:  barang?.namaBarang,
          satuanKecil:barang?.satuanKecil,
          kodeBarang:barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          qtyPesanKecil: (0).toFixed(2),
          ...barang
        });
        this.validationMessageListSatuanKecil.push("")
        this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
        this.validationMessageListSatuanBesar.push("")

        console.log(this.listProductData)
      }
      else{
          errorMessage = "Beberapa barang sudah ditambahkan"
      }
    }
    if(errorMessage)
      this.toastr.error(errorMessage);


    if (this.listProductData[this.listProductData.length - 1].namaBarang.trim() !== "") {
      this.listProductData.push({
        kodeBarang: '',
        namaBarang: '',
      });
    }
  }

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
        // Add kodeBarang if checked
        if (! this.barangTemp.some(item => item.kodeBarang === data.kodeBarang)) {
            this.barangTemp.push(data);
        }
    } else {
        // Remove kodeBarang if unchecked
        this.barangTemp = this.barangTemp.filter(item => item.kodeBarang !== data.kodeBarang);
    }
  }

  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback:any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback:any) => {
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.g.getUserKodeSingkat(),
          flagBrgBekas : 'T'
        };
        this.appService.getProductReturnList(params)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
              };
              return finalData;
            });
            this.pageModal.recordsTotal = resp.recordsTotal;
            this.pageModal.recordsFiltered = resp.recordsFiltered;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode' },
        { data: 'namaBarang', title: 'Nama Barang' },
        {
          data: 'konversi',
          title: 'Konversi',
          render: function(data:any, type:any, row:any) {
            return Number(data).toFixed(2); // Ensures two decimal places
          }
        },
        { data: 'satuanBesar', title: 'Satuan Besar', },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang', },
        {
          data: 'status',
          title: 'Status',
          searchable: false,
          render: (data:any) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          orderable: false,
            render: (data: any, _: any, row: any) => {
            const disabled = row.status !== 'Aktif' ? 'disabled' : '';
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white" ${disabled}>Pilih</button>`;
          },
        },

      ],
      searchDelay: 1500,
      order: [
        [7, 'asc'],
        [1, 'asc'],
      ],
      lengthMenu: [
        [5, 10],
        ['5', '10']
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.onPilihBarang(data)
        );

        $('td', row).on('click', () => {
          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
          if (this.selectedRowData !== data) {
            this.selectedRowData = data;
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
          } else {
            this.selectedRowData = undefined;
          }
        });
        return row;
      },
    };
  }

  onInputQtyBesar(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = Math.abs(numericValue).toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    if(value <= 0){
      this.validationMessageList[index] = "Quantity tidak boleh <= 0"
    }else{
      this.validationMessageList[index] ="";
    }

    this.listProductData[index].qtyPemakaianBesar = value;
    this.listProductData[index].totalQtyPemakaian =
    (
      Number(value) * Number(this.listProductData[index].konversi) +
      Number(this.listProductData[index].qtyPemakaianKecil)
    ).toFixed(2);
    this.updateTotalQty();
  }

  updateTotalQty() {
    this.totalData = this.listProductData.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyPemakaianBesar) * Number(data.konversi) +
            Number(data.qtyPemakaianKecil)
        ),
      0
    );

    this.totalData = parseFloat(this.totalData).toFixed(
      2
    );
  }

  onInputQtyKecil(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value =  Math.abs(numericValue).toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    if(value <= 0){
      this.validationMessageList[index] = "Quantity tidak boleh <= 0"
    }else{
      this.validationMessageList[index] ="";
    }

    if( Math.round(value) >=
        Math.round(this.listProductData[index].konversi)){
        this.validationMessageList[index] = "Quantity kecil tidak boleh >= konversi"

        this.toastr.error('Quantity kecil tidak boleh >= konversi');
        value = '0.00';
    }


    this.listProductData[index].qtyPemakaianKecil = value;

    this.listProductData[index].totalQtyPemakaian =
    (
    Number(this.listProductData[index].qtyPemakaianBesar) * Number(this.listProductData[index].konversi) +
    Number(value)
    ).toFixed(2);
    this.updateTotalQty();
  }

  onDeleteRow(index: number,data:any) {
    this.listProductData.splice(index, 1);
    this.jumlahItem.emit(this.listProductData.length);
  }

  onAdd(){
    this.listProductData.push({
      kodeBarang: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '0.00',
      qtyWasteKecil: '0.00',
      totalQty: '0.00',
      isConfirmed: false,
    });

    this.jumlahItem.emit(this.listProductData.length);
  }

  onPilihBarang(data: any) {
    let errorMessage: string | undefined;

    const existingItemIndex = this.listProductData.findIndex(
      (item) => item.kodeBarang === data.kodeBarang
    );

    if (existingItemIndex !== -1) {
      errorMessage = 'Barang sudah ditambahkan!';
      this.toastr.error(errorMessage);
      return;
    }

    const resepData = {
      kodeBarang: data.kodeBarang,
      namaBarang: data.namaBarang,
      konversi: parseFloat(data.konversi).toFixed(2),
      satuanKecil: data.satuanKecil,
      satuanBesar: data.satuanBesar,
      qtyPemakaianBesar: '0.00',
      qtyPemakaianKecil: '0.00',
      totalQtyPemakaian: '0.00',
      isFromRetur: false,
      isConfirmed: data.flagExpired == 'Y' ? true : false
    };

    this.listProductData[this.currentSelectedForModal] = resepData;
    console.log('this.listProductData:', this.listProductData);

    this.isShowModal = false;
  }

  getJumlahItem(): number {
    if (this.listProductData.length === 0) {
      return 0;
    }

    // Menghitung jumlah item yang memiliki namaBarang tidak kosong
    const validItems = this.listProductData.filter(item => item.namaBarang.trim() !== "");
    return validItems.length;
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

  get listProductDataLength(): number {
    return this.filteredListViewOrder.length;
  }

  get totalListViewOrderLength(): number {
    return this.filteredListViewOrder.length;
  }

  get filteredListViewOrder() {
    if (!this.searchListViewOrder || this.searchListViewOrder.length < 3) {
      return this.listProductData;
    }
    const searchText = this.searchListViewOrder.toLowerCase();
    return this.listProductData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(searchText)
    );
  }

  getGlobalIndex(localIndex: number): number {
    return (this.listCurrentPage - 1) * this.itemsPerPage + localIndex;
  }

}
