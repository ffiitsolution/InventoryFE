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
  DEFAULT_DELAY_TIME
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
import moment from 'moment';
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-detail-receiving-po-supplier',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class ReceivingPoSupplierDetailComponent
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
  dataUser: any;

  listCurrentPage: number = 1;
  itemsPerPage: number = 5;
  searchListViewOrder: string = '';
  listOrderData: any[] = [];
  statusSameConversion = STATUS_SAME_CONVERSION;
  public loading: boolean = false;

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService,
    public helper: HelperService

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
              this.config.BASE_URL + '/api/receiving-po-supplier/detail/dt',
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
                  konversi: `${rest.konversi}.00 ${rest.satuanKecil}/${rest.satuanBesar}`,
                  konversiProduct: `${rest.konversi}.00 ${rest.satuanKecilProduct || '-'
                    }/${rest.satuanBesarProduct || '-'}`,
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
        { data: 'kodeBarang', title: 'Kode', searchable: true },
        { data: 'namaBarang', title: 'Nama Barang', searchable: true },
        { data: 'konversi', title: 'Konversi Supplier' },
        { data: 'qtyPesanBesar', title: 'Qty Pesan Bsr' },
        { data: 'qtyPesanKecil', title: 'Qty Pesan Kcl' },
        { data: 'totalQtyPesan', title: 'Total Pesanan' },
        { data: 'totalQtyPesan', title: 'Total Qty Diterima',
          render: (data) => {
            return '';
          }
        },
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
    this.disabledPrintButton = false;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedOrder.statusCetak == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan,
    }
    this.dataService
      .postData(this.g.urlServer + '/api/receiving-po-supplier/detail/list', params)
      .subscribe((resp: any) => {
        this.listOrderData = resp.map((item:any) => this.g.convertKeysToCamelCase(item));
    });
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
    this.router.navigate(['/order/receiving-po-supplier']);
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
              `${this.config.BASE_URL}/api/receiving-po-supplier/report`,
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
      tglBrgDikirim: this.selectedOrder.tglKirimBrg,
      tglPesan: this.selectedOrder.tglPesanan,
      user: this.g.getUserCode(),
      statusPesanan: this.selectedOrder.statusPesanan,
      statusCetak: this.selectedOrder.statusCetak
    };

    // Step 1: Call Jasper report API
    this.appService.reporReceivingPoSupplierJasper(params, "").subscribe((res) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      this.downloadURL = window.URL.createObjectURL(blob);
      this.downloadPDF();

      // Step 2: Once report is ready, update status
      const param = {
        statusKirim: "S",
        userKirim: params.staffName,
        dateKirim: moment().format("DD-MM-YYYY"),
        timeKirim: moment().format("HHmmss"),
        nomorPesanan: params.nomorPesanan
      };

      this.dataService
        .postData(this.g.urlServer + '/api/send-order-to-supplier/update-status-cetak', param)
        .subscribe({
          next: (res: any) => {
            if (!res.success) {
              this.appService.handleErrorResponse(res);
            } else {
              console.log("finish statuscetak");
              this.toastr.success(this.translation.instant('Berhasil!'));
              this.refreshDetail();

              // ✅ Step 3: Reload the page AFTER all is successful
              setTimeout(() => {
                window.location.reload();
              }, 1000); // give a slight delay if needed
            }
          },
          error: (err: any) => {
            console.error('Error updating user:', err);
            this.toastr.error('An error occurred while updating the user.');
          },
        });
    });
  }


  refreshDetail(){
    this.dataService
    .postData(this.g.urlServer + '/api/receiving-po-supplier/detail-header',{"nomorPesanan": this.selectedOrder.nomorPesanan})
    .subscribe({
      next: (res: any) => {
        console.log("res0",res)
        if (!(res && res.length > 0)){
          this.appService.handleErrorResponse(res);
        } else {
            console.log("res",res[0])
            this.g.saveLocalstorage(
              LS_INV_SELECTED_RECEIVING_ORDER,
              JSON.stringify(this.g.convertKeysToCamelCase(res[0]))
            );
            setTimeout(() => {
              window.location.reload();
            }, DEFAULT_DELAY_TIME);

          }
      },
      error: (err: any) => {
        console.error('Error updating user:', err);
        console.log('An error occurred while updating the user.');
      },
    });
  }


  downloadPDF() {
    var link = document.createElement('a');
    link.href = this.downloadURL;
    link.download = `Report Receiving Order tanggal ${this.selectedOrder.tglPesan}.pdf`;
    link.click();
    this.toastr.success('File sudah terunduh.', 'Selamat');
  }
  onShowModalBatal(){
    this.isShowModalBatal = true;
  }
  async updateStatus(){
    try {
      const params = {
        status: '4',
        user: this.g.getUserCode(),
        keterangan2: this.alasanDiBatalkan,
        nomorPesanan: this.selectedOrder.nomorPesanan,
      };
      const url = `${this.config.BASE_URL}/api/receiving-po-supplier/update-pesasan-batal`;
      const response = await lastValueFrom(
        this.dataService.postData(url, params)
      );
      if (response.success) {
        this.toastr.success('Berhasil membatalkan penerimaan');
        setTimeout(() => {
          this.onBackPressed()
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

  
  get filteredList() {
    if (!this.searchListViewOrder) {
      return this.listOrderData;
    }
    const searchText = this.searchListViewOrder.toLowerCase();
    return this.listOrderData.filter(item =>
      JSON.stringify(item).toLowerCase().includes(searchText)
    );
  }

  getPaginationIndex(i: number): number {
    return (this.listCurrentPage - 1) * this.itemsPerPage + i;
  }
  getJumlahItem(): number {
    if (this.filteredList.length === 0) {
      return 0;
    }
    if (this.filteredList[this.filteredList.length - 1].namaBarang.trim() === "") {
      return this.filteredList.length - 1;
    }
    return this.filteredList.length;
  }
  onFilterTextChange(newValue: string) {
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listOrderData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
  }
}
