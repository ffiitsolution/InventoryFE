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
  ACTION_SELECT,
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { from, lastValueFrom, Subject } from 'rxjs';
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
  selector: 'app-add-data-detail-barang-retur',
  templateUrl: './add-detail.component.html',
  styleUrl: './add-detail.component.scss',
})
export class AddDataDetailBarangReturComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
  isValidToSave: boolean = true;
  dateRangeFilter: [Date, Date] = [new Date(), new Date()];
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  indexDataDelete: any;
  selectedExpProduct: any = {};
  fromData: any = {};
  data: any = {};
  isQtyKecilError: boolean = false;


  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
  };
  protected config = AppConfig.settings.apiServer;

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
    this.router.navigate(['/transaction/retur-ke-supplier/list-barang-retur']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      console.log('headerWastage: ', this.headerWastage)
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerWastage.tglTransaksi,
          'DD-MM-YYYY'
        ).format('YYYY-MM-DD'),
        statusPosting: 'P',
        tipeTransaksi: 6,
        tipeTujuan: 'S',
        kodeTujuan: this.headerWastage.kodeSupplier,
        // dateCreated: moment(this.dateRangeFilter[0]).format('YYYY-MM-DD'),
        // timeCreated: moment(this.dateRangeFilter[1]).format('YYYY-MM-DD'),
        keterangan: this.headerWastage.keterangan,
        namaSaksi: this.headerWastage.namaSaksi,
        jabatanSaksi: this.headerWastage.jabatanSaksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        barangList: this.listProductData
          .filter((item) => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(
              this.headerWastage.tglTransaksi,
              'DD-MM-YYYY'
            ).format('YYYY-MM-DD'),
            tipeTransaksi: '6',
            kodeBarang: item.kodeBarang,
            konversi: item.konversi,
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            qtyBesar: item.qtyWasteBesar || 0,
            qtyKecil: item.qtyWasteKecil || 0,
            flagExpired: 'Y',
            totalQty:
              this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
              this.helper.sanitizedNumber(item.qtyWasteKecil),
            totalQtyExpired:
              this.helper.sanitizedNumber(item.qtyWasteBesar) * item.konversi +
              this.helper.sanitizedNumber(item.qtyWasteKecil),
            hargaSatuan: 0,
            userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
          })),
        detailsExpired:
          this.listEntryExpired?.map((expiredItem) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(
              this.headerWastage.tglTransaksi,
              'DD-MM-YYYY'
            ).format('YYYY-MM-DD'),
            tipeTransaksi: 6,
            kodeBarang: expiredItem.kodeBarang,
            tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
              'YYYY-MM-DD'
            ),
            konversi: expiredItem.konversi,
            qtyBesar: -Math.abs(parseInt(expiredItem.qtyWasteBesar)) || 0,
            qtyKecil: -Math.abs(parseInt(expiredItem.qtyWasteKecil)) || 0,
            totalQty: expiredItem.totalQty
              ? -Math.abs(expiredItem.totalQty)
              : 0,
            flagExpired: 'Y',
          })) || [],
      };

      Swal.fire({
        title:
          'Pastikan Semua Data Yang Sudah Di Input Benar, PERIKSA SEKALI LAGI...!!!!',
        text: 'DATA YANG SUDAH DI POSTING TIDAK DAPAT DI PERBAIKI...!!!!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Simpan!',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          this.service
            .insert('/api/delivery-order/save-kirim-retur-supplier', param)
            .subscribe({
              next: (res) => {
                console.log('Response dari server:', res);

                if (!res || !res.message) {
                  this.toastr.error('Gagal menyimpan retur supplier.');
                } else {
                  setTimeout(() => {
                    this.toastr.success(res.message);
                    this.onPreviousPressed();
                  }, DEFAULT_DELAY_TIME);
                }
                this.adding = false;
              },
              error: (err) => {
                console.error('Error:', err);
                this.toastr.error(
                  'Terjadi kesalahan: ' +
                    (err.error?.message || 'Tidak diketahui')
                );
                this.adding = false;
              },
            });
        } else {
          this.toastr.info('Penyimpanan dibatalkan');
        }
      });
    } else {
      this.toastr.error('Data tidak valid');
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
  }

  updateKeteranganTanggal(item: any) {
    item.keteranganTanggal = moment(item.tglExpired)
      .locale('id')
      .format('D MMMM YYYY');
  }

  isValidQtyExpired: boolean = true;

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
      lengthMenu: [5, 10, 25, 50, 100],
      pageLength: 5,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          // defaultGudang: this.headerWastage?.kodeSingkat,
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        // this.appService.getNewReceivingOrder(params)
        this.dataService
          .postData(this.g.urlServer + '/api/product/dt-pesanan', params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.pageModal.start + index + 1,
                // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                // tglPesan: this.g.transformDate(rest.tglPesan),
                // tglKirim: this.g.transformDate(rest.tglKirim),
                // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
              };
              return finalData;
            });
            this.pageModal.recordsTotal = resp.recordsTotal;
            this.pageModal.recordsFiltered = resp.recordsFiltered;
            // this.showFilterSection = false;
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
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        {
          data: 'flagConversion',
          title: 'Conversion Factor',
          render: (data) => (data === 'Y' ? 'YA' : 'TIDAK'),
        },
        {
          data: 'statusAktif',
          title: 'Status Aktif',
          render: (data) => (data === 'A' ? 'AKTIF' : 'TIDAK AKTIF'),
        },
      ],
      searchDelay: 1000,
      // delivery: [],
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

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log('isChecked', isChecked);
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
      console.log('this.selectedRow else', this.selectedRow);
    }
    console.log('selectedRow', this.selectedRow);
  }

  // actionBtnClick(action: string, data: any = null) {
  //   this.selectedRow = (data);
  //   this.renderDataTables();
  //   this.isShowModal = false;

  //   if (!this.listProductData.some(order => order.kodeBarang === this.selectedRow.kodeBarang)) {
  //     const productData = {
  //       totalQtyPesan: 0,
  //       qtyWasteBesar: null,
  //       namaBarang: this.selectedRow?.namaBarang,
  //       satuanKecil: this.selectedRow?.satuanKecil,
  //       kodeBarang: this.selectedRow?.kodeBarang,
  //       satuanBesar: this.selectedRow?.satuanBesar,
  //       konversi: this.selectedRow?.konversi,
  //       qtyWasteKecil: null,
  //       isConfirmed: true,
  //       ...this.selectedRow
  //     }
  //     this.listProductData.splice(this.listProductData.length - 1, 0, productData);
  //   }
  //   else {
  //     this.toastr.error("Barang sudah ditambahkan");
  //   }
  // }

  // onAddListDataBarang() {
  //   let errorMessage;
  //   console.log('test');
  //   this.isShowModal = false;

  //   for (let barang of this.selectedRow) {
  //     console.log('barang', barang);

  //     if (
  //       !this.listProductData.some(
  //         (order) => order.kodeBarang === barang.kodeBarang
  //       )
  //     ) {
  //       const productData = {
  //         totalQtyPesan: 0,
  //         qtyBesar: '0',
  //         namaBarang: barang?.namaBarang,
  //         satuanKecil: barang?.satuanKecil,
  //         kodeBarang: barang?.kodeBarang,
  //         satuanBesar: barang?.satuanBesar,
  //         konversi: barang?.konversi,
  //         qtyKecil: '0',
  //         isConfirmed: true,
  //         ...barang,
  //       };
  //       this.listProductData.splice(
  //         this.listProductData.length - 1,
  //         0,
  //         productData
  //       );
  //       this.validationMessageList.push('');
  //       this.validationMessageQtyPesanList.push('Quantity Pesan tidak Boleh 0');
  //       // this.mapOrderData(data);
  //       // this.onSaveData();
  //     } else {
  //       errorMessage = 'Beberapa barang sudah ditambahkan';
  //     }
  //   }
  //   if (errorMessage) this.toastr.error(errorMessage);
  // }

  onAddListDataBarang() {
    let errorMessage;
    this.isShowModal = false;

    for (let barang of this.selectedRow) {
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
        this.validationMessageQtyPesanList.push('Quantity Pesan tidak boleh 0');
      } else {
        errorMessage = 'Beberapa barang sudah ditambahkan';
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
            alert(res.message);
          } else {
            this.toastr.success('Berhasil!');
            // setTimeout(() => {
            //   this.onPreviousPressed();
            // }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
      });
  }

  onPreviousPressed(): void {
    this.router.navigate([
      '/transaction/retur-ke-supplier/list-barang-retur',
    ]);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
      this.validationMessageList.some((msg) => msg.trim() !== '') ||
      this.validationMessageQtyPesanList.some((msg) => msg.trim() !== '');

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
}
