import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import { ACTION_VIEW, CANCEL_STATUS, DEFAULT_DATE_RANGE_RECEIVING_ORDER, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-production-list',
  templateUrl: './production-list.component.html',
  styleUrls: ['./production-list.component.scss'],
})
export class ProductionListComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: any = {};
    protected config = AppConfig.settings.apiServer;

  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  buttonCaptionView: String = 'Lihat';
  buttonCaptionPrint: String = 'Cetak';
  selectedRowCetak: any = false;
  isShowModalCetak: boolean;
  selectedStatusFilter: string = '';
  orders: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;
  currentDate: Date = new Date();
  selectedRowData: any;
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;

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
      order: [[1,'desc'],[2,'desc']],
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback:any) => {
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
          }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
          endDate: moment(this.dateRangeFilter[1]).set({
            hours: 23,
            minutes: 59,
            seconds: 59,
            milliseconds: 999,
          }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
          statusPosting:['P']
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/production/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglPesanan: this.g.transformDate(rest.tglPesanan),
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  tglExp: this.g.transformDate(rest.tglExp),
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
        { data: 'tglTransaksi', title: 'Tanggal Transaksi' },
        { data: 'nomorTransaksi', title: 'No. Transaksi' },
        { data: 'kodeProduksi', title: 'Kode Produksi' },
        { data: 'barangProduksi', title: 'Barang Produksi' },
        {
          data: 'konversi',
          title: 'Konversi',
           render:function(data:any, type:any, row:any) {
            return Number(data).toFixed(2)+" "+row.satuanKecil+"/"+row.satuanBesar; // Ensures two decimal places
          }
        },
        { data: 'jumlahResep', title: 'Jumlah Produksi',
           render:function(data:any, type:any, row:any) {
            return Number(data).toFixed(2) +" "+row.satuanBesar; // Ensures two decimal places
          }
        },
        { data: 'totalProduksi', title: 'Total Produksi',
          render: function(data:any, type:any, row:any) {
            return Number(data).toFixed(2)+" "+row.satuanKecil; // Ensures two decimal places
          }
        },
        { data: 'tglExp', title: 'Tgl Expired' },
        // { data: 'userCreate', title: 'User Proses', searchable: true },
        // {
        //   data: 'dateCreate',
        //   title: 'Tgl. Proses',
        //   orderable: true,
        //   searchable: true,
        // },
        // {
        //   data: 'timeCreate',
        //   title: 'Jam Proses',
        //   orderable: true,
        //   searchable: true,
        // },
        {
          data: 'statusPosting',
          title: 'Status Transaksi',
          render:function(data:any, type:any, row:any) {return 'POSTED'} ,
        },
        {
          title: 'Aksi',
          render: () => {
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
          // this.onClickPrint(data)
          this.selectedRowCetak = data;
          this.isShowModalReport=true;

          this.paramGenerateReport = {
            noTransaksi: this.selectedRowCetak.nomorTransaksi,
            userEntry: this.selectedRowCetak.userCreate,
            jamEntry: this.g.transformTime(this.selectedRowCetak.timeCreate),
            tglEntry: this.g.transformDate(this.selectedRowCetak.dateCreate),
            outletBrand: 'KFC',
            kodeGudang: this.g.getUserLocationCode(),
            isDownloadCsv: false,
            reportName: 'cetak_production',
            confirmSelection: 'Ya',
          };
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

  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    const route = this.router.createUrlTree(['/transaction/production/add-data']);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        'selectedProduction',
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/production/detail']); this
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshData(): void {
    const route = this.router.createUrlTree(['/transaction/production/detail']);
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
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
    console.log('filter pressed');
  }
  dtPageChange(event: any): void {
    console.log('Page changed', event);
  }

  closeModal(){
    this.isShowModalReport = false;
    this.selectedRowCetak = null;
    this.disabledPrintButton = false;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/']);
  }
}
