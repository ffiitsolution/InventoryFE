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
  OUTLET_BRAND_KFC,
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';

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
  buttonCaptionPrint: String = 'Cetak';
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  selectedRowData: any;
  protected config = AppConfig.settings.apiServer;

  selectedRowCetak: any ;
  isShowModalCetak: boolean;

  isShowModalReport: boolean = false;
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;
  paramGenerateReport = {};
  paramUpdatePrintStatus = {};
  state : any;
  dataUser: any;

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
                  dateCancel: this.g.transformDate(rest.dateCancel),
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
        { data: 'tglKadaluarsa', title: 'Tanggal Batal' },
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
            const label = this.g.getStatusReceivingOrderLabel(data);
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
            const htmlString = `
              <div class="btn-group" role="group" aria-label="Action">
                <button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>
                <button class="btn btn-sm action-print btn-outline-info btn-60"}>${this.buttonCaptionPrint}</button>           
              </div>
            `;
            return htmlString;
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [7, 'asc'], [4, 'desc']

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
        $('.action-print', row).on('click', () =>{
          this.onShowModalPrint(data)
        }
        );
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.customTodayClass='today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Terima Pesanan') + ' - ' + this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    localStorage.removeItem(LS_INV_SELECTED_RECEIVING_ORDER);
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

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
  onOrderManualPressed() {
    this.router.navigate(['/order/receiving-order/order-manual']);
  }

  onShowModalPrint(selectedOrder: any) {
    this.paramGenerateReport = {
      outletBrand: OUTLET_BRAND_KFC,
      isDownloadCsv: false,
      staffName: this.dataUser.namaUser,
      nomorPesanan: selectedOrder.nomorPesanan,
      tglBrgDikirim: selectedOrder.tglKirimBrg,
      tglPesan: selectedOrder.tglPesanan,
      user: this.g.getUserCode(),
      statusPesanan: selectedOrder.statusPesanan,
      statusCetak: selectedOrder.statusCetak
    };

    this.paramUpdatePrintStatus={
      statusKirim: "S",
      userKirim: this.dataUser.namaUser,
      dateKirim: moment().format("DD-MM-YYYY"),
      timeKirim: moment().format("HHmmss"),
      nomorPesanan: selectedOrder.nomorPesanan,
    }    
    this.isShowModalReport = true;
  }
  closeModal(){
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
    window.location.reload();
  }

}
