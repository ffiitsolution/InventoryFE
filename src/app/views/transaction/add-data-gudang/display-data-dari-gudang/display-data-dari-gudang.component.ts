// import { Component, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
// import { DataService } from '../../../../service/data.service';

// import { GlobalService } from '../../../../service/global.service';
// import { TranslationService } from '../../../../service/translation.service';
// import { Subject } from 'rxjs';
// import { Page } from '../../../../model/page';
// import {
//   ACTION_CETAK,
//   ACTION_VIEW,
//   CANCEL_STATUS,
//   DEFAULT_DATE_RANGE_RECEIVING_ORDER,
//   DEFAULT_DELAY_TABLE,
//   LS_INV_DISPLAY_DATA_GUDANG,
// } from '../../../../../constants';
// import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
// import { DataTableDirective } from 'angular-datatables';
// import moment from 'moment';

// @Component({
//   selector: 'app-display-data-dari-gudang',
//   templateUrl: './display-data-dari-gudang.component.html',
//   styleUrls: ['./display-data-dari-gudang.component.scss'],
// })
// export class DisplayDataGudangComponent implements OnInit {
//   orderNoFilter: string = '';
//   orderDateFilter: string = '';
//   expiredFilter: string = '';
//   tujuanFilter: string = '';
//   dtOptions: any = {};
//   config: any = {
//     BASE_URL: 'http://localhost:8093/inventory/api/delivery-order',
//   };
//   dtTrigger: Subject<any> = new Subject();
//   page = new Page();
//   dtColumns: any = [];
//   showFilterSection: boolean = false;
//   buttonCaptionView: String = 'Lihat';
//   selectedStatusFilter: string = '';
//   orders: any[] = [];
//   public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
//   @ViewChild(DataTableDirective, { static: false }) datatableElement:
//     | DataTableDirective
//     | undefined;
//   currentDate: Date = new Date();

//   startDateFilter: Date = new Date(
//     this.currentDate.setDate(
//       this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
//     )
//   );

//   endDateFilter: Date = new Date(new Date().setDate(new Date().getDate() + 1));
//   dateRangeFilter: any = [this.startDateFilter, this.endDateFilter];
//   selectedRowData: any;

//   constructor(
//     private dataService: DataService,
//     private g: GlobalService,
//     private translation: TranslationService,
//     private router: Router
//   ) {
//     this.dtOptions = {
//       language:
//         translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
//       processing: true,
//       serverSide: true,
//       paging: true,
//       search: true,
//       pageLength: 10,
//       lengthMenu: [
//         [5, 10, 20, 50],
//         [5, 10, 20, 50],
//       ],
//       searching: true,
//       autoWidth: true,
//       info: true,
//       drawCallback: () => {},
//       ajax: (dataTablesParameters: any, callback:any) => {
//         let page = Math.floor(
//           dataTablesParameters.start / dataTablesParameters.length
//         );
//         let limit = dataTablesParameters.length || 10;
//         let offset = page * limit;
//         const params = {
//           ...dataTablesParameters,
//           search: dataTablesParameters.search?.value || '',
//           limit: limit,
//           offset: offset,
//           kodeCabang: this.g.getUserCabangCode(),
//           kodeKota: this.g.getUserCode(),
//           kodeGudang: this.g.getUserLocationCode(),
          

//           startDate: moment(this.dateRangeFilter[0])
//             .set({
//               hours: 0,
//               minutes: 0,
//               seconds: 0,
//               milliseconds: 0,
//             })
//             .format('YYYY-MM-DD HH:mm:ss.SSS'),
//           endDate: moment(this.dateRangeFilter[1])
//             .set({
//               hours: 23,
//               minutes: 59,
//               seconds: 59,
//               milliseconds: 999,
//             })
//             .format('YYYY-MM-DD HH:mm:ss.SSS'),
//         };
//         setTimeout(() => {
//           this.dataService
//             .postData(
//               this.config.BASE_URL + '/display-data-penerimaan-dari-gudang',
//               params
//             )
//             .subscribe((resp: any) => {
//               const data = Array.isArray(resp.displayDataPenerimaanDariGudang)
//                 ? resp.displayDataPenerimaanDariGudang
//                 : [];
//               const mappedData = data.map((item: any, index: number) => {
//                 // hapus rn dari data
//                 const { rn, ...rest } = item;
//                 const finalData = {
//                   ...rest,
//                   // dtIndex: this.page.start + index + 1,
//                   dtIndex: offset + index + 1,
//                   TANGGAL_TERIMA: this.g.transformDate(rest.TANGGAL_TERIMA),
//                   TANGGAL_SURAT_JALAN: this.g.transformDate(
//                     rest.TANGGAL_SURAT_JALAN
//                   ),
//                 };
//                 return finalData;
//               });

