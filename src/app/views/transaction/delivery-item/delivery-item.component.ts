import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../model/page';
import { ACTION_VIEW, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../constants';

@Component({
  selector: 'app-delivery-item',
  templateUrl: './delivery-item.component.html',
  styleUrls: ['./delivery-item.component.scss'],
})
export class DeliveryItemComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: DataTables.Settings = {};
  config: any = {
    BASE_URL: 'http://localhost:8093/inventory/api/delivery-order',
  };
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  dateRangeFilter: any = [new Date(), new Date()];
  buttonCaptionView: String = 'Lihat';
  selectedStatusFilter: string = '';
  orders: any[] = [];

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
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          // startDate: this.g.transformDate(this.dateRangeFilter[0]),
          // endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  // kodePemesan: `(${rest.kodeGudang}) ${rest.namaGudang}`,
                  // tglPesan: this.g.transformDate(rest.tglPesan),
                  // tglKirim: this.g.transformDate(rest.tglKirim),
                  // tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
                };
                return finalData;
              });
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              this.showFilterSection = false;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        // { data: 'dtIndex', title: '#' },
        { data: 'kodeGudang', title: 'Kode Gudang'},
        { data: 'kodePemesan', title: 'Kode Pemesan' },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        { data: 'tglPesan', title: 'Tanggal Pesan' },
        {data: 'tglBrgDikirim',title: 'Tanggal Dikirim',},
        { data: 'keterangan1',title: 'Keterangan',},
        {
          data: 'statusRecieve',
          title: 'Status Penerimaan',
          render: (data) => {
            const isCancel = data == CANCEL_STATUS;
            const label = this.g.getsatusDeliveryOrderLabel(data);
            if (isCancel) {
              return `<span class="text-center text-danger">${label}</span>`;
            }
            return label;
          },
        },
        {
          data: 'statusCetak',
          title: 'Status Cetak',
          render: (data) => this.g.getsatusDeliveryOrderLabel(data, true),
        },
        {
          title: 'Opsi',
          render: () => {
            return `<button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>`;
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
    };
    this.dtColumns = this.dtOptions.columns;
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
    const route = this.router.createUrlTree(['/transaction/delivery-item/add-data']);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/delivery-item/detail-transaction']);
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
    // Logic for applying filters
    console.log('Filter pressed');
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