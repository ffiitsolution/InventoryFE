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
  LS_INV_SELECTED_RECEIVING_ORDER,
  OUTLET_BRAND_KFC,
  SEND_PRINT_STATUS_SUDAH,
  STATUS_SAME_CONVERSION,
} from '../../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AppService } from '../../../../service/app.service';

@Component({
  selector: 'app-detail-receiving-order',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class ReceivingOrderDetailComponent
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
    localStorage[LS_INV_SELECTED_RECEIVING_ORDER]
  );
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  disabledCancelButton: boolean = false;
  disabledPrintButton: boolean = false;
  updatingStatus: boolean = false;
  RejectingOrder: boolean = false;
  alreadyPrint: Boolean = false;
  totalLength: number = 0;
  buttonCaptionView: String = 'Lihat';
  isShowModalBatal: boolean = false;
  alasanDiBatalkan: string = '';
  
  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService
  ) {
    this.g.navbarVisibility = false;
    this.selectedOrder = JSON.parse(this.selectedOrder);
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
          nomorPesanan: this.selectedOrder?.nomorPesanan,
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL + '/api/receiving-order/detail/dt',
              params
            )
            .subscribe((resp: any) => {
              const updatedSelectedOrder = {
                ...this.selectedOrder,
                noSjPengirim: resp.data[0]?.noSjPengirim || ' ',
              };
              this.selectedOrder = updatedSelectedOrder;
              this.g.saveLocalstorage(
                LS_INV_SELECTED_RECEIVING_ORDER,
                JSON.stringify(updatedSelectedOrder)
              );
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  konversi: `${rest.konversi}.00 ${rest.satuanBesar}/${rest.satuanKecil}`,
                  konversiProduct: `${rest.konversiProduct || 0} ${rest.satuanBesarProduct || '-'
                    }/${rest.satuanKecilProduct || '-'}`,
                  qtyPesanBesar: this.g.formatToDecimal(rest.qtyPesanBesar),
                  totalQtyPesan: this.g.formatToDecimal(rest.totalQtyPesan),
                  qtyPesanKecil: this.g.formatToDecimal(rest.qtyPesanKecil),
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
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'dtIndex', title: '#' },
        { data: 'kodeBarang', title: 'Kode Barang', searchable: true },
        { data: 'namaBarang', title: 'Nama Barang', searchable: true },
        { data: 'konversi', title: 'Konversi Pesan' },
        { data: 'qtyPesanBesar', title: 'Qty Pesan Besar' },
        { data: 'qtyPesanKecil', title: 'Qty Pesan Kecil' },
        { data: 'totalQtyPesan', title: 'Total Pesanan' },
        { data: 'konversiProduct', title: 'Konversi Gudang' },
        {
          data: 'keterangan',
          title: 'Keterangan',
          render: (data) => {
            if (data.toUpperCase() == STATUS_SAME_CONVERSION) {
              return `
                <span class="text-center text-success">${data}</span>
              `;
            } else {
              return `
                <span class="text-center text-danger">${data}</span>
              `;
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
      this.selectedOrder.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }
  actionBtnClick(action: string, data: any = null) { }

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
    this.router.navigate(['/order/receiving-order']);
  }

  onDelete() {
    this.RejectingOrder = true;
    Swal.fire({
      title: this.translation.instant('confirmDeleteReceivingLabel'),
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
          const url = `${this.config.BASE_URL}/api/receiving-order/update`;
          const response = await lastValueFrom(
            this.dataService.postData(url, params)
          );
          if (response.success) {
            this.toastr.success('Berhasil membatalkan penerimaan');
            setTimeout(() => {
              this.router.navigate(['/order/receiving-order']);
            }, DEFAULT_DELAY_TABLE);
          } else {
            this.toastr.error(response.message);
          }
        } catch (error: any) {
          this.toastr.error('Error: ', error);
        } finally {
          this.RejectingOrder = false;
        }
      },
    });
  }

  async onButtonActionPressed(status: string) {
    if (status == CANCEL_STATUS) {
      this.onDelete();
    } else {
      this.updatingStatus = true;
      const updatePrintStatusParams = {
        status,
        user: this.g.getUserCode(),
        nomorPesanan: this.selectedOrder.nomorPesanan,
      };

      const updatePrintStatusResponse = await lastValueFrom(
        this.dataService.postData(
          this.config.BASE_URL + '/api/receiving-order/update',
          updatePrintStatusParams
        )
      );

      if (updatePrintStatusResponse.success) {
        const transformedSelectedOrder = {
          ...this.selectedOrder,
          statusCetak: status,
          statusPesanan: 'T',
        };

        this.selectedOrder = transformedSelectedOrder;
        this.g.saveLocalstorage(
          LS_INV_SELECTED_RECEIVING_ORDER,
          JSON.stringify(transformedSelectedOrder)
        );

        try {
          const generatePdfParams = {
            outletBrand: OUTLET_BRAND_KFC,
            user: this.g.getUserCode(),
            nomorPesanan: this.selectedOrder.nomorPesanan,
          };
          const base64Response = await lastValueFrom(
            this.dataService.postData(
              `${this.config.BASE_URL}/api/receiving-order/report`,
              generatePdfParams,
              true
            )
          );
          const blob = new Blob([base64Response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        } catch (error: any) {
          this.toastr.error(
            error.message ?? 'Unknown error while generate pdf'
          );
        } finally {
          this.updatingStatus = false;
          this.reloadTable();
        }
      } else {
        this.toastr.error(updatePrintStatusResponse.message);
      }
      this.updatingStatus = false;
    }
  }

  getPrintStatus() {
    if (this.selectedOrder.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }

  downloadURL: any = [];

  onPrint() {
    const params = {
      outletBrand: 'Kfc',
      isDownloadCsv: false,
      staffName: JSON.parse(localStorage.getItem('inv_currentUser') || '{}').namaUser || 'Guest',
      nomorPesanan: this.selectedOrder.nomorPesanan,
      tglBrgDikirim: this.selectedOrder.tglBrgDikirim,
      tglPesan: this.selectedOrder.tglPesan
    }

    this.appService.reporReceivingOrderJasper(params).subscribe((res) => {
      var blob = new Blob([res], { type: 'application/pdf' });
      this.downloadURL = window.URL.createObjectURL(blob);
      this.downloadPDF();
    })

  }

  downloadPDF() {
    var link = document.createElement('a');
    link.href = this.downloadURL;
    link.download = `Report Receiving Order tanggal ${this.selectedOrder.tglPesan}.pdf`;
    link.click();
    this.toastr.success('File sudah terunduh.', 'Selamat');
  }
  async updateStatus(){
    try {
      const params = {
        status: '4',
        user: this.g.getUserCode(),
        keterangan2: this.alasanDiBatalkan,
        nomorPesanan: this.selectedOrder.nomorPesanan,
      };
      const url = `${this.config.BASE_URL}/api/receiving-order/update`;
      const response = await lastValueFrom(
        this.dataService.postData(url, params)
      );
      if (response.success) {
        this.toastr.success('Berhasil membatalkan penerimaan');
        setTimeout(() => {
          this.router.navigate(['/order/receiving-order']);
        }, DEFAULT_DELAY_TABLE);
      } else {
        this.toastr.error(response.message);
      }
    } catch (error: any) {
      this.toastr.error('Error: ', error);
    } finally {
      this.RejectingOrder = false;
    }
  }
  onShowModalBatal(){
    this.isShowModalBatal = true;
  }
}
