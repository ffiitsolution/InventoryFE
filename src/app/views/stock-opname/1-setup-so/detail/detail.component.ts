import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from '../../../../service/translation.service';

import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { Page } from '../../../../model/page';
import { DataService } from '../../../../service/data.service';
import { GlobalService } from '../../../../service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from '../../../../config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  ACTION_VIEW,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_SO,
  SEND_PRINT_STATUS_SUDAH,
} from '../../../../../constants';
import { AppConfig } from '../../../../config/app.config';
import { AppService } from '../../../../service/app.service';
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-detail-so',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class SetupSoDetailComponent
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
  selectedSo: any = JSON.parse(
    localStorage.getItem(LS_INV_SELECTED_SO) ?? '{}'
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
  listDataExpired: any[] = [];
  protected config = AppConfig.settings.apiServer;
  isShowModalExpired: boolean = false;
  selectedRowData: any;
  userData: any;
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
    this.userData = this.appService.getUserData();
    this.selectedSo = JSON.parse(this.selectedSo);
    (this.selectedSo.dateCreate = this.g.transformDate(
      this.selectedSo.dateCreate
    )),
      (this.selectedSo.dateCreate = this.g.transformDate(
        this.selectedSo.dateProses
      )),
      (this.selectedSo.tanggalSo = this.g.transformDate(
        this.selectedSo.tanggalSo
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
        drawCallback: () => {},
        ajax: (dataTablesParameters: any, callback) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
          const params = {
            ...dataTablesParameters,
            nomorSo: this.selectedSo.nomorSo,
            kodeGudang: this.g.getUserLocationCode(),
          };
          setTimeout(() => {
            this.dataService
              .postData(
                this.config.BASE_URL + '/api/stock-opname-detail/dt',
                params
              )
              .subscribe((resp: any) => {
                const updatedselectedSo = {
                  ...this.selectedSo,
                  noSjPengirim: resp.data[0]?.noSjPengirim || ' ',
                };
                this.selectedSo = updatedselectedSo;
                this.g.saveLocalstorage(
                  'selectedSo',
                  JSON.stringify(updatedselectedSo)
                );
                const mappedData = resp.data.map((item: any, index: number) => {
                  const { rn, ...rest } = item;
                  const finalData = {
                    ...rest,
                    dtIndex: this.page.start + index + 1,
                    dateCreate: this.g.transformDate(rest.dateCreate),
                    tanggalSo: this.g.transformDate(rest.tanggalSo),
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
              noTransaksi: this.selectedSo.nomorSo,
              userEntry: this.selectedSo.userCreate,
              jamEntry: this.g.transformTime(this.selectedSo.timeCreate),
              tglEntry: this.g.transformDate(this.selectedSo.dateCreate),
              outletBrand: 'KFC',
              kodeGudang: this.g.getUserLocationCode(),
              isDownloadCsv: false,
              reportName: 'cetak_production',
              confirmSelection: 'Ya',
            };
            this.paramUpdatePrintStatus = {
              nomorSo: this.selectedSo.nomorSo,
            };
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'kodeBarang', title: 'Kode Barang' },
          { data: 'namaBarang', title: 'Nama Barang' },
          {
            data: 'konversi',
            title: 'Konversi',
            render: (data, type, row) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}/${
                row.satuanBesar
              }`,
          },
          {
            data: 'qtyBesarSo',
            title: 'Qty Besar',
            render: (data, type, row) =>
              `${Number(data).toFixed(2)} ${row.satuanBesar}`,
          },
          {
            data: 'qtyKecilSo',
            title: 'Qty Kecil',
            render: (data, type, row) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}`,
          },
          {
            data: 'totalQtySo',
            title: 'Total Qty',
            render: (data, type, row) =>
              `${Number(data).toFixed(2)} ${row.satuanKecil}`,
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
        order: [[0, 'asc']],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.action-view', row).on('click', () =>
            this.actionBtnClick(ACTION_VIEW, data)
          );

          return row;
        },
        columnDefs: [
          {
            targets: [2, 3, 4, 5],
            className: 'text-end',
          },
        ],
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
      this.translation.instant('Detail Production') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedSo.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedSo.cetakSuratJalan == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRowData = data;
    const payload = {
      nomorSo: this.selectedSo.nomorSo,
      nomorTransaksi: this.selectedSo.nomorSo,
      kodeBarang: data.kodeBarang,
      tipeTransaksi: 7,
      kodeGudang: this.userData.defaultLocation.kodeLocation,
    };

    this.appService
      .insert('/api/stock-opname/expired', payload)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.listDataExpired = res.data;
            this.isShowModalExpired = true;
          } else {
            this.appService.handleErrorResponse(res);
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
    this.dtOptions?.columns?.forEach((column: any, index) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('selectedSo');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate(['/stock-opname/setup-so']);
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
            nomorPesanan: this.selectedSo.nomorPesanan,
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
    if (this.selectedSo.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }

  getTotalQty(): number {
    return (
      this.listDataExpired?.reduce((sum, item) => {
        return sum + Math.abs(Number(item.totalQty));
      }, 0) ?? 0
    );
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric' //kode cabang
        ? /^[a-zA-Z0-9]$/
        : type == 'namaCabang' //nama cabang
        ? /^[a-zA-Z0-9-().& \-]*$/
        : type == 'kodeSingkat' //kode singkat
        ? /^[A-Z0-9&-]$/
        : type == 'numeric' //kode pos
        ? /^[0-9]$/
        : type == 'phone' //phone 1 & 2, Fax 1 & 2
        ? /^[0-9-()\s]$/
        : type == 'email' //email
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'contactPerson' //contactPerson
        ? /^[a-zA-Z.\s]$/
        : type == 'alphabet' //tipe cabang
        ? /^[a-zA-Z]+$/
        : type == 'excludedSensitive' //keterangan & alamat 1-2
        ? /^[a-zA-Z0-9\s.,#\-()\/]+$/
        : /^[a-zA-Z.() ,\-]*$/; //alphabet

    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }
}
