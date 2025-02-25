import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../model/page';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';

@Component({
  selector: 'app-send-order-to-supplier',
  templateUrl: './send-order-to-supplier.component.html',
  styleUrls: ['./send-order-to-supplier.component.scss'],
})
export class SendOrderToSupplierViaRSCComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: DataTables.Settings = {};
  config: any = {
    BASE_URL: 'http://localhost:8093/inventory/api/send-order-to-supplier',
  };
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  buttonCaptionView: String = 'Lihat';
  selectedStatusFilter: string = '';
  orders: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;  currentDate: Date = new Date();

  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];

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
          tipePesanan: "R",
          tglPesananStart :  moment(this.dateRangeFilter[0], "ddd MMM DD YYYY HH:mm:ss [GMT]Z").format("DD-MM-YYYY"),
          tglPesananEnd :  moment(this.dateRangeFilter[1], "ddd MMM DD YYYY HH:mm:ss [GMT]Z").format("DD-MM-YYYY")
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
                  tglKirimBrg: this.g.transformDate(rest.tglKirimBrg),
                  // tglTransaksi: this.g.transformDate(rest.tglTransaksi)
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
          callback({});
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'dtIndex', title: '#' },
        // { data: 'tglTransaksi', title: 'Tanggal Kirim' },
        { data: 'tglPesanan', title: 'Tanggal Pesan' },
        { data: 'tglKirimBrg', title: 'Tanggal Kirim Barang' },
        { data: 'tglBatalExp', title: 'Tanggal Batal' },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        { data: 'supplier', title: 'Kode Tujuan' },
        { data: 'keteranganRsc', title: 'Keterangan Tujuan' },
        { 
          data: 'statusPesanan', 
          title: 'Status Pesanan',
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "1":
                statusLabel = "Baru";
                break;
              case "2":
                statusLabel = "Sisa";
                break;
              case "3":
                statusLabel = "Dikirim";
                break;
              case "4":
                statusLabel = "Batal";
                break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
            }
            return statusLabel;
          }
        },
        { data: 'statusCetak', 
          title: 'Status Cetak',
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "S":
                statusLabel = "Sudah";
                break;
              case "B":
                statusLabel = "Belum";
                break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
                break;
            }
            return statusLabel;
          }
         },
        { data: 'statusKirim', 
          title: 'Status Kirim',
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "S":
                statusLabel = "Sudah";
                break;
              case "B":
                statusLabel = "Belum";
                break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
                break;
            }
            return statusLabel;
          }
         },
        {
          title: 'Aksi',
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
    const route = this.router.createUrlTree([
      '/order/send-order-to-supplier-via-rsc/add-data',
    ]);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/delivery-item/detail-transaction']);
      this;
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

  onFilterPressed() {
    console.log('filter pressed (luar)');
    console.log(" this.datatableElement", this.datatableElement)
    this.datatableElement?.dtInstance
      .then((dtInstance: DataTables.Api) => {
        console.log('dtInstance berhasil didapatkan');
        dtInstance.ajax.reload();
      })
      .catch((error) => {
        console.error('dtInstance gagal didapatkan:', error);
      });
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
