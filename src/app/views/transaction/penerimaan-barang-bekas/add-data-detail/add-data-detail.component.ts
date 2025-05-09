import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
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
  selector: 'app-add-data-detail-penerimaan-brg-bks',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailPenerimaanBrgBksComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  orders: any[] = [];
  headerBrgBks: any = JSON.parse(localStorage['headerBrgBks']);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: boolean = false;
  totalLength: number = 0;
  listEntryExpired: any[] = [];
  buttonCaptionView: String = 'Lihat';
  public loading: boolean = false;
  page = new Page();
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
  @Output() jumlahItem = new EventEmitter<number>();
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  validationExpiredMessageList: any[] = [];
  totalData: any = '0.0';
  currentSelectedForModal: number;
  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red my-datepicker-top',
    customTodayClass: 'today-highlight',
    minDate: new Date(),
  };
  protected config = AppConfig.settings.apiServer;
  selectedRowData: any;
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  buttonCaptionPrint: String = 'Cetak';
  isGenerate: boolean = false;

  constructor(
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    public helper: HelperService,
    private appService: AppService,
    private toastr: ToastrService,
    private service: AppService,
    private dataService: DataService
  ) {
    this.g.navbarVisibility = false;
    this.headerBrgBks = JSON.parse(this.headerBrgBks);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.headerBrgBks.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.headerBrgBks.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.jumlahItem.emit(this.listProductData.length);
    this.renderDataTables();
    this.loadDataPenerimaan();
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed(data: any = '') {
    this.onBatalPressed.emit(data);
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const paramUpdate = {
        returnNo: this.headerBrgBks.noDocument,
        status: 'T',
        user: this.g.getLocalstorage('inv_currentUser').namaUser,
        flagBrgBekas: 'Y',
      };

      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerBrgBks.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'P',
        noDocument: this.headerBrgBks.noDocument,
        keterangan: this.headerBrgBks.keterangan,
        kodeCabang: this.headerBrgBks.kodeCabang,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter((item) => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(
              this.headerBrgBks.tglTransaksi,
              'DD-MM-YYYY'
            ).format('D MMM YYYY'),
            tipeTransaksi: 10,
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyWasteBesar || 0,
            qtyKecil: item.qtyWasteKecil || 0,
            totalQty:
              this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
              this.helper.sanitizedNumber(item.qtyWasteKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
      };

      if(param.details.length <= 0){
        this.toastr.error('Barang penerimaan tidak boleh kosong minimal 1!');
        this.loadingSimpan = false;
        return;
      }

Swal.fire({
        ...this.g.componentKonfirmasiPosting,
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
          this.service
            .insert('/api/receiving-product-wasted/insert', param)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
              next: (res) => {
                if (!res.success) {
                  this.toastr.error(res.message);
                } else {
                  this.service
                    .updateWarehouse('/api/return-order/update', paramUpdate)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe({
                      next: (res2) => {
                        if (!res2.success) {
                          this.toastr.warning(
                            'Data berhasil diposting, tetapi update status retur gagal!'
                          );
                        } else {
                          this.toastr.success(
                            'Data production berhasil diposting dan status retur diperbarui!'
                          );
                        }
                        this.adding = false;
                        this.loadingSimpan = false;
                        this.onPreviousPressed();
                      },
                      error: () => {
                        this.toastr.warning(
                          'Data berhasil diposting, tetapi gagal update status retur!'
                        );
                        this.loadingSimpan = false;
                      },
                    });

                  this.onBackPressed(res.data);
                }
                this.adding = false;
                this.loadingSimpan = false;
              },
              error: () => {
                this.loadingSimpan = false;
              },
            });
            Swal.close();
          });
  
          cancelBtn?.addEventListener('click', () => {
            Swal.close();
            this.loadingSimpan = false;
            this.toastr.info('Posting dibatalkan');
          });
        }
      });
    }
  }

  onShowModal(index: number) {
    this.isShowModal = true;
    this.currentSelectedForModal = index;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    // dataInvalid = true;
    return dataInvalid;
  }

  listProductData: any[] = [
    {
      kodeBarang: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      totalQty: '0.00',
      isFromRetur: false,
    },
  ];

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

    if (value <= 0) {
      this.validationMessageList[index] = 'Quantity tidak boleh <= 0';
    } else {
      this.validationMessageList[index] = '';
    }

    this.listProductData[index].qtyWasteBesar = value;
    this.listProductData[index].totalQty = (
      Number(value) * Number(this.listProductData[index].konversi) +
      Number(this.listProductData[index].qtyWasteKecil)
    ).toFixed(2);
    this.updateTotalQty();
  }

  onInputQtyKecil(event: any, kodeBarang: string, index: number) {
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

    if (value <= 0) {
      this.validationMessageList[index] = 'Quantity tidak boleh <= 0';
    } else {
      this.validationMessageList[index] = '';
    }

    if (Math.round(value) >= Math.round(this.listProductData[index].konversi)) {
      this.validationMessageList[index] =
        'Quantity kecil tidak boleh >= konversi';

      this.toastr.error('Quantity kecil tidak boleh >= konversi');
      value = '0.00';
    }

    this.listProductData[index].qtyWasteKecil = value;

    this.listProductData[index].totalQty = (
      Number(this.listProductData[index].qtyWasteBesar) *
        Number(this.listProductData[index].konversi) +
      Number(value)
    ).toFixed(2);
    this.updateTotalQty();
  }

  updateTotalQty() {
    this.totalData = this.listProductData.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyWasteBesar) * Number(data.konversi) +
            Number(data.qtyWasteKecil)
        ),
      0
    );

    this.totalData = parseFloat(this.totalData).toFixed(2);
  }

  onDeleteRow(index: number, data: any) {
    this.listProductData.splice(index, 1);
    this.jumlahItem.emit(this.listProductData.length);
  }

  handleEnter(event: any, index: number) {
    event.preventDefault();

    let kodeBarang = this.listProductData[index].kodeBarang?.trim();
    if (kodeBarang !== '') {
      this.getProductRow(kodeBarang, index);
    }
  }

  getProductRow(kodeBarang: string, index: number) {
    if (kodeBarang !== '') {
      const isDuplicate = this.listProductData.some(
        (item, i) => item.kodeBarang === kodeBarang && i !== index
      );

      if (isDuplicate) {
        this.toastr.error('Barang sudah ditambahkan');
        return;
      }

      this.appService
        .getProductResep(kodeBarang)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            if (res) {
              const resepData = {
                kodeBarang: res.kodeBarang,
                namaBarang: res.namaBarang,
                konversi: res.konversi,
                satuanKecil: res.satuanKecil,
                satuanBesar: res.satuanBesar,
                qtyPemakaian: res.qtyPemakaian,
              };

              this.listProductData[index] = resepData;
            }
          },
          error: (err) => {
            // Handle error case and show error toast
            this.toastr.error('Kode barang tidak ditemukan!');
          },
        });
    }
  }

  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        // Provide page size options
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
      ],
      order: [
        [6, 'desc'],
        [0, 'asc'],
      ],
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
        };
        this.appService
          .getProductWastedList(params)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
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
          render: function (data, type, row) {
            return Number(data).toFixed(2); // Ensures two decimal places
          },
        },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang' },
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
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () => this.onPilihBarang(data));

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

  onPilihBarang(data: any) {
    let errorMessage;
    this.isShowModal = false;

    const existingItemIndex = this.listProductData.findIndex(
      (item) => item.kodeBarang === data.kodeBarang
    );

    if (existingItemIndex === -1) {
      const resepData = {
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        konversi: parseFloat(data.konversi).toFixed(2),
        satuanKecil: data.satuanKecil,
        satuanBesar: data.satuanBesar,
        qtyWasteBesar: '1.00',
        qtyWasteKecil: '0.00',
        totalQty: '1.00',
        isFromRetur: false,
      };

      this.listProductData[this.currentSelectedForModal] = resepData;
    } else {
      // If item already exists in the list
      errorMessage = 'Barang sudah ditambahkan';
    }

    // Show error if there was an issue
    if (errorMessage) {
      this.toastr.error(errorMessage);
    }
  }

  onAdd() {
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

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  loadDataPenerimaan() {
    let param = { returnNo: this.headerBrgBks?.noDocument };

    this.dataService
      .postData(
        this.config.BASE_URL_HQ + '/api/return-order/list-detail',
        param
      )
      .subscribe({
        next: (res) => {
          if (!res || !res.item) {
            console.error('Response dari API tidak valid:', res);
            return;
          }

          if (res.item.length == 0) {
            return;
          }

          this.listProductData = res.item
            .filter((item: any) => item.flagBrgBekas === 'Y') // ⬅️ only items with flagBrgBekas === 'Y'
            .map((item: any) => ({
              kodeBarang: item.itemCode,
              namaBarang: item.namaBarang,
              konversi: parseFloat(item.konversi).toFixed(2),
              qtyPemakaian: parseFloat(item.totalQty).toFixed(2),
              satuanKecil: item.uomWhKcl,
              satuanBesar: item.uomWhBsr,
              qtyWasteBesar: parseFloat(item.qtyBsr).toFixed(2),
              qtyWasteKecil: parseFloat(item.qtyKcl).toFixed(2),
              totalQty: parseFloat(item.totalQty).toFixed(2),
              isFromRetur: true,
            }));

          if (this.listProductData.length == 0) {
            this.toastr.error(
              `Data barang bekas tidak ditemukan di No Retur tersebut!`
            );
            this.onBackPressed();
          } else {
            this.isGenerate = true;
          }

          console.log('listProductData', this.isGenerate);
          this.jumlahItem.emit(this.listProductData.length);
        },
        error: (err) => {
          console.error('Terjadi kesalahan saat memanggil API:', err);
        },
      });
  }
}
