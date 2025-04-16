import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from '../../../../service/translation.service';

import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from '../../../../model/page';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../../constants';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-detail-barang-retur',
  templateUrl: './detail-barang.component.html',
  styleUrl: './detail-barang.component.scss',
})
export class DetailBarangReturComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedOrder: any = localStorage.getItem('pemakaianBarangSendiri')
    ? JSON.parse(localStorage.getItem('pemakaianBarangSendiri')!)
    : {};
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
  cekPrint: any;
  printData: any;

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.g.navbarVisibility = true;
    this.selectedOrder = JSON.parse(this.selectedOrder);
    (this.selectedOrder.tglPesanan = this.g.transformDate(
      this.selectedOrder.tglPesanan
    )),
      (this.selectedOrder.tglTransaksi = this.g.transformDate(
        this.selectedOrder.tglTransaksi
      )),
      (this.dtOptions = {
        language:
          translation.getCurrentLanguage() == 'id'
            ? translation.idDatatable
            : {},
        processing: true,
        serverSide: true,
        autoWidth: true,
        info: true,
        paging: true,
        ordering: true,
        pageLength: 10,
        lengthMenu: [
          [10, 25, 50, 100],
          [10, 25, 50, 100],
        ],
        drawCallback: () => {},
        ajax: (dataTablesParameters: any, callback) => {
          this.page.start = dataTablesParameters.start || 0;
          this.page.length = dataTablesParameters.length || 10;
          const {
            NOMOR_TRANSAKSI: nomorTransaksi,
          } = this.selectedOrder ?? {};
          const params = {
            ...dataTablesParameters,
            nomorTransaksi: nomorTransaksi?.trim() ?? '',
          };
          setTimeout(() => {
            this.dataService
              .postData(
                this.config.BASE_URL +
                  '/api/delivery-order/detail-retur-supplier',
                params
              )
              .subscribe((resp: any) => {
                const updatedSelectedOrder = resp.data?.length
                  ? {
                      ...this.selectedOrder,
                      noSjPengirim: resp.data[0]?.noSjPengirim || '',
                    }
                  : this.selectedOrder;
                this.selectedOrder = updatedSelectedOrder;
                this.g.saveLocalstorage(
                  'PemakaianBarangSendiri',
                  JSON.stringify(updatedSelectedOrder)
                );

                const mappedData = resp.data.map((item: any, index: number) => {
                  const { rn, ...rest } = item;
                  const finalData = {
                    ...rest,
                    dtIndex: this.page.start + index + 1,
                    tglExpired: this.g.transformDate(rest.tglExpired),
                    keteranganTanggal: this.g.transformDate(
                      rest.KETERANGAN_TANGGAL
                    ),
                  };
                  return finalData;
                });
                this.page.recordsTotal = resp.totalElements; 
                this.page.recordsFiltered = resp.totalElements;
                this.totalLength = mappedData.length;
                callback({
                recordsTotal: resp.totalElements, 
                recordsFiltered: resp.totalElements, 
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
              kodeTujuan: this.selectedOrder.kodeTujuan,
              namaTujuan: this.selectedOrder.namaTujuan,
              keterangan: this.selectedOrder.keterangan,
            };
            this.paramUpdatePrintStatus = {
              noSuratJalan: this.selectedOrder.noSuratJalan,
            };
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'KODE_BARANG', title: 'Kode Barang' },
          { data: 'NAMA_BARANG', title: 'Nama Barang' },
          {
            data: 'KONVERSI',
            title: 'Konversi',
            render: function (data, type, row) {
              return parseFloat(data).toFixed(2) + ' ' + row.SATUAN_KECIL;  // Menambahkan .00
            },
          },
          {
            data: 'QTY_BESAR',
            title: 'Qty Besar',
            render: function (data, type, row) {
              return parseFloat(data).toFixed(2) + ' ' + row.SATUAN_BESAR;  // Menambahkan .00
            },
          },
          {
            data: 'QTY_KECIL',
            title: 'Qty Kecil',
            render: function (data, type, row) {
              return parseFloat(data).toFixed(2) + ' ' + row.SATUAN_KECIL;  // Menambahkan .00
            },
          },
          {
            data: 'TOTAL_QTY',
            title: 'Qty Total',
            render: function (data, type, row) {
              return parseFloat(data).toFixed(2) + ' ' + row.SATUAN_KECIL;  // Menambahkan .00
            },
          },
          {
            data: 'TOTAL_QTY',
            title: 'Qty Total',
            render: function (data, type, row) {
              return data + ' ' + row.SATUAN_BESAR + ' ' + row.SATUAN_KECIL;
            },
          },
          { data: 'TGL_EXPIRED', title: 'Tanggal Expired',
            render: (data) => this.g.transformDate(data),
          },
          // { data: 'KETERANGAN_TANGGAL', title: 'Tanggal Expired', 
          //   render: (data) => this.g.transformDate(data),
          // },
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
  actionBtnClick(action: string, data: any = null) {}

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

  ngOnDestroy(): void {
    localStorage.removeItem('selectedWastage');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate([
      '/transaction/retur-ke-supplier/list-barang-retur',
    ]);
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
            status: '6',
            user: this.g.getUserCode(),
            keterangan2,
            nomorPesanan: this.selectedOrder.nomorPesanan,
          };
          const url = `${this.config.BASE_URL}/api/delivery-order/detail-retur-supplier`;
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

  getStatusPostingLegend(status: string): string {
    const legends: { [key: string]: string } = {
      P: 'Posted',
      U: 'Unposted',
      D: 'Draft',
    };
    return legends[status] || 'Unknown';
  }

  handleCetakAtauPrint(data: any) {
    this.cekPrint = data;
    this.printData = data;
  }

  onCetakAtauPrintReport(isDownload: boolean, nomorTransaksi?: string) {
    nomorTransaksi =
      nomorTransaksi?.trim() ??
      this.selectedOrder?.NOMOR_TRANSAKSI?.trim() ??
      '';

    if (!nomorTransaksi) {
      alert('Nomor Transaksi tidak ditemukan. Silakan coba lagi.');
      console.error('Error: NOMOR_TRANSAKSI kosong atau tidak ditemukan!');
      return;
    }

    const requestBody = { nomorTransaksi, isDownload };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
    });

    this.http
      .post(
        `${this.config.BASE_URL}/api/delivery-order/report-barang-supplier`,
        requestBody,
        { headers, responseType: 'blob' }
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response as any], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          if (isDownload) {
            const a = document.createElement('a');
            a.href = url;
            a.download = 'report-pemakaian-barang-sendiri.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const printWindow = window.open(url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.print();
              };
            }
          }
        },
        (error) => {
          console.error('Gagal mengambil laporan:', error);
          alert('Gagal mengambil laporan. Silakan coba lagi.');
        }
      );
  }
}
