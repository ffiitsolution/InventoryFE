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
import { DataService } from '../../../../service/data.service';
import { Page } from '../../../../model/page';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-display-data-pemakaian-barang-sendiri',
  templateUrl: './display-data-pemakaian-barang-sendiri-detail.component.html',
  styleUrl: './display-data-pemakaian-barang-sendiri-detail.component.scss',
})
export class DisplayDataPemakaianBarangSendiriComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  orders: any[] = [];
  newOrhdk: any = (localStorage.getItem('TEMP_ORDHDK') || '{}');
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
  selectedRow: any = {};
  pageModal = new Page();
  dataUser: any = {};
  validationMessageList: any[] = [];
  validationMessageQtyPesanList: any[] = [];
  isShowModalExpired: boolean = false;
  isShowModalDelete: boolean = false;
  indexDataDelete: any;
  selectedExpProduct: any = {};

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
    private service: AppService,

  ) {
    this.g.navbarVisibility = false;
    this.newOrhdk = JSON.parse(this.newOrhdk);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const isCanceled = this.newOrhdk.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.newOrhdk.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.renderDataTables();

  }



  onInputValueItemDetail(event: any, index: number, type: string, qtyType: string) {
    if (this.listProductData[index].qtyPesanKecil > this.listProductData[index].konversi) {
      this.validationMessageList[index] = "QTY kecil harus < Konversi";
    }
    else {
      this.validationMessageList[index] = "";
    }

    if (this.listProductData[index].qtyPesanKecil != 0 || this.listProductData[index].qtyPesanBesar != 0) {
      this.validationMessageQtyPesanList[index] = ""
    }
    else {
      this.validationMessageQtyPesanList[index] = "Quantity Pesan tidak Boleh 0"
    }
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
    this.router.navigate(['/transaction/barang-untuk-pemakaian-sendiri/list-barang-untuk-pemakaian-sendiri']);
  }

  onPageChange(event: number) {
    this.page = event;
  }

  formatStrDate(date: any) {
    return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      // param for order Header
      const paramHeader = this.newOrhdk;

      this.service.insert('/api/send-order-to-warehouse/insert-header', paramHeader).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.newOrhdk.nomorPesanan = res.item?.[0]?.nomorPesanan;

            this.insertDetail()
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);

          }
          this.adding = false;
        },
      });

    }

    else {
      this.toastr.error("Data tidak valid")
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
    let totalQtySum = (this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteBesar) *
      this.selectedExpProduct.konversi) + this.helper.sanitizedNumber(this.selectedExpProduct.qtyWasteKecil);

    if (!this.listEntryExpired.some(item => item.kodeBarang === this.selectedExpProduct.kodeBarang)) {
      this.listEntryExpired.push({
        tglExpired: new Date(),
        keteranganTanggal: moment(new Date()).locale('id').format('D MMMM YYYY'),
        qtyWasteBesar: this.selectedExpProduct.qtyWasteBesar,
        qtyWasteKecil: this.selectedExpProduct.qtyWasteKecil,
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
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: this.selectedExpProduct.konversi,
      totalQty: '',
      kodeBarang: this.selectedExpProduct.kodeBarang
    })
  }

  updateKeteranganTanggal(item: any) {
    item.keteranganTanggal = moment(item.tglExpired).locale('id').format('D MMMM YYYY');
  }

  isValidQtyExpired: boolean = true;

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


  get filteredList() {
    return this.listEntryExpired.filter(item => item.kodeBarang === this.selectedExpProduct.kodeBarang);
  }


  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      lengthMenu: [5, 10, 25, 50, 100],
      pageLength: 5,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {

        this.pageModal.start = dataTablesParameters.start;
        this.pageModal.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          defaultGudang: this.newOrhdk?.kodeSingkat,
          
        };
        this.dataService
          .postData(this.config.BASE_URL+'/api/delivery-order/display-data-pemakaian-barang-sendiri', params)
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
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'defaultGudang', title: 'Default Gudang' },
        { data: 'flagConversion', title: 'Conversion Factor' },
        { data: 'statusAktif', title: 'Status Aktif' },

        {
          title: 'Action',
          render: (data, type, row) => {
            return `<button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>`;
          },
        }


      ],
      searchDelay: 1000,
      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        return row;
      },
    };
  }
  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = (data);
    this.renderDataTables();
    this.isShowModal = false;

    if (!this.listProductData.some(order => order.kodeBarang === this.selectedRow.kodeBarang)) {
      const productData = {
        totalQtyPesan: 0,
        qtyWasteBesar: null,
        namaBarang: this.selectedRow?.namaBarang,
        satuanKecil: this.selectedRow?.satuanKecil,
        kodeBarang: this.selectedRow?.kodeBarang,
        satuanBesar: this.selectedRow?.satuanBesar,
        konversi: this.selectedRow?.konversi,
        qtyWasteKecil: null,
        isConfirmed: true,
        ...this.selectedRow
      }
      this.listProductData.splice(this.listProductData.length - 1, 0, productData);
    }
    else {
      this.toastr.error("Barang sudah ditambahkan");
    }
  }

  deleteBarang() {
    this.listProductData.splice(this.indexDataDelete, 1);
    this.isShowModalDelete = false;
  }

  insertDetail() {
    // param for order header detail
    const paramDetail = this.listProductData.map(item => ({
      kodeGudang: this.newOrhdk.kodeGudang,
      kodeTujuan: this.newOrhdk.supplier,
      nomorPesanan: this.newOrhdk.nomorPesanan,
      kodeBarang: item.kodeBarang,
      konversi: item.konversi,
      satuanKecil: item.satuanKecil,
      satuanBesar: item.satuanBesar,
      qtyPesanBesar: item.qtyPesanBesar,
      qtyPesanKecil: item.qtyPesanKecil,
      totalQtyPesan: (this.helper.sanitizedNumber(item.qtyPesanBesar) * item.konversi) + this.helper.sanitizedNumber(item.qtyPesanKecil),
      hargaUnit: item.unitPrice
    }));


    this.service.insert('/api/send-order-to-warehouse/insert-detail', paramDetail).subscribe({
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
    this.router.navigate(['order/send-order-to-warehouse']);
  }

  isDataInvalid() {
    let dataInvalid = false;
    dataInvalid =
      this.validationMessageList.some(msg => msg.trim() !== "") ||
      this.validationMessageQtyPesanList.some(msg => msg.trim() !== "");

    return dataInvalid
  }

  listProductData: any[] = [
    { kodeBarang: '', namaBarang: '', konversi: '', satuanKecil: '', satuanBesar: '', qtyWasteBesar: '', qtyWasteKecil: '', isConfirmed: false }
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

            if (index === this.listProductData.length - 1) {
              this.listProductData.push({
                kodeBarang: '', namaBarang: '', konversi: '',
                satuanKecil: '', satuanBesar: '', isConfirmed: false,
                isLoading: false
              });
            }
          }
        },
      });
    }
  }

}    