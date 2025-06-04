import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';

import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ACTION_VIEW, CANCEL_STATUS, DEFAULT_DELAY_TABLE, SEND_PRINT_STATUS_SUDAH } from 'src/constants';
import { AppConfig } from 'src/app/config/app.config';
import { HelperService } from '../../../../service/helper.service';
import { AppService } from '../../../../service/app.service';

@Component({
  selector: 'app-detail-pembelian',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailPembelianComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedOrder: any = JSON.parse(
    localStorage['selectedData']
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: boolean = false;
  totalLength: number = 0;
  buttonCaptionView: String = 'Lihat';
  paramGenerateReport = {};
  paramUpdatePrintStatus = {};
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    public helperService: HelperService,
    private appService: AppService
  ) {
    this.g.navbarVisibility = true;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    this.selectedOrder.tglPesanan = this.g.transformDate(this.selectedOrder.tglPesanan),
      this.selectedOrder.tglTransaksi = this.g.transformDate(this.selectedOrder.tglTransaksi),
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
            nomorTransaksi: this.selectedOrder.nomorTransaksi,
            kodeGudang: this.g.getUserLocationCode(),
          };
          setTimeout(() => {
            this.dataService
              .postData(
                this.config.BASE_URL + '/api/pembelian/detail',
                params
              )
              .subscribe((resp: any) => {
                const updatedSelectedOrder = {
                  ...this.selectedOrder,
                  noSjPengirim: resp.data[0]?.noSjPengirim || ' ',
                };
                this.selectedOrder = updatedSelectedOrder;
                this.g.saveLocalstorage(
                  'selectedData',
                  JSON.stringify(updatedSelectedOrder)
                );
                const mappedData = resp.data.map((item: any, index: number) => {
                  const { rn, ...rest } = item;
                  const finalData = {
                    ...rest,
                    dtIndex: this.page.start + index + 1,
                    tglPesanan: this.g.transformDate(rest.tglPesanan),
                    tglTransaksi: this.g.transformDate(rest.tglTransaksi)
                  }
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
            this.paramGenerateReport = {
              nomorTransaksi: this.selectedOrder.nomorTransaksi,
              kodeGudang: this.g.getUserLocationCode(),
              isDownloadCsv: false
            };
            this.paramUpdatePrintStatus = {
              noSuratJalan: this.selectedOrder.noSuratJalan
            }
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'kodeBarang', title: 'Kode Barang' },
          { data: 'namaBarang', title: 'Nama Barang' },
          {
            data: 'konversi', title: 'Konversi',
            render: (data: any, type: any, row: any) => `${data} ${row.satuanKecil} / ${row.satuanBesar} `
          },
          {
            data: 'qtyBesar', title: 'Qty Besar',
            render: (data: any, type: any, row: any) => `${this.g.formatToDecimal(data)} ${row.satuanBesar}`
          },
          {
            data: 'qtyKecil', title: 'Qty Kecil',
            render: (data: any, type: any, row: any) => `${this.g.formatToDecimal(data)} ${row.satuanKecil}`
          },
          {
            data: 'totalQty', title: 'Total Qty',
            render: (data: any, type: any, row: any) => `${this.g.formatToDecimal(data)} ${row.satuanKecil}`
          },
          {
            data: 'qtyKgs', title: 'Total Berat(KGS)',
            render: (data: any, type: any, row: any) => `${data} ${row.satuanKecil}`
          },
          {
            data: 'jenisItem', title: 'Jenis',
            render: (data: any) => {
              if (data === '1') {
                return 'Fresh';
              } else if (data === '2') {
                return 'Frozen';
              } else {
                return '-'
              }
            }
          },

          {
            title: 'Cek Quantity Expired',
            render: (data: any, type: any, row: any) => {
              if (row.flagExpired === 'Y') {
                return `<div class="d-flex justify-content-start">
                    <button class="btn btn-sm action-view btn-outline-success w-50"><i class="fa fa-check pe-1"></i> Cek</button>
              </div>`;
              } else {
                return '';
              }
            },
          },

        ],
        searchDelay: 1000,
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
  reloadTable() {
    setTimeout(() => {
      this.datatableElement?.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }, DEFAULT_DELAY_TABLE);
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Detail Pesanan') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedOrder.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedOrder.cetakSuratJalan == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }
  actionBtnClick(action: string, data: any = null) {
    this.selectedRowData = data
    const payload = {
      nomorTransaksi: this.selectedOrder.noSuratJalan,
      kodeBarang: data.kodeBarang,
      tipeTransaksi: 3,
    };

    this.appService
      .getExpiredData(payload)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res) {
            this.listDataExpired = res;
            this.isShowModalExpired = true;
          }
        },
        error: (err) => {
          // Handle error case and show error toast
          this.toastr.error('Kode barang tidak ditemukan!');
        },
      });
  }
  dtPageChange(event: any) { }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index: any) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('selectedData');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate(['/transaction/pembelian/list-dt']);
  }

  onDelete() {
    this.RejectingOrder = true;
    Swal.fire({
      title: this.translation.instant('confirmDeleteDeliveryLabel'),
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'OK',
      showLoaderOnConfirm: true,
      preConfirm: async (keterangan2) => {
        try {
          const params = {
            status: '4',
            user: this.g.getUserCode(),
            keterangan2,
            nomorPesanan: this.selectedOrder.nomorPesanan,
          };
          const url = `${this.config.BASE_URL}/inventory/api/delivery-order/update-status`;
          const response = await lastValueFrom(
            this.dataService.postData(url, params)
          );
          if ((response as any).success) {
            this.toastr.success('Berhasil membatalkan pengiriman');
            setTimeout(() => {
              this.router.navigate(['/transaction/delivery-item']);
            }, DEFAULT_DELAY_TABLE);
          } else {
            this.toastr.error((response as any).message);
          }
        } catch (error: any) {
          this.toastr.error('Error: ', error);
        } finally {
          this.RejectingOrder = false;
        }
      },
    });
  }

  getPrintStatus() {
    if (this.selectedOrder.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }

  listDataExpired: any[] = [];
  isShowModalExpired: boolean = false;
  selectedRowData: any = {};

  getTotalQty(): number {
    return this.listDataExpired.reduce((sum, item) => {
      return sum + Math.abs(Number(item.totalQty));
    }, 0);
  }
}
