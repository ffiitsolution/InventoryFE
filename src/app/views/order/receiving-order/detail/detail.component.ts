import {
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
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-detail-receiving-order',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class ReceivingOrderDetailComponent
  implements OnInit, OnDestroy {
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
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

    const params = {
      nomorPesanan: this.selectedOrder.nomorPesanan,
    }
    this.dataService
      .postData(this.g.urlServer + '/api/receiving-order/detail/list', params)
      .subscribe((resp: any) => {
        this.listOrderData = resp.map((item:any) => this.g.convertKeysToCamelCase(item));
      });

  }
  actionBtnClick(action: string, data: any = null) { }

  dtPageChange(event: any) { }

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
            user:  this.dataUser.kodeUser,
            nomorPesanan: this.selectedOrder.nomorPesanan,
            statusPesanan: this.selectedOrder.statusPesanan,
            statusCetak: this.selectedOrder.statusCetak 
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
      tglPesan: this.selectedOrder.tglPesan,
      user: this.dataUser.kodeUser,
      statusPesanan: this.selectedOrder.statusPesanan,
      statusCetak: this.selectedOrder.statusCetak
    }

    this.appService.reporReceivingOrderJasper(params).subscribe((res) => {
      var blob = new Blob([res], { type: 'application/pdf' });
      this.downloadURL = window.URL.createObjectURL(blob);
      this.downloadPDF();
      this.onBackPressed();
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

  onFilterTextChange(newValue: string) {
    this.listCurrentPage = 1;
    if (newValue.length >= 3) {
      this.totalLength = 1;
    } else {
      this.totalLength = this.listOrderData.length;
    }
    this.listCurrentPage = this.listCurrentPage;
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
  
  
}
