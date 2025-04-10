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
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom,Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { DEFAULT_DELAY_TIME } from 'src/constants';

@Component({
  selector: 'app-send-order-to-supplier',
  templateUrl: './send-order-to-supplier.component.html',
  styleUrls: ['./send-order-to-supplier.component.scss'],
})
export class SendOrderToSupplierViaRSCComponent implements OnInit {

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  page = new Page();
  columns: any;
  data: any;
  orders: any[] = [];
  dtColumns: any = [];
  adding: boolean = false;
  loadingIndicator: boolean = false;
  showFilterSection: boolean = false;
  searchTriggered: boolean = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  buttonCaptionView: String = 'Lihat';
  buttonCaptionPrint: String = 'Cetak';
  currentDate: Date = new Date();
  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  dataUser: any;
  generateReportParam : string;

  isShowModalKirim: boolean = false;
  selectedRowKirim: any;

  selectedRowCetak: any = false;
  isShowModalCetak: boolean;

  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          startDate:  moment(this.dateRangeFilter[0], "ddd MMM DD YYYY HH:mm:ss [GMT]Z").format("DD-MM-YYYY"),
          endDate: moment(this.dateRangeFilter[1], "ddd MMM DD YYYY HH:mm:ss [GMT]Z").format("DD-MM-YYYY"),
          tipePesanan:"R"
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/send-order-to-supplier/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                // hapus rn
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  kodePemesan: `${rest.kodePemesan}`,
                  tglPesan: this.g.transformDate(rest.tglPesan),
                  tglBrgDikirim: this.g.transformDate(rest.tglBrgDikirim),
                  tglKadaluarsa: this.g.transformDate(rest.tglKadaluarsa),
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
          data: 'tglPesanan', 
          title: 'Tanggal Pesanan',
          render: function (data, type, row) {
            if (!data) return ""; // Handle null/undefined values
            return moment(data, "YYYY-MM-DD").format("D MMM YYYY"); // Convert to "6 Feb 2025"
          }
        },
        { 
          data: 'tglKirimBrg', 
          title: 'Tanggal Kirim' ,
          render: function (data, type, row) {
            if (!data) return ""; // Handle null/undefined values
            return moment(data, "YYYY-MM-DD").format("D MMM YYYY"); // Convert to "6 Feb 2025"
          }
        },
        { 
          data: 'tglBatalExp', 
          title: 'Tanggal Batal',
          render: function (data, type, row) {
            if (!data) return ""; // Handle null/undefined values
            return moment(data, "YYYY-MM-DD").format("D MMM YYYY"); // Convert to "6 Feb 2025"
          } 
        },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        {
          data: 'supplier',
          title: 'Kode Tujuan',
          render: function (data, type, row) {
            return row.supplier && row.namaSupplier ? `${row.supplier} - ${row.namaSupplier}` : row.supplier || row.namaSupplier || "";
          }
        },
        {
          data: 'statusPesanan',
          title: 'Status Pesanan',
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "1":
                statusLabel = "Baru";
                break;
              case "2":
                statusLabel = "Sisa";
                break;
              case "3":
                statusLabel = "Dikirim";
                break;
              case "4":
                statusLabel = "Batal";
                break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
            }
            return statusLabel;
          }
        },
        
        { 
          data: 'statusCetak', 
          title: 'Status Cetak' ,
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "S":
                statusLabel = "Sudah";
                break;
              case "B":
                statusLabel = "Belum";
                break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
                break;
            }
            return statusLabel;
          }
        },
        { 
          data: 'statusKirim', 
          title: 'Status Kirim Data' ,
          render: function (data) {
            let statusLabel = "";
            
            // Map statusPesanan values to labels
            switch (data) {
              case "S":
                statusLabel = "Sudah";
                break;
                case "B":
                  statusLabel = "Belum";
                  break;
              default:
                statusLabel = "Tidak Diketahui"; // Default label for undefined values
                break;
            }
            return statusLabel;
          }
        },
        { 
          data: 'keterangan1', 
          title: 'Catatan1',
          render: function (data, type, row) {
            if (!data) return ""; // Handle null/undefined values
            return data.substring(0, 20); // Cut the first 20 characters
          }
        },

        
        
        {
          title: 'Opsi',
          render: (data, type, row) => {
            const isDisabled = row?.statusKirim=="S"; // Set to true to disable the button
            const isDisabledCetak = row?.statusCetak=="S"; // Set to true to disable the button
            const htmlString = `
              <div class="btn-group" role="group" aria-label="Action">
                <button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>
                <button class="btn btn-sm action-send btn-outline-info btn-60" ${isDisabled ? 'disabled' : ''}>
                  Kirim
                </button>   
                <button class="btn btn-sm action-print btn-outline-info btn-60"}>${this.buttonCaptionPrint}</button>           
              </div>
            `;
            return htmlString;
          },
        },
      ],
      searchDelay: 1000,
      order: [
        [4, 'desc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-send', row).on('click', () =>{
          // this.updateStatus(data)
          this.selectedRowKirim = data;
          this.isShowModalKirim=true;
        }
        );
        $('.action-print', row).on('click', () =>{
          // this.onClickPrint(data)
          this.selectedRowCetak = data;
          this.isShowModalCetak=true;
        }
        );
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
    this.dpConfig.containerClass = 'theme-red';
    this.dpConfig.customTodayClass= 'today-highlight';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';

  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Terima Pesanan') + ' - ' + this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    localStorage.removeItem(LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER);
    this.dataUser = this.g.getLocalstorage('inv_currentUser');

  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_SEND_TO_WAREHOUSE_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate(['/order/send-order-to-supplier-via-rsc/detail']);
    }
  }

  updateStatus() {
    const data = this.selectedRowKirim
    const params = {
      statusKirim : "S",
      userKirim : this.dataUser.kodeUser,
      dateKirim :  moment().format("DD-MM-YYYY"),
      timeKirim :  moment().format("HHmmss"),
      nomorPesanan : data.nomorPesanan
  }
    this.dataService
    .postData(this.g.urlServer + '/api/send-order-to-supplier/update-status-kirim',params)
    .subscribe({
      next: (res: any) => {
        if (!res.success) {
          alert(res.message);
        } else {
          this.toastr.success(this.translation.instant('Berhasil!'));
          setTimeout(() => {
            window.location.reload();
          }, DEFAULT_DELAY_TIME);
        }
      },
      error: (err: any) => {
        console.error('Error updating user:', err);
        alert('An error occurred while updating the user.');
      },    
    });
    this.isShowModalKirim = false;
  }
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
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  toggleFilter() {
    this.showFilterSection = !this.showFilterSection;
  }

  onAddPressed(): void {
    // Logic for adding a new order
    const route = this.router.createUrlTree([
      '/order/send-order-to-supplier-via-rsc/add-data',
    ]);
    this.router.navigateByUrl(route);
  }


    async onClickPrint() {
      try {
        const param = {
          nomorPesanan : this.selectedRowCetak.nomorPesanan,
          userCetak:  this.dataUser.kodeUser,
          kodeCabang:  this.dataUser.defaultLocation.kodeLocation,
          statusCetak: this.selectedRowCetak.statusCetak
        }

        const base64Response = await lastValueFrom(
          this.dataService.postData(this.config.BASE_URL + "/api/send-order-to-supplier/report", param, true)
        );
        const blob = new Blob([base64Response as BlobPart], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        
        this.dataService
        .postData(this.g.urlServer + '/api/send-order-to-supplier/update-status-cetak',param)
        .subscribe({
          next: (res: any) => {
            if (!res.success) {
              alert(res.message);
            } else {
              this.toastr.success(this.translation.instant('Berhasil!'));
              setTimeout(() => {
                window.location.reload();
              }, DEFAULT_DELAY_TIME);
            }
          },
          error: (err: any) => {
            console.error('Error updating user:', err);
            alert('An error occurred while updating the user.');
          },    
        });
      } catch (error: any) {
        this.toastr.error(error.message ?? 'Unknown error while generating PDF');
      }

    }
}
