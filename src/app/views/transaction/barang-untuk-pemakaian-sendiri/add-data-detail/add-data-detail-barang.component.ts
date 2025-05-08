import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  EventEmitter,
  Output,
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
  ACTION_SELECT,
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
import { DataService } from '../../../../service/data.service';
import { Page } from '../../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-add-data-detail-barang-pemakaian',
  templateUrl: './add-data-detail-barang.component.html',
  styleUrl: './add-data-detail-barang.component.scss',
})
export class AddDataDetailBarangComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  selectedRowData: any; // Added property to fix the error
  columns: any;
  orders: any[] = [];
  headerWastage: any = JSON.parse(localStorage['headerWastage']);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: boolean = false;
  totalLength: number = 0;
  // listProductData: any[] = [];
  @Output() onBatalPressed = new EventEmitter<string>();
  @Output() jumlahItem = new EventEmitter<number>();
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page: number = 1;
  isShowModal: boolean = false;
  dtOptions: DataTables.Settings = {};
  selectedRow: any[] = [];
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: string[] = [];
  isValidToSave: boolean = true;
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  indexDataDelete: any;
  isShowModalReport: boolean = false;
  paramGenerateReport = {};
  selectedExpProduct: any = {};
  data: any = {};
  isQtyKecilError: boolean = false;
  isShowModalBranch: boolean = false;
  listCurrentPage: number = 1;

  @ViewChild('formModal') formModal: any;
  today: Date = new Date();
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red',
    // minDate: this.today,
    adaptivePosition: true,
  };
  protected config = AppConfig.settings.apiServer;
  totalFilteredExpired: any = '0.0';


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
    private service: AppService
  ) {
    this.g.navbarVisibility = false;
    this.headerWastage = JSON.parse(this.headerWastage);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerWastage.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.headerWastage.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();

  }

  onInputValueItemDetail(
    event: any,
    index: number,
    type: string,
    qtyType: string
  ) {
    if (qtyType === 'besar') {
      const qtyBesar = this.listProductData[index].qtyWasteBesar;
      if (!qtyBesar || qtyBesar === '0.00') {
        this.listProductData[index].qtyWasteKecil = '0.00';
      }
    }
    if (
      this.listProductData[index].qtyPesanKecil >
      this.listProductData[index].konversi
    ) {
      this.validationMessageList[index] = 'QTY kecil harus < Konversi';
    } else {
      this.validationMessageList[index] = '';
    }

    if (
      this.listProductData[index].qtyPesanKecil != 0 ||
      this.listProductData[index].qtyPesanBesar != 0
    ) {
      this.validationMessageQtyPesanList[index] = '';
    } else {
      this.validationMessageQtyPesanList[index] =
        'Quantity Pesan tidak Boleh 0';
    }
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
    this.router.navigate(['/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri']);
  }
  onBackPressedE(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      // Cek jika ada item yang kodeBarang-nya kosong atau belum dipilih
      const invalidItems = this.listProductData.filter(item => 
        !item.kodeBarang || item.kodeBarang.trim() === ''
      );
  
      if (invalidItems.length > 0) {
        Swal.fire({
          title: 'Pesan Error',
          html: 'TIDAK ADA QUANTITY YANG DIPAKAI, PERIKSA KEMBALI..!!',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        return; // Menghentikan eksekusi jika ada item yang kodeBarang kosong
      }
  
      // Cek jika ada item yang qtyWasteBesar-nya 0 atau tidak diisi
      const invalidQty = this.listProductData.filter(item => 
        !item.qtyWasteBesar || item.qtyWasteBesar == 0
      );
  
      if (invalidQty.length > 0) {
        Swal.fire({
          title: 'Pesan Error',
          html: 'ISI QTY DENGAN BENAR... TOTAL QTY USAGE TIDAK BOLEH NOL.. PERIKSA KEMBALI..!!',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });
        return;  // Menghentikan eksekusi jika ada item yang invalid
      }
  
      // Param untuk order header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(this.headerWastage.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
        statusPosting: 'P',
        keterangan: this.headerWastage.keterangan,
        namaSaksi: this.headerWastage.namaSaksi,
        jabatanSaksi: this.headerWastage.jabatanSaksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        barangList: this.listProductData
          .filter(item => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map(item => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(this.headerWastage.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
            tipeTransaksi: 8,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyWasteBesar || 0,
            qtyKecil: item.qtyWasteKecil || 0,
            flagExpired: 'Y',
            totalQty: this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
                      this.helper.sanitizedNumber(item.qtyWasteKecil),
            totalQtyExpired: this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
                             this.helper.sanitizedNumber(item.qtyWasteKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
        detailsExpired: this.listEntryExpired?.map(expiredItem => ({
          kodeGudang: this.g.getUserLocationCode(),
          tglTransaksi: moment(this.headerWastage.tglTransaksi, 'DD-MM-YYYY').format('D MMM YYYY'),
          tipeTransaksi: 8,
          kodeBarang: expiredItem.kodeBarang,
          tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format('D MMM YYYY'),
          konversi: expiredItem.konversi,
          qtyBesar: -Math.abs(parseInt(expiredItem.qtyWasteBesar)) || 0,
          qtyKecil: -Math.abs(parseInt(expiredItem.qtyWasteKecil)) || 0,
          totalQty: -Math.abs(this.helper.sanitizedNumber(expiredItem.qtyWasteBesar) * expiredItem.konversi +
                              this.helper.sanitizedNumber(expiredItem.qtyWasteKecil)),
        })) || [],
      };
  
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
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proses Pengiriman',
        cancelButtonText: 'Batal',
      }).then(result => {
        if (result.isConfirmed) {
          this.service.insert('/api/delivery-order/simpan-data-pemakaian-barang', param).subscribe({
            next: (res) => {
              if (!res) {
                this.toastr.error(res.message);
              } else {
                setTimeout(() => {
                  this.toastr.success(res.message);
                  this.onBackPressedE(res);
                }, DEFAULT_DELAY_TIME);
              }
              this.adding = false;
            },
          });
        } else {
          this.toastr.info('Penyimpanan dibatalkan');
        }
      });
    } const invalidQty = this.listProductData.filter(item => 
      !item.qtyWasteBesar || item.qtyWasteBesar == 0
    );

    if (invalidQty.length > 0) {
      Swal.fire({
        title: 'Pesan Error',
        html: 'ISI QTY DENGAN BENAR... TOTAL QTY USAGE TIDAK BOLEH NOL.. PERIKSA KEMBALI..!!',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
      return;  
    }
  }
  
  onShowModal() {
    this.isShowModal = true;
  }

  onShowModalDelete(i: any) {
    this.indexDataDelete = i;
    this.isShowModalDelete = true;
  }

  onShowModalExpired(event: any, index: number) {
    this.selectedExpProduct = this.listProductData[index];
    let totalQtySum =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteKecil);

    if (
      !this.listEntryExpired.some(
        (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
      )
    ) {
      this.listEntryExpired.push({
        tglExpired: new Date(),
        keteranganTanggal: moment(new Date())
          .locale('id')
          .format('D MMMM YYYY'),
        qtyWasteBesar: this.selectedExpProduct.qtyWasteBesar,
        qtyWasteKecil: this.selectedExpProduct.qtyWasteKecil,
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: this.selectedExpProduct.konversi,
        totalQty: totalQtySum,
        kodeBarang: this.selectedExpProduct.kodeBarang,
      });
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
      kodeBarang: this.selectedExpProduct.kodeBarang,
    });
    const newItem = this.listEntryExpired[this.listEntryExpired.length - 1];
    this.lastAddedItem = newItem;
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
  lastAddedItem: any = null;
  currentSelectedForModal: number = 0; 

  onSaveEntryExpired() {
    let totalQtyExpired = 0;

    const totalQtyWaste =
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty =
          this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
          this.helper.sanitizedNumber(item.qtyWasteKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });

    if (totalQtyExpired > totalQtyWaste) {
      this.toastr.error('Total Qty Expired harus sama dengan Qty Waste');
    } else {
      this.isShowModalExpired = false;
    }
  }

  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.kodeBarang
    );
  }



  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.g.getUserKodeSingkat(),

        };
        this.dataService
          .postData(this.g.urlServer + '/api/product/dt-pemakaian', params)
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
        {
          title: 'Pilih Barang  ',
          className: 'text-center',
          render: (data, type, row) => {
            let isChecked = this.selectedRow.some(
              (item) => item.kodeBarang === row.kodeBarang
            )
              ? 'checked'
              : '';
            return `<input type="checkbox" class="row-checkbox" data-id="${row.kodeBarang}" ${isChecked}>`;
          },
        },
        { data: 'kodeBarang', title: 'Kode' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        {
          data: 'flagConversion',
          title: 'Conversion Factor',
          render: (data) => (data === 'Y' ? 'YA' : 'TIDAK'),
        },
        {
          data: 'statusAktif',
          title: 'Status Aktif',
          searchable: false,
          render: (data) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [8, 'desc'],
        [0, 'asc'],
      ],
      lengthMenu: [ 
        [5, 10],
        ['5', '10']
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $(row)
          .find('.row-checkbox')
          .off('change')
          .on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
            this.handleCheckboxChange(event, data);
          });

        $('td', row).on('click', (event) => {
          const checkbox = $(row).find('.row-checkbox');
          const index = this.selectedRow.findIndex((item) => item === data);

          if (index === -1) {
            this.selectedRow.push(data);
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', true);
          } else {
            this.selectedRow.splice(index, 1);
            $('td', row)
              .css({ 'background-color': '' })
              .removeClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', false);
          }
          if ($(event.target).is('.select-row')) {
            event.stopPropagation();
          }
        });
        return row;
      },
    };
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
      isConfirmed: data.flagExpired
    };
  
    this.listProductData[this.currentSelectedForModal] = resepData;
    console.log('this.listProductData:', this.listProductData);
  
    this.isShowModal = false;
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

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      // Add kodeBarang if checked
      if (
        !this.selectedRow.some((item) => item.kodeBarang === data.kodeBarang)
      ) {
        this.selectedRow.push(data);
      }
    } else {
      // Remove kodeBarang if unchecked
      this.selectedRow = this.selectedRow.filter(
        (item) => item.kodeBarang !== data.kodeBarang
      );
    }
  }

  onAddListDataBarang() {
    let errorMessage;
    console.log('test');
    this.isShowModal = false;

    for (let barang of this.selectedRow) {
      console.log('barang', barang);

      if (
        !this.listProductData.some(
          (order) => order.kodeBarang === barang.kodeBarang
        )
      ) {
        const productData = {
          totalQtyPesan: 0,
          qtyWasteBesar: '0.00',
          qtyWasteKecil: '0.00',
          namaBarang: barang?.namaBarang,
          satuanKecil: barang?.satuanKecil,
          kodeBarang: barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: barang?.konversi,
          isConfirmed: true,
          ...barang,
        };
        this.listProductData.splice(
          this.listProductData.length - 1,
          0,
          productData
        );
        this.validationMessageList.push('');
        this.validationMessageQtyPesanList.push('Quantity Pesan tidak Boleh 0');
      } else {
        errorMessage = 'Barang Baru Berhasil Ditambahkan';
      }
    }
    if (errorMessage) this.toastr.error(errorMessage);
  }

  formatNumber(data: any, type: string) {
    setTimeout(() => {
      if (type === 'besar') {
        data.qtyWasteBesar =
          data.qtyWasteBesar && !isNaN(data.qtyWasteBesar)
            ? parseFloat(data.qtyWasteBesar).toFixed(2)
            : '0.00';
      }

      if (type === 'kecil') {
        data.qtyWasteKecil =
          data.qtyWasteKecil && !isNaN(data.qtyWasteKecil)
            ? parseFloat(data.qtyWasteKecil).toFixed(2)
            : '0.00';
      }
    }, 50);
  }

  allowNumbersOnly(event: any): void {
    const inputValue = event.target.value;
    event.target.value = inputValue.replace(/[^0-9]/g, '');
  }

  addDecimalPlaces(event: any): void {
    let inputValue = event.target.value;

    if (inputValue && !inputValue.includes('.')) {
      inputValue = inputValue + '.00';
    }

    event.target.value = inputValue;
    this.data.qtyWasteKecil = event.target.value;
  }

  checkMaxValue(event: any, i: number): void {
    console.log("checkmaxvalue")
    console.log("this.data.qtyWasteKeci",this.data.qtyWasteKeci)
    console.log("this.listProductData[i].konversi",this.listProductData[i].konversi)

    const konversiValue = parseFloat(this.selectedExpProduct.konversi);

    if (parseFloat(this.listProductData[i].qtyWasteKecil) > parseFloat(this.listProductData[i].konversi)) {
      console.log("1")
      this.validationMessageList[i] = "Qty Kecil Tidak Boleh Lebih Besar Dari Konversi, Silahkan Cek Lagi...!!!";
    } else {
      console.log("2")

      this.validationMessageList[i] = '';
    }
  }

  deleteBarang() {
    this.listProductData.splice(this.indexDataDelete, 1);
    this.isShowModalDelete = false;
  }

  insertDetail() {
    // param for order header detail
    const paramDetail = this.listProductData.map((item) => ({
      kodeGudang: this.headerWastage.kodeGudang,
      kodeTujuan: this.headerWastage.supplier,
      nomorPesanan: this.headerWastage.nomorPesanan,
      kodeBarang: item.kodeBarang,
      konversi: item.konversi,
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar,
      qtyPesanKecil: item.qtyPesanKecil,
      totalQtyPesan:
        this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi +
        this.helper.sanitizedNumber(item.qtyPesanKecil),
      hargaUnit: item.unitPrice,
    }));

    this.service
      .insert('/api/send-order-to-warehouse/insert-detail', paramDetail)
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
          }
          this.adding = false;
        },
      });
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
      this.validationMessageList.some((msg) => msg.trim() !== '') ||
      this.validationMessageQtyPesanList.some((msg) => msg.trim() !== '');

    return dataInvalid;
  }

  searchListViewOrder: string = ''; // Added property to fix the error

  listProductData: any[] = [
    {
      kodeBarang: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      isConfirmed: false,
    },
  ];
  tempKodeBarang: string = '';

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listProductData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }

  getProductRow(kodeBarang: string, index: number) {
    let param = { kodeBarang: kodeBarang };

    if (kodeBarang !== '') {
      const isDuplicate = this.listProductData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error('Barang sudah ditambahkan');
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

            if (index === this.listProductData.length - 1) {
              this.listProductData.push({
                kodeBarang: '',
                namaBarang: '',
                konversi: '',
                satuanKecil: '',
                satuanBesar: '',
                isConfirmed: false,
                isLoading: false,
              });
            }
          }
        },
      });
    }
  }
  onBlurQtyPesanKecil(index: number) {
    const value = this.listProductData[index].qtyWasteKecil;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyWasteKecil = parsed.toFixed(2);
    } else {
      this.listProductData[index].qtyWasteKecil = '0.00';
    }
  }

  onBlurQtyPesanBesar(index: number) {
    const value = this.listProductData[index].qtyWasteBesar;
    let parsed = Number(value);
    if (!isNaN(parsed)) {
      this.listProductData[index].qtyWasteBesar = parsed.toFixed(2);
    } else {
      this.listProductData[index].qtyWasteBesar = '0.00';
    }
  }

  undoLastAddedRow() {
    if (this.lastAddedItem) {
      const index = this.listEntryExpired.indexOf(this.lastAddedItem);
      if (index > -1) {
        this.listEntryExpired.splice(index, 1);
      }
      this.lastAddedItem = null;
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

      const expiredDate = moment(inputDate, 'DD/MM/YYYY').startOf('day').toDate();
      const today = moment().startOf('day').toDate();

      console.log('today', today);
      console.log('expiredDate', expiredDate);

      if (expiredDate < today) {
        validationMessage = `Tanggal kadaluarsa tidak boleh lebih < dari sekarang!`;
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

  simpanDataExpired() {
      const invalidDate = this.listEntryExpired.some(item => !item.tglExpired || item.tglExpired === '');

      if (invalidDate) {
        Swal.fire({
          title: 'TANGGAL SALAH!',
          text: 'Tanggal harus diisi untuk semua entri.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      let totalQtyExpiredPerRow: { [key: string]: number } = {};
      this.listEntryExpired.forEach((item: any) => {
        const kodeBarang = item.kodeBarang;
        const qtyExpired = (this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyWasteKecil);

        if (totalQtyExpiredPerRow[kodeBarang]) {
          totalQtyExpiredPerRow[kodeBarang] += qtyExpired;
        } else {
          totalQtyExpiredPerRow[kodeBarang] = qtyExpired;
        }
      });

      let totalQtyReturPerRow: { [key: string]: number } = {};
      this.listProductData.forEach((item: any) => {
        const kodeBarang = item.kodeBarang;
        const qtyRetur = (this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyWasteKecil);

        if (totalQtyReturPerRow[kodeBarang]) {
          totalQtyReturPerRow[kodeBarang] += qtyRetur;
        } else {
          totalQtyReturPerRow[kodeBarang] = qtyRetur;
        }
      });

      let allMatch = true;
      for (let kodeBarang in totalQtyExpiredPerRow) {
        if (totalQtyExpiredPerRow[kodeBarang] !== totalQtyReturPerRow[kodeBarang]) {
          allMatch = false;
          break;
        }
      }

      if (!allMatch) {
        Swal.fire({
          title: 'Total Qty Retur TIDAK SAMA dengan Qty Expired!',
          text: 'Periksa kembali total quantity per kode barang!',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else {
        this.isShowModalExpired = false;
      }
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

    closeModal(){
      this.isShowModalReport = false;
      this.disabledPrintButton = false;
    }

    getJumlahItem(): number {
      if (this.listProductData.length === 0) {
        return 0;
      }
    
      // Menghitung jumlah item yang memiliki namaBarang tidak kosong
      const validItems = this.listProductData.filter(item => item.namaBarang.trim() !== "");
      return validItems.length;
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

    onFilterTextChange(newValue: string) {
      this.listCurrentPage = 1;
      if (newValue.length >= 3) {
        this.totalLength = 1;
      } else {
        this.totalLength = this.listProductData.length;
      }
      this.listCurrentPage = this.listCurrentPage;
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

   
}
