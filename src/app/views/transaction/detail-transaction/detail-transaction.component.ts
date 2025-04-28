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
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppConfig } from '../../../config/app.config';
import { AppService } from '../../../service/app.service';
import { HelperService } from '../../../service/helper.service';

@Component({
  selector: 'app-detail-delivery-order',
  templateUrl: './detail-transaction.component.html',
  styleUrl: './detail-transaction.component.scss',
})
export class DetailTransactionComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedOrder: any = JSON.parse(
    localStorage[LS_INV_SELECTED_DELIVERY_ORDER]
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
  listDataExpired: any[] = [];
  isShowModalExpired: boolean = false;

  protected config = AppConfig.settings.apiServer;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService,
    public helperService: HelperService
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
        ajax: (dataTablesParameters: any, callback) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
          const params = {
            ...dataTablesParameters,
            noSuratJalan: this.selectedOrder?.noSuratJalan,
            kodeGudang: this.g.getUserLocationCode(),
          };
          setTimeout(() => {
            this.dataService
              .postData(
                this.config.BASE_URL + '/api/delivery-order/details',
                params
              )
              .subscribe((resp: any) => {
                const updatedSelectedOrder = {
                  ...this.selectedOrder,
                  noSjPengirim: resp.data[0]?.noSjPengirim || ' ',
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
                    dtIndex: this.page.start + index + 1,
                    tglPesanan: this.g.transformDate(rest.tglPesanan),
                    tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                    konversi: this.g.formatToDecimal(rest.konversi),
                    totalQtyPesan: this.g.formatToDecimal(rest.totalQtyPesan),
                    qtyBKirim: this.g.formatToDecimal(rest.qtyBKirim),
                    qtyKKirim: this.g.formatToDecimal(rest.qtyKKirim),
                    totalQtyKirim: this.g.formatToDecimal(rest.totalQtyKirim),
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
              outletBrand: 'KFC',
              userEntry: this.selectedOrder.userCreate,
              nomorPesanan: this.selectedOrder?.nomorPesanan,
              isDownloadCsv: true,
              noSuratJalan: this.selectedOrder.noSuratJalan,
              tglBrgDikirim: this.selectedOrder.tglTransaksi,
              tglPesan: this.selectedOrder.tglPesanan,
              tglEntry: this.selectedOrder.dateCreate,
              jamEntry: this.selectedOrder.timePosted.replace(/(\d{2})(?=\d)/g, '$1:'),
              kodeTujuan: this.selectedOrder.kodeTujuan,
              namaTujuan: this.selectedOrder.namaTujuan,
              keterangan: this.selectedOrder.keterangan,
              alamatTujuan: this.selectedOrder.alamatTujuan
            };
            this.paramUpdatePrintStatus = {
              noSuratJalan: this.selectedOrder.noSuratJalan
            }
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'dtIndex', title: '#' },
          { data: 'kodeBarang', title: 'Kode Barang' },
          { data: 'namaBarang', title: 'Nama Barang' },
          {
            data: 'totalQtyPesan', title: 'Total Qty Pesan',
            render: (data, type, row) => `${data} ${row.satuanKecil}`
          },
          {
            data: 'qtyBKirim', title: 'Qty Kirim Besar',
            render: (data, type, row) => `${data} ${row.satuanBesar}`
          },
          {
            data: 'qtyKKirim', title: 'Qty Kirim Kecil',
            render: (data, type, row) => `${data} ${row.satuanKecil}`
          },
          {
            data: 'konversi', title: 'Konversi',
            render: (data, type, row) => `${data} `
          },
          {
            data: 'totalQtyKirim', title: 'Total Qty Kirim',
            render: (data, type, row) => `${data} ${row.satuanKecil}`
          },
          {
            title: 'Cek Quantity Expired',
            render: (data, type, row) => {
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
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
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

  getTotalQty(): number {
    return this.listDataExpired.reduce((sum, item) => {
      return sum + Math.abs(Number(item.totalQty));
    }, 0);
  }
  selectedRowData: any = {};
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
    this.dtOptions?.columns?.forEach((column: any, index) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  ngOnDestroy(): void {
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate(['/transaction/delivery-item']);
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
}
