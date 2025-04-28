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
  selector: 'app-add-data-detail-terima-barang-retur-dari-site',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailTerimaBarangReturDariSiteComponent
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
  dtOptions: DataTables.Settings = {};
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
    minDate: new Date(),
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
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
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
        konversi: 1,
        satuanBesar: '',
        satuanKecil: '',
        isFromRetur: false,
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

  onBackPressed() {
    this.onBatalPressed.emit('');
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
      if (!this.isDataInvalid()) {
        this.loadingSimpan = true;
  
        const param = {
          kodeGudang: this.g.getUserLocationCode(),
          tipeTransaksi: 9,
          kodePengirim: this.headerProduction.kodeBarang,
          tglTransaksi: moment(
            this.headerProduction.tglTransaksi,
            'DD-MM-YYYY'
          ).format('D MMM YYYY'),
          statusPosting: 'P',
          keterangan: this.headerProduction.noReturnPengirim + '-' + this.headerProduction.keterangan,
          userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
          statusSync: 'Y',
          details: this.listProductData
            .filter((item) => item.bahanBaku && item.bahanBaku.trim() !== '')
            .map((item) => ({
              kodeGudang: this.g.getUserLocationCode(),
              tglTransaksi: moment(
                this.headerProduction.tglTransaksi,
                'DD-MM-YYYY'
              ).format('D MMM YYYY'),
              tipeTransaksi: 9,
              kodeBarang: item.bahanBaku,
              konversi: item.konversi,
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              qtyBesar: item.qtyPemakaianBesar || 0,
              qtyKecil: item.qtyPemakaianKecil || 0,
              flagExpired: 'Y',
              totalQty:
                this.helper.sanitizedNumber(item.qtyPemakaianBesar) *
                  item.konversi +
                this.helper.sanitizedNumber(item.qtyPemakaianKecil),
              totalQtyExpired:
                this.helper.sanitizedNumber(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helper.sanitizedNumber(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianKecil
                ),
              hargaSatuan: 0,
              userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
              statusSync: 'Y',
            })),
            
          detailsExpired: [
            ...this.listEntryExpired?.map((expiredItem) => ({
              kodeGudang: this.g.getUserLocationCode(),
              tglTransaksi: moment(
                this.headerProduction.tglTransaksi,
                'DD-MM-YYYY'
              ).format('D MMM YYYY'),
              tipeTransaksi: 9,
              kodeBarang: expiredItem.kodeBarang,
              tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
                'D MMM YYYY'
              ),
              konversi: Math.abs(expiredItem.konversi).toFixed(2),
              qtyBesar:
                -Math.abs(parseFloat(expiredItem.qtyPemakaianBesar)).toFixed(2) ||
                0,
              qtyKecil:
                -Math.abs(parseFloat(expiredItem.qtyPemakaianKecil)).toFixed(2) ||
                0,
              totalQty: -parseFloat(
                (
                  Number(expiredItem.qtyPemakaianBesar) *
                    Number(expiredItem.konversi) +
                  Number(expiredItem.qtyPemakaianKecil)
                ).toFixed(2)
              ).toFixed(2),
            })),
          ],
        };

        const paramUpdate = {
          returnNo: this.headerProduction.noReturnPengirim,
          status: 'T',
          user: this.g.getLocalstorage('inv_currentUser').kodeUser,
          flagBrgBekas : 'T'
        };
  
        Swal.fire({
          title: 'Konfirmasi Proses Posting Data',
          html: `
            <div>Pastikan semua data sudah di input dengan benar!</div>
            <div style="color: red; font-weight: bold; margin-top: 10px;">
              DATA YANG SUDAH DIPOSTING TIDAK DAPAT DIPERBAIKI..!!
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Proses Posting',
          cancelButtonText: 'Batal Posting',
        }).then((result) => {
          if (result.isConfirmed) {
            this.service
              .insert('/api/terima-barang-retur-dari-site/insert', param)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                    this.loadingSimpan = false;
                  } else {
                    // Call update status return order
                    this.service
                      .updateWarehouse('/api/return-order/update', paramUpdate)
                      .pipe(takeUntil(this.ngUnsubscribe))
                      .subscribe({
                        next: (res2) => {
                          if (!res2.success) {
                            this.toastr.warning('Data berhasil diposting, tetapi update status retur gagal!');
                          } else {
                            this.toastr.success('Data production berhasil diposting dan status retur diperbarui!');
                          }
                          this.adding = false;
                          this.loadingSimpan = false;
                          this.onPreviousPressed();
                        },
                        error: () => {
                          this.toastr.warning('Data berhasil diposting, tetapi gagal update status retur!');
                          this.loadingSimpan = false;
                        },
                      });
                  }
                },
                error: () => {
                  this.toastr.error('Gagal posting data production!');
                  this.loadingSimpan = false;
                },
              });
          } else {
            this.toastr.info('Posting dibatalkan');
            this.loadingSimpan = false;
          }
        });
      }
    }

    onShowModal(index:number) {
      this.isShowModal = true;
      this.currentSelectedForModal = index
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

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.bahanBaku)) {
      this.listEntryExpired.push({
        tglExpired: moment().add(1, 'days').toDate(),
        keteranganTanggal: moment().add(1, 'days').locale('id').format('DD MMM YYYY'),
        qtyPemakaianBesar: parseFloat(this.selectedExpProduct.qtyPemakaianBesar).toFixed(2),
        qtyPemakaianKecil: parseFloat(this.selectedExpProduct.qtyPemakaianKecil).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.bahanBaku,
        validationExpiredMessageList:'',
        validationQty:'',
      });
    }

    this.isShowModalExpired = true;
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
      kodeBarang: this.selectedExpProduct.bahanBaku,
      validationExpiredMessageList: 'Tanggal tidak boleh kosong!',
      validationQty: '',
    });
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

  isValidQtyExpired: boolean = true;

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyPemakaian =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyPemakaianKecil);

    this.listEntryExpired.forEach((item: any) => {
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
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.bahanBaku);
  }




  onPreviousPressed(): void {
    this.router.navigate(['/transaction/terima-barang-retur-dari-site/list-dt']);
  }

  isDataInvalid() {
    let dataInvalid = false;

    const invalidItems = this.listProductData.filter(
      item => item.totalQtyPemakaian !== 
      this.getTotalExpiredData(item.bahanBaku,item.konversi)
      &&
      item.isConfirmed === true
     )
     console.log('invalidItems', invalidItems)


     console.log(this.listEntryExpired,'expired')
     const invalidExpired = this.listEntryExpired.filter(
      item => item.validationExpiredMessageList !== ''
     )

     const bahanBakuList = invalidItems.map(item => `
      <li><strong>${item.bahanBaku}</strong> - ${item.namaBarang}</li>
    `).join('');
     
    
     if (invalidItems.length > 0) {
      dataInvalid = true;
      Swal.fire({
        title: 'Pesan Error',
        html: `
        <div>TOTAL QTY RETUR TIDAK SAMA DENGAN TOTAL QTY EXPIRED... PERIKSA KEMBALI..!!!</div>
        <div style="margin-top: 10px; text-align: left;">
          <ul style="padding-left: 20px;">
            ${bahanBakuList}
          </ul>
        </div>
      `,
        confirmButtonText: 'OK'
      });
    }
  
    if (invalidExpired.length > 0) {
      dataInvalid = true;
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Tanggal Expired',
        html: `
          <div>Data tanggal expired tidak sesuai pada kode barang: <strong>${invalidExpired[0].kodeBarang}</strong></div>
          <div style="color: red; font-weight: bold; margin-top: 10px;">
            PERIKSA KEMBALI DATA EXPIRED SEBELUM POSTING..!!
          </div>
        `,
        confirmButtonText: 'OK'
      });
    }
     
    return dataInvalid
  }

  listProductData: any[] = [
    { bahanBaku: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyWasteBesar: '', qtyWasteKecil: '', isConfirmed: false }
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
                bahanBaku: item.itemCode,
                namaBarang: item.namaBarang,
                konversi: parseFloat(item.konversi).toFixed(2),
                qtyPemakaian: parseFloat(item.totalQty).toFixed(2),
                satuanKecil: item.uomWhKcl,
                satuanBesar: item.uomWhBsr,
                qtyPemakaianBesar: parseFloat(item.qtyBsr).toFixed(2),
                qtyPemakaianKecil: parseFloat(item.qtyKcl).toFixed(2),
                totalQtyPemakaian: parseFloat(item.totalQty).toFixed(2),
                isConfirmed: item.flagExpired === 'Y'
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
  

  validateDate(event: any, kodeBarang: string, index: number) {
    const inputDate = event.target.value; // Get the input date value
    let validationMessage = '';

    console.log("Input Date:", inputDate);
    console.log("Kode Barang:", kodeBarang);
  
    const expiredDate = moment(inputDate, "DD/MM/YYYY").toDate();
    const today = new Date();

    if (expiredDate < today) {
        validationMessage = `Tanggal kadaluarsa tidak boleh lebih <= dari sekarang!`;
    }
  
    const filteredEntries = this.listEntryExpired.filter(entry => entry.kodeBarang === kodeBarang);
    console.log('tgllist',filteredEntries)

    if (!inputDate) {
        validationMessage = "Tanggal tidak boleh kosong!";
    } else {
        const expiredData = this.listEntryExpired.find(exp => exp.kodeBarang === kodeBarang);
        

        // ✅ Check for duplicate expiration dates within the same kodeBarang
        const isDuplicate = filteredEntries.some((otherEntry, otherIndex) => 
            otherIndex !== index && 
            moment(otherEntry.tglExpired).format('YYYY-MM-DD') === moment(expiredDate).format('YYYY-MM-DD')
        );

        if (isDuplicate) {
            validationMessage = "Tanggal ini sudah ada dalam daftar!";
        }
    }

    const realIndex = this.listEntryExpired.findIndex(entry =>
      entry.kodeBarang === kodeBarang && entry.tglExpired === filteredEntries[index].tglExpired
    );

    if (realIndex !== -1) {
        // ✅ Update the correct entry in the original list
        this.listEntryExpired[realIndex] = {
            ...this.listEntryExpired[realIndex],
            tglExpired: expiredDate,  // Update the date in the list
            validationExpiredMessageList: validationMessage
        };

        console.log("Updated Validation:", this.listEntryExpired[realIndex]);
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
  

  getProductRow(kodeBarang: string, index: number) {
    let errorMessage
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

            this.listProductData[index].isConfirmed = true;
            this.listProductData[index].isLoading = false;
            
            this.listProductData[index].totalQtyPesan = (0).toFixed(2);
            this.listProductData[index].qtyPesanKecil = (0).toFixed(2);
            this.listProductData[index].qtyPesanBesar = (0).toFixed(2);

            // Add new properties to the object
            this.listProductData[index] = {
              ...this.listProductData[index],
              ...res  
            };


            if (index === this.listProductData.length - 1) {
              this.listProductData.push({
                kodeBarang: '',
                namaBarang: '',
              });
            }
            this.validationMessageListSatuanKecil.push("")
            this.validationMessageQtyPesanList.push("Quantity Pesan tidak Boleh 0")
            this.validationMessageListSatuanBesar.push("")
              // this.mapOrderData(data);
              // this.onSaveData();

       
          }
        },
      });
    }
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
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
        };
        this.appService.getProductWastedList(params)
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
          render: function(data, type, row) {
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
          render: (data) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          orderable: false,
          render: (data, type, row) => {
            const disabled = row.status !== 'Aktif' ? 'disabled' : '';
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white" ${disabled}>Pilih</button>`;
          },
        },

      ],
      searchDelay: 1500,
      order: [
        [6, 'desc'],
        [0, 'asc'],
       
      ],
      lengthMenu: [ 
        [8, 10],
        ['8', '10']
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

  onPilihBarang (data: any) {
    let errorMessage;
    this.isShowModal = false;
  

    const existingItemIndex = this.listProductData.findIndex(
      (item) => item.kodeBarang === data.kodeBarang
    );
  
    
    if (existingItemIndex === -1) {
      const resepData = { 
        bahanBaku: data.kodeBarang,
        namaBarang: data.namaBarang, 
        konversi: parseFloat(data.konversi).toFixed(2), 
        satuanKecil: data.satuanKecil,
        satuanBesar: data.satuanBesar, 
        qtyPemakaianBesar: '0.00',
        qtyPemakaianKecil: '0.00',
        totalQtyPemakaian: '0.00', 
        isFromRetur: false       
      };
  
    
      this.listProductData[this.currentSelectedForModal] = resepData; 

      console.log('this.listProductData :' , this.listProductData);
    
    } else {
      // If item already exists in the list
      errorMessage = 'Barang sudah ditambahkan';
    }
  
    // Show error if there was an issue
    if (errorMessage) {
      this.toastr.error(errorMessage);
    }
  }
}    