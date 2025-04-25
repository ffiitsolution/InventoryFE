import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
  selector: 'app-add-data-detail-kirim-barang-return-ke-site',
  templateUrl: './add-data-detail.component.html',
  styleUrl: './add-data-detail.component.scss',
})
export class AddDataDetailKirimBarangReturnKeSiteComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() isShowDetail!: boolean;
  @Output() showDetailChange = new EventEmitter<boolean>();
  columns: any;
  orders: any[] = [];
  headerWastage: any = JSON.parse(
    localStorage['header_kirim_barang_return_ke_site']
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
  listCurrentPage: number = 1;
  totalLengthList: number = 1;

  @ViewChild('formModal') formModal: any;
  public dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-red',
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
    this.showDetailChange.emit(!this.isShowDetail);
    // this.router.navigate(['/transaction/kirim-barang-return-ke-site/ada-data']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      // param for order Header
      const param = {
        kodeGudang: this.g.getUserLocationCode(),
        tglTransaksi: moment(
          this.headerWastage.tglTransaksi,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'P',
        keterangan: this.headerWastage.keterangan,
        namaSaksi: this.headerWastage.namaSaksi,
        jabatanSaksi: this.headerWastage.jabatanSaksi,
        userCreate: this.g.getLocalstorage('inv_currentUser').namaUser,
        details: this.listProductData
          .filter((item) => item.kodeBarang && item.kodeBarang.trim() !== '')
          .map((item) => ({
            kodeGudang: this.g.getUserLocationCode(),
            tglTransaksi: moment(
              this.headerWastage.tglTransaksi,
              'DD-MM-YYYY'
            ).format('D MMM YYYY'),
            tipeTransaksi: 4,
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
            ).format('D MMM YYYY'),
            tipeTransaksi: 4,
            kodeBarang: expiredItem.kodeBarang,
            tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
              'D MMM YYYY'
            ),
            konversi: expiredItem.konversi,
            qtyBesar: -Math.abs(parseInt(expiredItem.qtyReturnBesar)) || 0,
            qtyKecil: -Math.abs(parseInt(expiredItem.qtyReturnKecil)) || 0,
            totalQty: expiredItem.totalQty
              ? -Math.abs(expiredItem.totalQty)
              : 0,
          })) || [],
      };

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
          // this.service.insert('/api/pembelian/insert', param).subscribe({
          //   next: (res) => {
          //     if (!res.success) {
          //       this.toastr.error(res.message);
          //     } else {
          //       setTimeout(() => {
          //         this.toastr.success("Data wastage berhasil dibuat");
          //         this.onPreviousPressed();
          //       }, DEFAULT_DELAY_TIME);
          //     }
          //     this.adding = false;
          //   },
          // });
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
    console.log(this.selectedExpProduct);
    this.selectedExpProduct = this.listProductData[index];
    this.selectedExpProduct.totalQtyProduksi = parseFloat(
      (
        Number(this.selectedExpProduct.qtyReturnBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyReturnKecil)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyReturnBesar = parseFloat(
      this.selectedExpProduct.qtyReturnBesar
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyReturnBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyReturnKecil)
      ).toFixed(2)
    ).toFixed(2);

    console.log(this.selectedExpProduct);

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
          .format('D MMMM YYYY'),
        qtyReturnBesar: parseFloat(
          this.selectedExpProduct.qtyReturnBesar
        ).toFixed(2),
        qtyReturnKecil: parseFloat(
          this.selectedExpProduct.qtyReturnKecil
        ).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.kodeBarang,
        validationExpiredMessageList: '',
      });
    }

    this.isShowModalExpired = true;
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyReturnBesar: 0,
      qtyReturnKecil: 0,
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
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyRetrunBesar) *
        this.selectedExpProduct.konversi +
      this.helper.sanitizedNumber(this.selectedExpProduct.qtyReturnKecil);

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.kodeBarang) {
        item.totalQty =
          this.helper.sanitizedNumber(item.qtyReturnBesar) * item.konversi +
          this.helper.sanitizedNumber(item.qtyReturnKecil);
        item.kodeBarang = this.selectedExpProduct.kodeBarang;
        totalQtyExpired += item.totalQty;
      }
    });

    console.log(this.listEntryExpired);
    console.log(totalQtyExpired);
    console.log(totalQtyWaste);

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
          defaultGudang: this.headerWastage?.kodeSingkat,
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
        {
          data: 'konversi',
          title: 'Konversi',
          render: (data) => {
            return data; // Return as is if not a number
          },
        },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        { data: 'flagConversion', title: 'Conversion Factor' },
        { data: 'statusAktif', title: 'Status Aktif' },
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
          qtyReturnBesar: null,
          namaBarang: barang?.namaBarang,
          satuanKecil: barang?.satuanKecil,
          kodeBarang: barang?.kodeBarang,
          satuanBesar: barang?.satuanBesar,
          konversi: Number(barang.konversi).toFixed(2),
          qtyReturnKecil: null,
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
        // this.mapOrderData(data);
        // this.onSaveData();
      } else {
        errorMessage = 'Beberapa barang sudah ditambahkan';
      }
    }
    if (errorMessage) this.toastr.error(errorMessage);
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
      konversi: item.konversi.toFixed(2),
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar.toFixed(2),
      qtyPesanKecil: item.qtyPesanKecil.toFixed(2),
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
            // setTimeout(() => {
            //   this.onPreviousPressed();
            // }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
      });
  }

  onPreviousPressed(): void {
    // this.router.navigate(['/transaction/wastage/list-dt']);
    this.showDetailChange.emit(!this.isShowDetail);
    console.log(1);
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
      qtyReturnBesar: '',
      qtyReturnKecil: '',
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

  formattedKonversi(data: any): string {
    return Number(data).toFixed(2);
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
            this.listProductData[index].konversi = res.konversi.toFixed(2);

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
        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyReturnKecil: value,
          validationQtyKecil:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyReturnBesar) <=
            0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
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
          qtyReturnBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyReturnKecil) <=
            0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
    }
  }

  validateDate(event: any, kodeBarang: string, index: number) {
    const inputDate = event.target.value; // Get the input date value
    let validationMessage = '';

    console.log('Input Date:', inputDate);
    console.log('Kode Barang:', kodeBarang);

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

  // onBlurQtyPesanKecil(index: number) {
  //   const value = this.listOrderData[index].qtyPesanKecil;
  //   let parsed = Number(value);
  //   if (!isNaN(parsed)) {
  //     this.listOrderData[index].qtyPesanKecil = parsed.toFixed(2); // will be a string like "4.00"
  //   } else {
  //     this.listOrderData[index].qtyPesanKecil = '0.00'; // fallback if input is not a number
  //     this.validationMessageListSatuanKecil[index] = '';
  //   }
  // }

  // onBlurQtyPesanBesar(index: number) {
  //   const value = this.listOrderData[index].qtyPesanBesar;
  //   let parsed = Number(value);
  //   if (!isNaN(parsed)) {
  //     this.listOrderData[index].qtyPesanBesar = parsed.toFixed(2); // will be a string like "4.00"
  //   } else {
  //     this.listOrderData[index].qtyPesanBesar = '0.00'; // fallback if input is not a number
  //     this.validationMessageListSatuanBesar[index] = '';
  //   }
  // }
}
