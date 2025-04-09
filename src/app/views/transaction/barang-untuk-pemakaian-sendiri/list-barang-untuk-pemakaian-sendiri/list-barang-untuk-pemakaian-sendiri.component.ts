import { Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-list-barang-untuk-pemakaian-sendiri',
  templateUrl: './list-barang-untuk-pemakaian-sendiri.component.html',
  styleUrls: ['./list-barang-untuk-pemakaian-sendiri.component.scss'],
})
export class ListBarangUntukPemakaianSendiriComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
dtOptions: DataTables.Settings = {};
dtOptionsModal: DataTables.Settings = {};
protected config = AppConfig.settings.apiServer;
isShowModal: boolean = false;
pageSize: number = 10; // Define the pageSize property
  dtTrigger: Subject<any> = new Subject();
  currentPage: number = 1;
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  buttonCaptionView: String = 'Lihat';
  selectedStatusFilter: string = '';
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

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private transaltionService: TranslationService,
    private router: Router,
    private globalService: GlobalService,
    private appService: AppService
    

  ) {
    this.dtOptions = {
      language:
        transaltionService.getCurrentLanguage() == 'id' ? transaltionService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      paging: true,
      searching: true,
      pageLength: this.pageSize,
      lengthMenu: [[5, 10, 20, 50], [5, 10, 20, 50]],
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          search: dataTablesParameters.search.value,
          kodeGudang: this.g.getUserLocationCode(),
          startDate: moment(this.dateRangeFilter[0]).format('YYYY-MM-DD'),
          endDate: moment(this.dateRangeFilter[1]).format('YYYY-MM-DD'),
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize,
           
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL +
                '/api/delivery-order/display-data-pemakaian-barang-sendiri',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglPesanan: this.g.transformDate(rest.tglPesanan),
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                };
                return finalData;
              });
              this.totalRecords = resp.totalRecords;
              callback({
                recordsTotal: resp.totalRecords,
          recordsFiltered: resp.totalRecords,
          data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'dtIndex', title: 'No.'},
        { data: 'TGL_TRANSAKSI', title: 'Tanggal Transaksi', 
          render: (data) => this.g.transformDate(data),
        },
        { data: 'NOMOR_TRANSAKSI', title: 'No. Transaksi' },
        { data: 'KETERANGAN', title: 'Keterangan Pemakaian', searchable: true },
        { data: 'USER_CREATE', title: 'User Proses', searchable: true },
        { data: 'TGL_TRANSAKSI', title: 'Tanggal Proses',
          render: (data) => this.g.transformDate(data),
        },
        {
          data: 'TIME_CREATE',
          title: 'Jam Proses',
          orderable: true, 
          searchable: true,
          render: function (data, type, row) {
            if (type === 'display' && data) {
        
              const time = data.toString();
              const hours = time.slice(0, 2).padStart(2, '0');
              const minutes = time.slice(2, 4).padStart(2, '0');
              const seconds = '00'; // Detik di-set menjadi 00
        
              return `${hours}:${minutes}:${seconds}`;
            }
            return data; 
          }
        },
        {
          data: 'STATUS_POSTING',
          title: 'Status Transaksi',
          render: (data) => this.g.getStatusOrderLabel(data),
        },
        {
          title: 'Aksi',
          orderable: false,
          searchable: false,
          render: (data, type, row) => {
            return `<button class="btn btn-sm btn-primary action-view" data-nomor-transaksi="${row.NOMOR_TRANSAKSI}">
                      <i class="fa fa-eye"></i> Lihat Detail
                    </button>`;
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
      order: [[1, 'desc']]
    };
    this.dtColumns = this.dtOptions.columns;
  }

  ngOnInit(): void {
    
  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    const route = this.router.createUrlTree(['/transaction/barang-untuk-pemakaian-sendiri/tambah-data-pemakaian-barang-sendiri']);
    this.router.navigateByUrl(route);
  }

  // onNextPage(): void {
  //   const route = this.router.createUrlTree(['/transaction/wastage/add-data']);
  //   this.router.navigateByUrl(route);
  // }

  actionBtnClick(action: string, data: any = null) {
    console.log('button clickef');
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        'pemakaianBarangSendiri',
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/barang-untuk-pemakaian-sendiri/detail-barang-untuk-pemakaian-sendiri']);
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
