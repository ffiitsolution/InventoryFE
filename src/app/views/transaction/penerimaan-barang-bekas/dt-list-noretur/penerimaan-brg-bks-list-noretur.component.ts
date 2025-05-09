import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import {
  ACTION_VIEW,
  BUTTON_CAPTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-penerimaan-brg-bks-list-noretur',
  templateUrl: './penerimaan-brg-bks-list-noretur.component.html',
  styleUrls: ['./penerimaan-brg-bks-list-noretur.component.scss'],
})
export class PenerimaanBrgBksListNoreturComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  protected config = AppConfig.settings.apiServer;
  page = new Page();
  dtColumns: any = [];
  showFilterSection: boolean = false;
  buttonCaptionView: String = 'Lihat';
  selectedStatusFilter: string = '';
  loadingSimpan: boolean = false;
  orders: any[] = [];
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

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
  buttonCaptionPrint: String = 'Cetak';
  selectedRowCetak: any = false;
  buttonCaptionSelect: string = BUTTON_CAPTION_SELECT;
  loadingGetDataOnline: boolean = false;
  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.dtColumns = this.dtOptions.columns;

    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
  }

  ngOnInit(): void {
    // this.renderDataTablesRetur();
  }

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  renderDataTablesRetur(): void {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 15,
      order: [[2, 'desc']],
      lengthMenu: [
        // Provide page size options
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
      ],
      drawCallback: (drawCallback:any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParametersRetur: any, callback: any) => {
        this.page.start = dataTablesParametersRetur.start;
        this.page.length = dataTablesParametersRetur.length;
        const params = {
          ...dataTablesParametersRetur,
          kodeGudang: this.g.getUserLocationCode(),
          status: 'K',
        };
        this.dataService
          .postData(
            this.config.BASE_URL_HQ + '/api/return-order/get-from-hq/dt',
            params
          )
          .subscribe(async (resp: any) => {
            // const mappedData = resp.data.map((item: any, index: number) => {
            //   // hapus rn dari data
            //   const { rn, ...rest } = item;
            //   const finalData = {
            //     ...rest,
            //     dtIndex: this.page.start + index + 1,
            //   };
            //   return finalData;
            // });

            const filteredData: any[] = [];

            for (let index = 0; index < resp.data.length; index++) {
              const item = resp.data[index];
              const detailParam = { returnNo: item.returnNo };

              try {
                const detailRes: any = await this.dataService
                  .postData(this.config.BASE_URL_HQ + '/api/return-order/list-detail', detailParam)
                  .toPromise();

                  console.log('detailres',detailRes.item)
                const hasBekas = detailRes?.item?.some(
                  (barang: any) => barang.flagBrgBekas === 'Y'
                );

                if (hasBekas) {
                  const { rn, ...rest } = item;
                  filteredData.push({
                    ...rest,
                    dtIndex: filteredData.length + 1,
                  });
                }
              } catch (err) {
                console.error(`Error loading detail for returnNo ${item.returnNo}`, err);
              }
            }


            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: filteredData,
            });
          });
      },

      columns: [
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'returnNo', title: 'No retur', searchable: true },
        {
          data: 'dateReturn',
          title: 'Tgl Retur',
            render: (data: any, _: any, row: any) => {
            return this.g.formatStrDateMMM(data);
          },
        },
        { data: 'outletCode', title: 'Outlet Kode', searchable: true },
        { data: 'namaPengirim', title: 'Pengirim', searchable: true },
        { data: 'alamatPengirim', title: 'Alamat Pengirim', searchable: true },
        { data: 'namaGudang', title: 'Gudang tujuan', searchable: true },
        {
          title: 'Action',
            render: (data: any, _: any, row: any) => {
            if (row.statusAktif === 'Aktif') {
              return `
                  <div class="btn-group" role="group" aria-label="Action">
                    <button class="btn btn-sm action-select btn-info btn-60 text-white">${this.buttonCaptionView}</button>
                  </div>
                `;
            }
            return `
                  <div class="btn-group" role="group" aria-label="Action">
                    <button class="btn btn-sm action-select btn-info btn-60 text-white" disabled>${this.buttonCaptionView}</button>
                  </div>
                `;
          },
        },
      ],
      searchDelay: 1500,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );

        return row;
      },
    };
  }

  onAddPressed(): void {
    const route = this.router.createUrlTree([
      '/transaction/penerimaan-barang-bekas/add-data',
    ]);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage('selectedPenerimaanBrgBks', JSON.stringify(data));
      this.router.navigate([
        '/transaction/penerimaan-barang-bekas/detail-retur',
      ]);
      this;
    }
  }

  ngAfterViewInit(): void {
    this.renderDataTablesRetur();
    this.dtTrigger.next(this.dtOptions);

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
    this.dtTrigger.next(this.dtOptions);
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

  closeModal() {
    this.isShowModalReport = false;
    this.selectedRowCetak = null;
    this.disabledPrintButton = false;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list']);
  }

  getDataOnline(): void {
    this.dtElement.dtInstance.then((dtInstance: any) => {
      dtInstance.destroy(); // destroy the old DataTable
      this.renderDataTablesRetur(); // reinitialize dtOptions
      this.dtTrigger.next(this.dtOptions);
 // re-render with new data
    });
  }
}
