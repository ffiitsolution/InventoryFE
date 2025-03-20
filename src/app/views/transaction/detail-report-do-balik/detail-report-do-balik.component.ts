import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { AppService } from '../../../service/app.service';
import {
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../constants';
import { TranslationService } from '../../../service/translation.service';

const STATUS_SAME_CONVERSION = 'SAME_CONVERSION';

const ACTION_VIEW = 'view';

@Component({
  selector: 'app-detail-report-do-balik',
  templateUrl: './detail-report-do-balik.component.html',
  styleUrls: ['./detail-report-do-balik.component.scss'],
})
export class DetailReportDoBalikComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  page: {
    start: number;
    length: number;
    recordsTotal: number;
    recordsFiltered: number;
  } = {
    start: 0,
    length: 10,
    recordsTotal: 0,
    recordsFiltered: 0,
  };

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedOrder: any = JSON.parse(localStorage[LS_INV_SELECTED_DELIVERY_ORDER]);
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  RejectingOrder: boolean = false;
  totalLength: number = 0;
  buttonCaptionView: String = 'Lihat';
  dateRangeFilter: [Date, Date] = [new Date(), new Date()];

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private router: Router,
    private appService: AppService,
    private translation: TranslationService
  ) {
    this.g.navbarVisibility = false;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.selectedOrder.TGL_PESANAN = this.g.transformDate(this.selectedOrder.TGL_PESANAN);
    this.selectedOrder.TGL_TRANSAKSI = this.g.transformDate(this.selectedOrder.TGL_TRANSAKSI);

    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          noSuratJalan: this.selectedOrder.NO_SURAT_JALAN,
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL + '/api/delivery-order/detail-do-balik',
              params
            )
            .subscribe((resp: any) => {
              const updatedSelectedOrder = {
                ...this.selectedOrder,
              };
              this.selectedOrder = updatedSelectedOrder;
              this.g.saveLocalstorage(
                LS_INV_SELECTED_DELIVERY_ORDER,
                JSON.stringify(updatedSelectedOrder)
              );
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  konversi: this.g.formatToDecimal(rest.konversi),
                  totalQtyPesan: this.g.formatToDecimal(rest.totalQtyPesan),
                  qtyBKirim: this.g.formatToDecimal(rest.qtyBKirim),
                  qtyKKirim: this.g.formatToDecimal(rest.qtyKKirim),
                  totalQtyKirim: this.g.formatToDecimal(rest.totalQtyKirim),
                  dtIndex: this.page.start + index + 1,
                };
                return finalData;
              });
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              this.totalLength = mappedData.length;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        { data: 'totalQtyPesan', title: 'Total Qty Pesan' },
        { data: 'qtyBKirim', title: 'Qty Kirim Besar' },
        { data: 'qtyKKirim', title: 'Qty Kirim Kecil' },
        { data: 'konversi', title: 'Konversi' },
        { data: 'totalQtyKirim', title: 'Total Qty Kirim' },
      ],
      order: [[1, 'asc']],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
  }
  reloadTable() {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  actionBtnClick(action: string, data: any = null): void {}

  dtpageChange(event: any): void {}

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onbackPressed(): void {
    this.router.navigate(['/transaction/delivery-item/dobalik']);
  }

  getStatusPosting(status: string): string {
    if (status === 'I') {
      return 'INTRANSIT';
    } else {
      return 'POSTING';
    }
  }
}
