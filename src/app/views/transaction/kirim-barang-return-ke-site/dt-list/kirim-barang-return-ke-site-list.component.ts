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
  selector: 'app-kirim-barang-return-ke-site-list',
  templateUrl: './kirim-barang-return-ke-site-list.component.html',
  styleUrls: ['./kirim-barang-return-ke-site-list.component.scss'],
})
export class KirimBarangReturnKeSiteListComponent implements OnInit {
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
  selectedRowData: any;
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  selectedRowCetak: any = false;
  buttonCaptionPrint: String = 'Cetak';

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
          startDate: moment(this.dateRangeFilter[0]).format('DD MMM yyyy' ),
          endDate: moment(this.dateRangeFilter[1]).format('DD MMM yyyy' ),
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/send-return-to-site/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn dari data
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
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
        { 
          data: 'tglTransaksi', 
          title: 'Tanggal Transaksi',
          render: (data: any) => {
            return data ? moment(data).format('DD/MM/YYYY') : '';
          }
        },
    
        { data: 'nomorTransaksi', title: 'No. Transaksi' },
    
        { 
          data: null, 
          title: 'Tujuan',
          render: (data: any) => {
            if (data?.kodeTujuan && data?.namaTujuan) {
              return `${data.kodeTujuan} - ${data.namaTujuan}`;
            }
            return data?.namaTujuan || '';
          }
        },
    
        { data: 'keterangan', title: 'Keterangan' },
    
        { data: 'userCreate', title: 'User Proses', searchable: true },
    
        { 
          data: 'dateCreate', 
          title: 'Tanggal', 
          searchable: true,
          render: (data: any) => {
            return data ? moment(data).format('DD/MM/YYYY') : '';
          }
        },
    
        { 
          data: 'timeCreate', 
          title: 'Jam', 
          searchable: true,
          render: (data: any) => {
            return data ? moment(data, 'HH:mm:ss').format('HH:mm:ss') : '';
          }
        },
        
        {
          data: 'namaPosting',
          title: 'Status Transaksi',
          render: (data: any) => {
            return `<span class="badge bg-success">${data}</span>`;
          }
        },

        {
          title: 'Aksi',
          render: () => {
            return `<div class="btn-group" role="group" aria-label="Action">
                <button class="btn btn-sm action-view btn-outline-primary btn-60">${this.buttonCaptionView}</button>
                <button class="btn btn-sm action-print btn-outline-primary btn-60"}>${this.buttonCaptionPrint}</button>           
              </div>`;
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [6, 'desc'],
        [7, 'desc'],
        [2, 'desc'],
        [1, 'desc'],
      
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
            reportName: 'cetak retur dari site',
            confirmSelection: 'Ya',
          };
        });
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
  }

  ngOnInit(): void {
  
  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    const route = this.router.createUrlTree(['/transaction/kirim-barang-return-ke-site/add-data']);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        'selectedProduction',
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/kirim-barang-return-ke-site/detail']); this
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshData(): void {
    const route = this.router.createUrlTree(['/transaction/kirim-barang-return-ke-site/detail']);
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
  }

  closeModal(){
    this.isShowModalReport = false;
    this.selectedRowCetak = null;
    this.disabledPrintButton = false;
  }
}