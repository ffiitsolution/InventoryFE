import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_RECEIVING_ORDER,
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-receiving-order',
  templateUrl: './receiving-order.component.html',
  styleUrl: './receiving-order.component.scss',
})
export class ReceivingOrderComponent
  implements OnInit, OnDestroy, AfterViewInit {
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  page = new Page();
  columns: any;
  data: any;
  orders: any[] = [];
  dtColumns: any = [];
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  searchTriggered: boolean = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  buttonCaptionView: String = 'Lihat';
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  selectedRowData: any;
  protected config = AppConfig.settings.apiServer;

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
          kodeTujuan: this.g.getUserLocationCode(),
          startDate: this.g.transformDate(this.dateRangeFilter[0]),
          endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/receiving-order/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  kodePemesan: `(${rest.kodePemesan}) ${rest.namaPemesan}`,
                  tglPesan: this.g.transformDate(rest.tglPesan),
                  tglBrgDikirim: this.g.transformDate(rest.tglBrgDikirim),
                  tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
                  dateCreate: this.g.transformDate(rest.dateCreate),
                  timeCreate: this.g.transformTime(rest.timeCreate),
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
        },);
      },
      columns: [
        { data: 'dtIndex', title: '#' },
        { data: 'tglPesan', title: 'Tanggal Pesan' },
        { data: 'tglBrgDikirim', title: 'Tanggal Kirim' },
        { data: 'tglKadaluarsa', title: 'Tanggal Kedaluwarsa' },
        { data: 'nomorPesanan', title: 'Nomor Pesanan', searchable: true },
        {
          data: 'kodePemesan',
          title: 'Nama Pemesan',
          orderable: true,
          searchable: true,
        },
        {
          data: 'tipeData',
          title: 'Tipe Pesanan',
          render: (data) => this.g.getStatusOrderLabel(data),
        },
        {
          data: 'statusPesanan',
          title: 'Status Pesanan',
          searchable: true,
          render: (data) => {
            const isCancel = data == CANCEL_STATUS;
            const label = this.g.getStatusOrderLabel(data);
            if (isCancel) {
              return `<span class="text-center text-danger">${label}</span>`;
            }
            return label;
          },
        },
        {
          data: 'statusCetak',
          title: 'Status Cetak',
          render: (data) => this.g.getStatusOrderLabel(data, true),
        },
        {
          title: 'Opsi',
          render: () => {
            return `<button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>`;
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [4, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
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

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Terima Pesanan') + ' - ' + this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    localStorage.removeItem(LS_INV_SELECTED_RECEIVING_ORDER);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_RECEIVING_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate(['/order/receiving-order/detail']);
    }
  }
  dtPageChange(event: any) { }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
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

  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  toggleFilter() {
    this.showFilterSection = !this.showFilterSection;
  }
  onAddPressed() {
    this.router.navigate(['/order/receiving-order/add']);
  }
}
