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
import { ActivatedRoute, Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  SEND_PRINT_STATUS_SUDAH,
} from 'src/constants';
import { AppConfig } from 'src/app/config/app.config';
import { AppService } from '../../../../service/app.service';
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-detail-production',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailProductionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedProduction: any = JSON.parse(localStorage['selectedProduction']);
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
  listDataExpired: any[] = [];
  protected config = AppConfig.settings.apiServer;
  isShowModalExpired: boolean = false;
  selectedRowData: any;
  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService,
    public helper: HelperService
  ) {
    this.g.navbarVisibility = true;
    this.selectedProduction = JSON.parse(this.selectedProduction);
    (this.selectedProduction.tglPesanan = this.g.transformDate(
      this.selectedProduction.tglPesanan
    )),
      (this.selectedProduction.tglTransaksi = this.g.transformDate(
        this.selectedProduction.tglTransaksi
      )),
      (this.selectedProduction.konversi = parseFloat(
        this.selectedProduction.konversi
      ).toFixed(2)),
      (this.selectedProduction.jumlahResep = parseFloat(
        this.selectedProduction.jumlahResep
      ).toFixed(2)),
      (this.selectedProduction.totalProduksi = parseFloat(
        this.selectedProduction.totalProduksi
      ).toFixed(2)),
      (this.dtOptions = {
        language:
          translation.getCurrentLanguage() == 'id'
            ? translation.idDatatable
            : {},
        processing: true,
        serverSide: true,
        autoWidth: true,
        info: true,
        drawCallback: () => {},
        ajax: (dataTablesParameters: any, callback:any) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
          const params = {
            ...dataTablesParameters,
            nomorTransaksi: this.selectedProduction.nomorTransaksi,
            kodeGudang: this.g.getUserLocationCode(),
          };
          setTimeout(() => {
            this.dataService
              .postData(this.config.BASE_URL + '/api/production/detail', params)
              .subscribe((resp: any) => {
                const updatedselectedProduction = {
                  ...this.selectedProduction,
                  noSjPengirim: resp.data[0]?.noSjPengirim || ' ',
                };
                this.selectedProduction = updatedselectedProduction;
                this.g.saveLocalstorage(
                  'selectedProduction',
                  JSON.stringify(updatedselectedProduction)
                );
                const mappedData = resp.data.map((item: any, index: number) => {
                  const { rn, ...rest } = item;
                  const finalData = {
                    ...rest,
                    dtIndex: this.page.start + index + 1,
                    tglPesanan: this.g.transformDate(rest.tglPesanan),
                    tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  };
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
              noTransaksi: this.selectedProduction.nomorTransaksi,
              userEntry: this.selectedProduction.userCreate,
              jamEntry: this.g.transformTime(
                this.selectedProduction.timeCreate
              ),
              tglEntry: this.g.transformDate(
                this.selectedProduction.dateCreate
              ),
              outletBrand: 'KFC',
              kodeGudang: this.g.getUserLocationCode(),
              isDownloadCsv: false,
              reportName: 'cetak_production',
              confirmSelection: 'Ya',
            };
            this.paramUpdatePrintStatus = {
              nomorTransaksi: this.selectedProduction.nomorTransaksi,
            };
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'kodeBarang', title: 'Kode Barang' },
          { data: 'namaBarang', title: 'Nama Barang' },
          {
            data: 'konversi',
            title: 'Konversi',
            render: (data:any, type:any, row:any) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}`,
          },
          {
            data: 'qtyBesar',
            title: 'Qty Besar',
            render: (data:any, type:any, row:any) =>
              `${Number(data).toFixed(2)} ${row.satuanBesar}`,
          },
          {
            data: 'qtyKecil',
            title: 'Qty Kecil',
            render: (data:any, type:any, row:any) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}`,
          },
          {
            data: 'totalQty',
            title: 'Total Qty',
            render: (data:any, type:any, row:any) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}`,
          },
          {
            title: 'Cek Quantity Expired',
            render: (data:any, type:any, row:any) => {
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
      });
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
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedProduction.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedProduction.cetakSuratJalan == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRowData = data;
    const payload = {
      nomorTransaksi: this.selectedProduction.nomorTransaksi,
      kodeBarang: data.kodeBarang,
      tipeTransaksi: 12,
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

  dtPageChange(event: any) {}

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
    localStorage.removeItem('selectedWastage');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {

    if (this.selectedProduction.statusPosting!=='P') {
      this.router.navigate(['/transaction/production/list-dt-for-posting']);
    }else{
      this.router.navigate(['/transaction/production/list-dt']);
    }

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
            nomorPesanan: this.selectedProduction.nomorPesanan,
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
    if (this.selectedProduction.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }

  getTotalQty(): number {
    return this.listDataExpired.reduce((sum, item) => {
      return sum + Math.abs(Number(item.totalQty));
    }, 0);
  }
}
