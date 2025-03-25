import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_VIEW,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_RECEIVING_ORDER,
} from 'src/constants';
import { AppConfig } from 'src/app/config/app.config';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'receving-po-supplier-add-form',
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss',
})
export class ReceivingPoSupplierAddFormComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;

  protected config = AppConfig.settings.apiServer;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  dtOptions: DataTables.Settings = {};
  page = new Page();
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  dtColumns: any = [];
  buttonCaptionView: string = 'Lihat';
  dtTrigger: Subject<any> = new Subject();
  showFilterSection: boolean = false;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    public translation: TranslationService,
    private router: Router
  ) {
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
          ...dataTablesParameters,
          kodeTujuan: this.g.getUserLocationCode(),
          startDate: this.g.transformDate(this.dateRangeFilter[0]),
          endDate: this.g.transformDate(this.dateRangeFilter[1]),
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL_HQ + '/api/receiving-order/get-from-hq/dt',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  kodePemesan: `(${rest.kodePemesan}) ${rest.namaPemesan}`,
                  tglPesan: this.g.transformDateTime(
                    rest.tglPesan,
                    rest.jamProsesPemesan
                  ),
                  tglBrgDikirim: this.g.transformDateTime(
                    rest.tglBrgDikirim,
                    rest.jamProsesPengirim
                  ),
                  tglBatasExp: this.g.transformDate(rest.tglBatasExp),
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
        { data: 'dtIndex', title: '#' },
        { data: 'tglPesan', title: 'Tanggal Pesan' },
        { data: 'tglBrgDikirim', title: 'Tanggal Kirim' },
        { data: 'tglBatasExp', title: 'Tanggal Kedaluwarsa' },
        { data: 'nomorPesanan', title: 'Nomor Pesanan', searchable: true },
        {
          data: 'kodePemesan',
          title: 'Nama Pemesan',
          orderable: true,
          searchable: true,
        },
        {
          data: 'statusPesanan',
          title: 'Status Pesanan',
          render: (data) => this.g.getStatusOrderLabel(data),
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
        [2, 'asc'],
        [4, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
    this.dpConfig.containerClass = 'theme-red';

  }

  ngOnInit(): void {
    this.buttonCaptionView = this.translation.instant('Lihat');
  }

  actionBtnClick(action: string, data: any = null) {
    if (action == ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_RECEIVING_ORDER, data);
      this.router.navigate(['/order/receiving-order/add/detail']);
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }
  dtPageChange(event: any) {}

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
  onFilterApplied() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  onPreviousPressed() {
    this.router.navigate(['/order/receiving-order']);
  }
  onFilterTogglePressed() {
    this.showFilterSection = !this.showFilterSection;
  }
  AfterViewInit() {
    this.rerenderDatatable();
  }
}
