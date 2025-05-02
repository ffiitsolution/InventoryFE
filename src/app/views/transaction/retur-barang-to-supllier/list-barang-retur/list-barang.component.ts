import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import {
  ACTION_VIEW,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { AppConfig } from '../../../../config/app.config';
import { AppService } from '../../../../service/app.service';
import { ACTION_SELECT } from '../../../../../constants';
import { TranslationService } from '../../../../service/translation.service';
import { data } from 'jquery';

@Component({
  selector: 'app-list-barang-retur',
  templateUrl: './list-barang.component.html',
  styleUrls: ['./list-barang.component.scss'],
})
export class ListBarangReturComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: DataTables.Settings = {};
  dtOptionsModal: DataTables.Settings = {};
  protected config = AppConfig.settings.apiServer;
  isShowModal: boolean = false;
  pageSize: number = 10;
  dtTrigger: Subject<any> = new Subject();
  currentPage: number = 1;
  page = new Page();
  dtColumns: any = [];
  buttonCaptionView: String = 'Lihat';
  buttonCaptionPrint: String = 'Cetak';
  selectedStatusFilter: string = '';
  selectedData: any;
  isShowModalReport: boolean = false;
  showFilterSection: boolean = false;
  confirmSelection: string = 'semua';
  paramGenerateReport: any = {};

  orders: any[] = [];
  totalRecords: number = 0;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;
  currentDate: Date = new Date();

  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  alreadyPrint: boolean = false;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private transaltionService: TranslationService,
    private router: Router,
    private globalService: GlobalService,
    private appService: AppService,
    private toastr: ToastrService
  ) {
    this.dtOptions = {
      language:
        transaltionService.getCurrentLanguage() == 'id'
          ? transaltionService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      paging: true,
      searching: true,
      pageLength: this.pageSize,
      lengthMenu: [
        [5, 10, 20, 50],
        [5, 10, 20, 50],
      ],
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          search: dataTablesParameters.search.value || "", 
          kodeGudang: this.g.getUserLocationCode(),
          tipeTransaksi: "6", 
          startDate: moment(this.dateRangeFilter[0]).format("YYYY-MM-DD"),
          endDate: moment(this.dateRangeFilter[1]).format("YYYY-MM-DD"),
          page: Math.floor(this.currentPage),  
          size: this.pageSize, 
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL +
                '/api/delivery-order/display-data-retur-supplier',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.content.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglPesanan: this.g.transformDate(rest.tglTransaksi),
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                };
                return finalData;
              });
              this.totalRecords = resp.totalElements;
              callback({
                recordsTotal: resp.totalElements,
                recordsFiltered: resp.totalElements,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        // { data: 'dtIndex', title: 'No.' },
        { data: 'TGL_TRANSAKSI', title: 'Tanggal Transaksi', 
          render: (data) => this.g.transformDate(data),
        },
        { data: 'NOMOR_TRANSAKSI', title: 'No. Transaksi' },
        {
          title: 'Supplier Tujuan',
          data: null, 
          render: function (data, type, row) {
            return row.KODE_TUJUAN && row.NAMA_SUPPLIER
              ? `${row.KODE_TUJUAN} - ${row.NAMA_SUPPLIER}`
              : "-";
          },
        },
        { data: 'KETERANGAN', title: 'Keterangan' },
        { data: 'USER_CREATE', title: 'User Proses' },
        { data: 'TGL_TRANSAKSI', title: 'Tanggal', 
          render: (data) => this.g.transformDate(data),
        },
        {
          data: 'TIME_CREATE',
          title: 'Jam',
          render: function (data, type, row) {
            if (data && data.length === 6) {
              let formattedTime = `${data.substring(0, 2)}:${data.substring(2, 4)}:${data.substring(4, 6)}`;
              return formattedTime;
            }
            return "-";
          }
        },
        {
          data: 'STATUS_POSTING',
          render: (data) => (data === 'P' ? 'Posted' : 'Belum Posting'),
          title: 'Status Transaksi',
        },
        {
          title: 'Aksi',
          orderable: false,
          searchable: false,
          render: (data, type, row) => {
            return ` <div class="btn-group" role="group" aria-label="Action">
                <button class="btn btn-sm action-view btn-outline-primary btn-60">${this.buttonCaptionView}</button>
                <button class="btn btn-sm action-print btn-outline-primary btn-60"}>${this.buttonCaptionPrint}</button>           
              </div>`;
          },
        },
      ],
      searchDelay: 1000,
      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        return row;
      },
      order: [[1, 'desc']],
    };
    this.dtColumns = this.dtOptions.columns;
  }

  ngOnInit(): void {}

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    const route = this.router.createUrlTree([
      '/transaction/retur-ke-supplier/tambah-data-barang-retur',
    ]);
    this.router.navigateByUrl(route);
  }

  // onNextPage(): void {
  //   const route = this.router.createUrlTree(['/transaction/wastage/add-data']);
  //   this.router.navigateByUrl(route);
  // }

  actionBtnClick(action: string, data: any = null) {
    console.log('button clickef');
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage('pemakaianBarangSendiri', JSON.stringify(data));
      this.router.navigate([
        '/transaction/retur-ke-supplier/detail-pemakaian-barang',
      ]);
    }
  }

  onShowModal() {
    this.isShowModal = true;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshData(): void {
    const route = this.router.createUrlTree([
      '/transaction/delivery-item/detail-transaction',
    ]);
    this.router.navigateByUrl(route);
  }
  onFilterStatusChange(event: Event): void {
    // Logic for handling status filter change
    console.log('Status filter changed:', this.selectedStatusFilter);
  }

  onFilterOrderDateChange(event: Event): void {
    if (event) {
      const target = event.target as HTMLInputElement | null;
      if (target) {
        this.orderDateFilter = target.value; // Update nilai filter
      }
    }
    this.rerenderDatatable();
  }

  rerenderDatatable(): void {
    this.dtTrigger.next(null);
  }

  onFilterExpiredChange(): void {
    console.log('Expired filter changed:', this.expiredFilter);
  }

  onFilterTujuanChange(): void {
    console.log('Tujuan filter changed:', this.tujuanFilter);
  }

  onFilterPressed(): void {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
    console.log('filter pressed');
  }
  dtPageChange(event: any): void {
    console.log('Page changed', event);
  }

  validateDeliveryDate(): void {
    const today = new Date();
    this.orders.forEach((order) => {
      const deliveryDate = new Date(order.deliveryDate);
      const timeDiff = Math.abs(today.getTime() - deliveryDate.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays > 7) {
        console.warn(
          `Order ${order.orderNo} has a delivery date older than 7 days.`
        );
      }
    });
  }

  cetakJesper() {}

  selectedRows: string[] = [];
  generateReportParam: any; 
  downloadURL: string = '';
  selectedRowCetak: any; 
  disabledPrintButton: boolean = false; 

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);

    $(document).on('change', '.row-checkbox', (event) => {
      const checkbox = event.target as HTMLInputElement;
      const nomorTransaksi = checkbox.value;

      if (checkbox.checked) {
        this.selectedRows.push(nomorTransaksi);
      } else {
        this.selectedRows = this.selectedRows.filter(
          (item) => item !== nomorTransaksi
        );
      }

      console.log('Selected Rows:', this.selectedRows);
    });

    $(document).on('change', '#selectAll', (event) => {
      const isChecked = (event.target as HTMLInputElement).checked;

      $('.row-checkbox').prop('checked', isChecked);
      this.selectedRows = isChecked
        ? $('.row-checkbox')
            .map(function () {
              return (this as HTMLInputElement).value;
            })
            .get()
        : [];

      console.log('Selected Rows:', this.selectedRows);
    });
  }
  headerPlanningOrder = {
    selectedYear: new Date().getFullYear().toString(),
    selectedMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
  };

  downloadCsv(res: any) {
    var blob = new Blob([res], { type: 'text/csv' });
    this.downloadURL = window.URL.createObjectURL(blob);

    if (this.downloadURL.length) {
      var link = document.createElement('a');
      link.href = this.downloadURL;
      link.download = `ORDER${this.headerPlanningOrder.selectedYear}${this.headerPlanningOrder.selectedMonth}.csv`;
      link.click();
      this.toastr.success('Berhasil Dicetak!');
      this.isShowModalReport = false;
    } else
      this.g.alertError('Maaf, Ada kesalahan!', 'File tidak dapat terunduh.');
  }
  closeModal(){
    this.isShowModalReport = false;
    this.selectedRowCetak = null;
    this.disabledPrintButton = false;
  }
  // renderDataTables(): void {
  //     this.dtOptionsModal = {
  //       language:
  //         this.transaltionService.getCurrentLanguage() == 'id' ? this.transaltionService.idDatatable : {},
  //       processing: true,
  //       serverSide: true,
  //       autoWidth: true,
  //       info: true,
  //       drawCallback: () => { },
  //       ajax: (dataTablesParameters: any, callback) => {
  //         this.page.start = dataTablesParameters.start;
  //         this.page.length = dataTablesParameters.length;
  //         const params = {
  //           ...dataTablesParameters,
  //           kodeGudang: this.globalService.getUserLocationCode(),
  //           tipeTransaksi : '8',
  //         };
  //         this.appService.getNewReceivingOrderGudang(params)
  //           .subscribe((resp: any) => {
  //             const mappedData = resp.penerimaanGudangList.map((item: any, index: number) => {
  //               // hapus rn dari data
  //               const { rn, ...rest } = item;
  //               const finalData = {
  //                 ...rest,
  //                 dtIndex: this.page.start + index + 1,
  //               };
  //               return finalData;
  //             });
  //             this.page.recordsTotal = resp.recordsTotal;
  //             this.page.recordsFiltered = resp.recordsFiltered;
  //             callback({
  //               recordsTotal: resp.recordsTotal,
  //               recordsFiltered: resp.recordsFiltered,
  //               data: mappedData,
  //             });
  //           });
  //       },
  //       columns: [
  //         { data: 'NOMOR_TRANSAKSI', title: 'Nomor Transaksi' },
  //         { data: 'KODE_BARANG', title: 'Kode Barang' },
  //         { data: 'NAMA_BARANG', title: 'Nama Barang' },
  //         { data: 'KONVERSI', title: 'Konversi' },
  //         { data: 'QTY_BESAR', title: 'Qty Besar' },
  //         { data: 'QTY_KECIL', title: 'Qty Kecil', },
  //         { data: 'TOTAL_QTY', title: 'Total Qty', },
  //         { data: 'TGL_EXPIRED', title: 'Tanggal Expired', },
  //         { data: 'TOTAL_QTY_EXPIRED', title: 'Total Qty Expired', },
  //         { data: 'EXPIRED_QTY_BESAR', title: 'Experied Qty Besar', },
  //       ],
  //       searchDelay: 1000,
  //       rowCallback: (row: Node, data: any[] | Object, index: number) => {
  //         $('.action-select', row).on('click', () =>
  //           this.actionBtnClick(ACTION_SELECT, data)
  //         );
  //         return row;
  //       },
  //     };
  //   }
}
