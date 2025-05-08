import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';

import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import {
  ACTION_CETAK,
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_DISPLAY_DATA_GUDANG,
} from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';

@Component({
  selector: 'app-display-data-dari-gudang',
  templateUrl: './display-data-dari-gudang.component.html',
  styleUrls: ['./display-data-dari-gudang.component.scss'],
})
export class DisplayDataGudangComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: any = {};
  config: any = {
    BASE_URL: 'http://localhost:8093/inventory/api/delivery-order',
  };
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

  endDateFilter: Date = new Date(new Date().setDate(new Date().getDate() + 1));
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
      paging: true,
      search: true,
      pageLength: 10,
      lengthMenu: [
        [5, 10, 20, 50],
        [5, 10, 20, 50],
      ],
      searching: true,
      autoWidth: true,
      info: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback:any) => {
        let page = Math.floor(
          dataTablesParameters.start / dataTablesParameters.length
        );
        let limit = dataTablesParameters.length || 10;
        let offset = page * limit;
        const params = {
          ...dataTablesParameters,
          search: dataTablesParameters.search?.value || '',
          limit: limit,
          offset: offset,
          kodeGudang: this.g.getUserLocationCode(),
          startDate: moment(this.dateRangeFilter[0])
            .set({
              hours: 0,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            })
            .format('YYYY-MM-DD HH:mm:ss.SSS'),
          endDate: moment(this.dateRangeFilter[1])
            .set({
              hours: 23,
              minutes: 59,
              seconds: 59,
              milliseconds: 999,
            })
            .format('YYYY-MM-DD HH:mm:ss.SSS'),
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL + '/display-data-penerimaan-dari-gudang',
              params
            )
            .subscribe((resp: any) => {
              const data = Array.isArray(resp.displayDataPenerimaanDariGudang)
                ? resp.displayDataPenerimaanDariGudang
                : [];
              const mappedData = data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  // dtIndex: this.page.start + index + 1,
                  dtIndex: offset + index + 1,
                  TANGGAL_TERIMA: this.g.transformDate(rest.TANGGAL_TERIMA),
                  TANGGAL_SURAT_JALAN: this.g.transformDate(
                    rest.TANGGAL_SURAT_JALAN
                  ),
                };
                return finalData;
              });

              const totalRecords =
                resp.totalRecords !== undefined && !isNaN(resp.totalRecords)
                  ? resp.totalRecords
                  : mappedData.length;
              callback({
                recordsTotal: totalRecords,
                recordsFiltered: totalRecords,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'TANGGAL_TERIMA', title: 'Tanggal Terima' },
        { data: 'TANGGAL_SURAT_JALAN', title: 'Tanggal Surat Jalan' },
        { data: 'NO_PESANAN', title: 'Nomor Pesanan' },
        { data: 'NO_SURAT_JALAN', title: 'Nomor Surat Jalan' },
        { data: 'NO_PENERIMAAN', title: 'Nomor Penerimaan' },
        { data: 'KODE_GUDANG_PENGIRIM', title: 'Kode Tujuan' },
        { data: 'NAMA_GUDANG_PENGIRIM', title: 'Gudang Pengirim' },
        { data: 'STATUS_TRANSAKSI', title: 'Status Transaksi' },
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
  }

  ngOnInit(): void {}

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    // Logic for adding a new order
    const route = this.router.createUrlTree([
      '/transaction/delivery-item/add-data',
    ]);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_DISPLAY_DATA_GUDANG, JSON.stringify(data));
      this.router.navigate(['/transaction/delivery-item/detail-transaction']);
      this;
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
    const route = this.router.createUrlTree([
      '/transaction/delivery-item/detail-transaction',
    ]);
    this.router.navigateByUrl(route);
  }
  onFilterStatusChange(event: Event): void {
    console.log('Status filter changed:', this.selectedStatusFilter);
  }

  onFilterOrderDateChange(event: Event): void {
    if (event) {
      const target = event.target as HTMLInputElement | null;
      if (target) {
        this.orderDateFilter = target.value;
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
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
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
}
