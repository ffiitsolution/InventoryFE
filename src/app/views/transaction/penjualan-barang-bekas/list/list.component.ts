import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import { ACTION_CETAK, ACTION_VIEW, CANCEL_STATUS, DEFAULT_DATE_RANGE_RECEIVING_ORDER, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-list-penjualan-brg-bekas',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListPenjualanBrgBekasComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: DataTables.Settings = {};
  protected config = AppConfig.settings.apiServer;
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  buttonCaptionView: String = 'Lihat';
  selectedStatusFilter: string = '';
  orders: any[] = [];
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

  endDateFilter: Date = new Date(
    new Date().setDate(new Date().getDate() + 1)
  );
  dateRangeFilter: any = [this.startDateFilter, this.endDateFilter];
  selectedRowData: any;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          startDate: moment(this.dateRangeFilter[0]).set({
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          }).format('YYYY-MM-DD HH:mm:ss.SSS'),
          endDate: moment(this.dateRangeFilter[1]).set({
            hours: 23,
            minutes: 59,
            seconds: 59,
            milliseconds: 999,
          }).format('YYYY-MM-DD HH:mm:ss.SSS'),
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/penjualan-brg-bekas/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  dateCreate: this.g.transformDate(rest.dateCreate),
                  timeCreate: this.g.transformTime(rest.timeCreate),
                };
                return finalData;
              });
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              this.showFilterSection = false
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      order: [[1, 'asc']],
      columns: [
        { data: 'dtIndex', title: '#' },
        { data: 'tglTransaksi', title: 'Tanggal Transaksi' },
        { data: 'nomorTransaksi', title: 'No. Transaksi' },
        {
          data: 'supplier', title: 'Supplier Penerima', searchable: true, render: (data, type, row) => {
            return `${row.supplier} - ${row.namaSupplier}`
          }
        },
        {
          data: 'subTotal', title: 'Sub Total', searchable: true,
          render: (data) => {
            return this.g.convertToRupiah(data);
          }
        },
        {
          data: 'nilaiAdjustment',
          title: 'Adjust Bayar',
          orderable: true,
          searchable: true,
          render: (data) => {
            return this.g.convertToRupiah(data);
          }
        },
        {
          data: 'nilaiPenjualan',
          title: 'Total Penjualan',
          orderable: true,
          searchable: true,
          render: (data) => {
            return this.g.convertToRupiah(data);
          }
        },
        {
          data: 'statusPosting',
          title: 'Status Transaksi',
          render: (data) => {
            const isCancel = data == CANCEL_STATUS;
            const label = this.g.getStatusOrderLabel(data);
            if (isCancel) {
              return `<span class="text-center text-danger">${label}</span>`;
            }
            return label;
          },
        }, {
          title: 'Opsi',
          className: 'text-center',
          render: () => {
            return `<div class="d-flex px-2 gap-1"> 
              <button style="width: 74px" class="btn btn-sm action-view btn-outline-info btn-60 pe-2">
              <i class="fa fa-eye pe-2"></i>${this.buttonCaptionView}</button>
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
        $('.action-cetak', row).on('click', () =>
          this.actionBtnClick(ACTION_CETAK, data)
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
    this.dtColumns = this.dtOptions.columns;
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
  }

  ngOnInit(): void {
    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   processing: true,
    // };
  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    // Logic for adding a new order
    const route = this.router.createUrlTree(['/transaction/penjualan-barang-bekas/add-data']);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/penjualan-barang-bekas/detail']);
    }
    if (action === ACTION_CETAK) {
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshData(): void {
    const route = this.router.createUrlTree(['/transaction/delivery-item/detail-transaction']);
    this.router.navigateByUrl(route);
  }
  onFilterStatusChange(event: Event): void {
    // Logic for handling status filter change
    console.log('Status filter changed:', this.selectedStatusFilter);
  }

  onFilterOrderDateChange(event: Event): void {
    // Logic for handling order date filter change
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
    // Logic for handling expired date filter change
    console.log('Expired filter changed:', this.expiredFilter);
  }

  onFilterTujuanChange(): void {
    // Logic for handling tujuan filter change
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
    // Logic for handling page change
    // You can fetch new data based on the page number or perform other actions
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
}