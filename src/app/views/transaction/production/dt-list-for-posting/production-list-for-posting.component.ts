import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataTableDirective } from 'angular-datatables';
import moment from 'moment';
import { AppConfig } from '../../../../config/app.config';
import { AppService } from '../../../../service/app.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-production-list-for-posting',
  templateUrl: './production-list-for-posting.component.html',
  styleUrls: ['./production-list-for-posting.component.scss'],
})
export class ProductionListForPostingComponent implements OnInit {
  orderNoFilter: string = '';
  orderDateFilter: string = '';
  expiredFilter: string = '';
  tujuanFilter: string = '';
  dtOptions: any = {};
  protected config = AppConfig.settings.apiServer;

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
  // selectedTime: Date = new Date();
  // selectedTimeEnd: Date = new Date();
  startTime: string = '09:00';
  endTime: string = '18:00';
  loadingSimpan: boolean = false;
  loadingDetail: { [key: number]: boolean } = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  listSummaryData: any[] = [];
  totalTransSummary: number = 0;
  isShowModalPosting : boolean = false;
  loadingPosting: boolean = false;
  isAdjusting = false;
  listNotrans: any[] = [];
  resizeTimeout: any;
  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private appService: AppService,
    private toastr: ToastrService
  ) {
    this.dtColumns = this.dtOptions.columns;
    this.g.navbarVisibility = false;
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
  }

  ngOnInit(): void {}

  toggleFilter(): void {
    this.showFilterSection = !this.showFilterSection;
  }

  renderDatatable(): void {
    this.dtOptions = {
      language:
        this.translation.getCurrentLanguage() == 'id'
          ? this.translation.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: false,
      order: [
        [1, 'desc'],
        [2, 'desc'],
      ],
      drawCallback: () => {
      
        // if (!this.isAdjusting) {
        //   this.isAdjusting = true;  // Set the flag to true to indicate adjusting in progress
        //   setTimeout(() => {
        //     const dtInstance = $('.dataTable').DataTable();
        //     if (dtInstance) {
        //       dtInstance.columns.adjust().draw(false);
        //     }
        //     this.isAdjusting = false;  // Reset the flag once adjustment is done
        //   }, 100);
        // }
      },      
      ajax: (dataTablesParameters: any, callback:any) => {
        const [startHour, startMinute] = this.startTime.split(':').map(Number);
        const [endHour, endMinute] = this.endTime.split(':').map(Number);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          startDate: moment(this.dateRangeFilter[0])
            .set({
              hours: startHour,
              minutes: startMinute,
              seconds: 0,
              milliseconds: 0,
            })
            .format('YYYY-MM-DD HH:mm:ss.SSS'),
          endDate: moment(this.dateRangeFilter[1])
            .set({
              hours: endHour,
              minutes: endMinute,
              seconds: 59,
              milliseconds: 999,
            })
            .format('YYYY-MM-DD HH:mm:ss.SSS'),
            statusPosting:['B','K']
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
        { data: 'dtIndex', title: '#', width: '10px' },
        { data: 'tglTransaksi', title: 'Tanggal Transaksi', width: '80px' },
        { data: 'nomorTransaksi', title: 'No. Transaksi', width: '120px' },
        { data: 'kodeProduksi', title: 'Kode Produksi', width: '70px' },
        { data: 'barangProduksi', title: 'Barang Produksi', width: '200px' },
        {
          data: 'konversi',
          title: 'Konversi',
          width: '80px',
          render: function (data:any, type:any, row:any) {
            return (
              Number(data).toFixed(2) +
              ' ' +
              row.satuanKecil +
              '/' +
              row.satuanBesar
            );
          },
        },
        {
          data: 'jumlahResep',
          title: 'Jumlah Produksi',
          width: '80px',
          render: function (data:any, type:any, row:any) {
            return Number(data).toFixed(2) + ' ' + row.satuanBesar;
          },
        },
        {
          data: 'totalProduksi',
          title: 'Total Produksi',
          width: '80px',
          render: function (data:any, type:any, row:any) {
            return Number(data).toFixed(2) + ' ' + row.satuanKecil;
          },
        },
        { data: 'tglExp', title: 'Tgl Expired', width: '80px' },
        {
          data: 'statusPosting',
          title: 'Status Transaksi',
          width: '100px',
          render: (data:any) => this.g.getStatusProduksiLabel(data, false),
        },
        {
          title: 'Aksi',
          width: '120px',
          render: (data: any, type: any, row: any, meta: any) => {
            const index = meta.row; // get the row index
            const isLoading = this.loadingDetail[index];
            const statusPosting = row.statusPosting;
            // If loading, show spinner, otherwise show the buttons
            return isLoading
              ? `
              <div class="d-flex justify-content-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            `
              : `
              <div class="btn-group" role="group" aria-label="Action" style="width: 100%">
                  <button class="btn btn-sm  action-view btn-outline-success btn-60">
                   Lihat
                </button>
                <button class="btn btn-sm action-ubah btn-outline-primary btn-60" ${statusPosting === 'B' ? 'disabled' : ''}>
                  Ubah
                </button>
             
              </div>`;
          },
        },
      ],
      searchDelay: 1000,
      //  <button class="btn btn-sm action-print btn-outline-primary btn-60">
      //           ${this.buttonCaptionPrint}
      //         </button>
    // <button class="btn btn-sm action-posting btn-outline-primary btn-60" ${statusPosting === 'B' ? 'disabled' : ''}>Posting</button>

      // delivery: [],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-ubah', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-view', row).on('click', () =>
          this.actionLihatClick(ACTION_VIEW, data)
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
        $('.action-print', row).on('click', () => {
          // this.onClickPrint(data)
          this.selectedRowCetak = data;
          this.isShowModalReport = true;

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
        });
        $('.action-posting', row).on('click', () => {
          this.onPosting(data, index);
        });
        return row;
      },
    };
  }
  onAddPressed(): void {
    const route = this.router.createUrlTree([
      '/transaction/production/add-data',
    ]);
    this.router.navigateByUrl(route);
  }

  actionBtnClick(action: string, data: any = null) {
    // if (action === ACTION_VIEW) {
    //   this.g.saveLocalstorage('selectedProduction', JSON.stringify(data));
    //   this.router.navigate(['/transaction/production/detail']);
    //   this;
    // }

    this.g.saveLocalstorage('headerMpcsProduksi', JSON.stringify(data));
    this.router.navigate(['/transaction/production/add-data']);
  }

  actionLihatClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage('selectedProduction', JSON.stringify(data));
      this.router.navigate(['/transaction/production/detail']);
      this;
    }
  }

  ngAfterViewInit(): void {
    this.renderDatatable();
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

  onPosting(data: any, index: number) {
    this.loadingSimpan = true;
    this.loadingDetail[index] = true;
    this.getDataOnline();
    const requestBody = {
      nomorTransaksi: [data.nomorTransaksi],
      kodeGudang: this.g.getUserLocationCode(),
      userCreate: this.g.getLocalstorage('inv_currentUser').kodeUser,
    };

    Swal.fire({
      ...this.g.componentKonfirmasiPosting,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup',
      },
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');

        submitBtn?.addEventListener('click', () => {
          this.appService.postingProduction(requestBody).subscribe({
            next: (res: any) => {
              if (!res.success) {
                this.appService.handleErrorResponse(res);
              } else {
                this.toastr.success('Berhasil Posting!');
              }

              this.loadingSimpan = false;
              this.loadingDetail[index] = false;
              this.getDataOnline();
              Swal.close();
            },
            error: (err: any) => {
              console.log('An error occurred while updating the profile.');
              this.loadingSimpan = false;
              this.loadingDetail[index] = false;
              this.getDataOnline();
              Swal.close();
            },
          });
        });

        cancelBtn?.addEventListener('click', () => {
          Swal.close();
          this.toastr.info('Posting dibatalkan');
          this.loadingSimpan = false;
          this.loadingDetail[index] = false;
          this.getDataOnline();
        });
      },
    });
  }

  getDataOnline(): void {
    this.dtElement.dtInstance.then((dtInstance: any) => {
      dtInstance.destroy(); // destroy the old DataTable
      this.renderDatatable();
      this.dtTrigger.next(this.dtOptions);
      // re-render with new data
    });
  }

    getSummaryData() {
      const [startHour, startMinute] = this.startTime.split(':').map(Number);
      const [endHour, endMinute] = this.endTime.split(':').map(Number);
      const params = {
        kodeGudang: this.g.getUserLocationCode(),
        startDate: moment(this.dateRangeFilter[0]).set({
                    hours: startHour,
                    minutes: startMinute,
                    seconds: 0,
                    milliseconds: 0,
                  }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
        endDate: moment(this.dateRangeFilter[1]).set({
                    hours: endHour,
                    minutes: endMinute,
                    seconds: 59,
                    milliseconds: 999,
                  }).format('YYYY-MM-DD HH:mm:ss.SSS' ),
      };
      this.appService
      .getSummaryPostingProduction(params)
      .subscribe((resp) => {
        this.listSummaryData = resp.data.data;
        this.totalTransSummary = resp.data.totalData;
        this.listNotrans = resp.data.listNotrans;
      });
    }

    onPostingData() {
       this.loadingPosting = true;

        const requestBody = {
          kodeGudang: this.g.getUserLocationCode(),
          nomorTransaksi: this.listNotrans,
        };

        Swal.fire({
          ...this.g.componentKonfirmasiPosting,
          showConfirmButton: false,
          showCancelButton: false,
          width: '600px',
          customClass: {
            popup: 'custom-popup',
          },
          didOpen: () => {
            const submitBtn = document.getElementById('btn-submit');
            const cancelBtn = document.getElementById('btn-cancel');

            submitBtn?.addEventListener('click', () => {
              this.appService.postingProduction(requestBody).subscribe({
                next: (res: any) => {
                  if (!res.success) {
                    this.appService.handleErrorResponse(res);
                  } else {
                    this.toastr.success('Berhasil Posting!');
                  }
                  this.loadingPosting = false;
                  Swal.close();
                  const currentUrl = this.router.url;
                  this.router.navigateByUrl('/empty', { skipLocationChange: true }).then(() => {
                    this.router.navigate([currentUrl]);
                  });
                },
                error: (err: any) => {
                  console.log('An error occurred while Kirim Data.');
                  this.loadingPosting = false;

                  Swal.close();
                },
              });
            });

            cancelBtn?.addEventListener('click', () => {
              Swal.close();
              this.toastr.info('Posting dibatalkan');
              this.loadingPosting = false;
            });
          },
        });
    }

    showModalPosting() {
      this.getSummaryData();
      this.isShowModalPosting = true;
    }

    onPreviousPressed(): void {
      this.router.navigate(['/transaction/production/']);
    }

   
  
}