//               const totalRecords =
//                 resp.totalRecords !== undefined && !isNaN(resp.totalRecords)
//                   ? resp.totalRecords
//                   : mappedData.length;
//               callback({
//                 recordsTotal: totalRecords,
//                 recordsFiltered: totalRecords,
//                 data: mappedData,
//               });
//             });
//         }, DEFAULT_DELAY_TABLE);
//       },
//       columns: [
//         { data: 'TANGGAL_TERIMA', title: 'Tanggal Terima' },
//         { data: 'TANGGAL_SURAT_JALAN', title: 'Tanggal Surat Jalan' },
//         { data: 'NO_PESANAN', title: 'Nomor Pesanan' },
//         { data: 'NO_SURAT_JALAN', title: 'Nomor Surat Jalan' },
//         { data: 'NO_PENERIMAAN', title: 'Nomor Penerimaan' },
//         { data: 'KODE_GUDANG_PENGIRIM', title: 'Kode Tujuan' },
//         { data: 'NAMA_GUDANG_PENGIRIM', title: 'Gudang Pengirim' },
//         { data: 'STATUS_TRANSAKSI', title: 'Status Transaksi' },
//       ],
//       searchDelay: 1000,
//       // delivery: [],
//       rowCallback: (row: Node, data: any[] | Object, index: number) => {
//         $('.action-view', row).on('click', () =>
//           this.actionBtnClick(ACTION_VIEW, data)
//         );
//         $('.action-cetak', row).on('click', () =>
//           this.actionBtnClick(ACTION_CETAK, data)
//         );
//         $('td', row).on('click', () => {
//           $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
//           if (this.selectedRowData !== data) {
//             this.selectedRowData = data;
//             $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
//           } else {
//             this.selectedRowData = undefined;
//           }
//         });
//         return row;
//       },
//     };
//     this.dtColumns = this.dtOptions.columns;
//   }

//   ngOnInit(): void {}

//   toggleFilter(): void {
//     this.showFilterSection = !this.showFilterSection;
//   }

//   onAddPressed(): void {
//     // Logic for adding a new order
//     const route = this.router.createUrlTree([
//       '/transaction/delivery-item/add-data',
//     ]);
//     this.router.navigateByUrl(route);
//   }

//   actionBtnClick(action: string, data: any = null) {
//     if (action === ACTION_VIEW) {
//       this.g.saveLocalstorage(LS_INV_DISPLAY_DATA_GUDANG, JSON.stringify(data));
//       this.router.navigate(['/transaction/delivery-item/detail-transaction']);
//       this;
//     }
//     if (action === ACTION_CETAK) {
//     }
//   }

//   ngAfterViewInit(): void {
//     this.dtTrigger.next(null);
//   }

//   ngOnDestroy(): void {
//     this.dtTrigger.unsubscribe();
//   }

//   refreshData(): void {
//     const route = this.router.createUrlTree([
//       '/transaction/delivery-item/detail-transaction',
//     ]);
//     this.router.navigateByUrl(route);
//   }
//   onFilterStatusChange(event: Event): void {
//     console.log('Status filter changed:', this.selectedStatusFilter);
//   }

//   onFilterOrderDateChange(event: Event): void {
//     if (event) {
//       const target = event.target as HTMLInputElement | null;
//       if (target) {
//         this.orderDateFilter = target.value;
//       }
//     }
//     this.rerenderDatatable();
//   }

//   rerenderDatatable(): void {
//     this.dtTrigger.next(null);
//   }

//   onFilterExpiredChange(): void {
//     console.log('Expired filter changed:', this.expiredFilter);
//   }

//   onFilterTujuanChange(): void {
//     console.log('Tujuan filter changed:', this.tujuanFilter);
//   }

//   onFilterPressed(): void {
//     this.datatableElement?.dtInstance.then((dtInstance: any) => {
//       dtInstance.ajax.reload();
//     });
//     console.log('filter pressed');
//   }
//   dtPageChange(event: any): void {
//     console.log('Page changed', event);
//   }

//   validateDeliveryDate(): void {
//     const today = new Date();
//     this.orders.forEach((order) => {
//       const deliveryDate = new Date(order.deliveryDate);
//       const timeDiff = Math.abs(today.getTime() - deliveryDate.getTime());
//       const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
//       if (diffDays > 7) {
//         console.warn(
//           `Order ${order.orderNo} has a delivery date older than 7 days.`
//         );
//       }
//     });
//   }
// }

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
import { AppService } from '../../../../service/app.service';

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
    private router: Router,
    private appService: AppService
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          tipeTransaksi: 2,
          startDate: moment(this.dateRangeFilter[0]).format('DD MMM yyyy' ),
          endDate: moment(this.dateRangeFilter[1]).format('DD MMM yyyy' ),
          // kodeCabang: '00074', 
          kodeKota: this.appService.getUserData()?.kodeKota,
        }; 
        console.log('ini params', params);
        console.log('ini kode cabang', dataTablesParameters.kodeCabang);
        console.log('ini kode kota', dataTablesParameters.kodeKota);
        
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/list-penerimaan-gudang/dt', params)
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
            return data ? moment(data).format('DD MMM YYYY') : '';
          }
        },

        { data: 'tglSuratJalan', 
          title: 'Tgl Surat Jln',
          render: (data: any) => {
            return data ? moment(data).format('DD MMM YYYY') : '';
          }
        },
        { data: 'nomorPesanan', title: 'No. Pesanan' },
        { data: 'nomorSuratJalan', title: 'No. Surat Jalan' },
        { data: 'kodePengirim', title: 'Pengirim' },
        { data: 'namaCabangPengirim', title: 'Nama Pengirim' },
        {
          data: 'statusPosting',
          title: 'Status Transaksi',
          render: (data: any) => {
            if (data === 'P') {
              return `<span class="badge bg-success">POSTED</span>`;  
            } else {
              return `<span class="badge bg-secondary">${data}</span>`;  
            }
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
    const route = this.router.createUrlTree(['/transaction/receipt-from-warehouse/tambah-data']);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        'selectedProduction',
        JSON.stringify(data)
      );
      this.router.navigate(['/transaction/receipt-from-warehouse/display-data-dari-gudang/detail-penerimaan-gudang']); this
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshData(): void {
    const route = this.router.createUrlTree(['/transaction/terima-barang-retur-dari-site/detail']);
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
}
