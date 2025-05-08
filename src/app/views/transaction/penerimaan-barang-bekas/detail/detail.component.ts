import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';

import { DataTableDirective } from 'angular-datatables';
import { lastValueFrom, Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
// import { AppConfig } from 'src/app/config/app.config.ts';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ACTION_VIEW, CANCEL_STATUS, DEFAULT_DELAY_TABLE, SEND_PRINT_STATUS_SUDAH } from 'src/constants';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-detail-penerimaan-brg-bks',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailPenerimaanBrgBksComponent
  implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();

  orders: any[] = [];
  dtColumns: any = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedPenerimaanBrgBks: any = JSON.parse(
    localStorage['selectedPenerimaanBrgBks']
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
  countDetail : number= 0;
  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.g.navbarVisibility = true;
    this.selectedPenerimaanBrgBks = JSON.parse(this.selectedPenerimaanBrgBks);
    this.selectedPenerimaanBrgBks.tglPesanan = this.g.transformDate(this.selectedPenerimaanBrgBks.tglPesanan),
    this.selectedPenerimaanBrgBks.tglTransaksi = this.g.transformDate(this.selectedPenerimaanBrgBks.tglTransaksi),
    this.selectedPenerimaanBrgBks.konversi = parseFloat( this.selectedPenerimaanBrgBks.konversi).toFixed(2),
    this.selectedPenerimaanBrgBks.jumlahResep = parseFloat( this.selectedPenerimaanBrgBks.jumlahResep).toFixed(2),
    this.selectedPenerimaanBrgBks.totalProduksi = parseFloat( this.selectedPenerimaanBrgBks.totalProduksi).toFixed(2),
      this.dtOptions = {
        language:
          translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
        processing: true,
        serverSide: true,
        autoWidth: true,
        info: true,
        drawCallback: () => { },
        ajax: (dataTablesParameters: any, callback:any) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
          const params = {
            ...dataTablesParameters,
            nomorTransaksi: this.selectedPenerimaanBrgBks.nomorTransaksi,
            kodeGudang: this.g.getUserLocationCode(),
          };
          setTimeout(() => {
            this.dataService
              .postData(
                this.config.BASE_URL + '/api/penerimaan-product-wasted/detail',
                params
              )
              .subscribe((resp: any) => {
                const updatedselectedPenerimaanBrgBks = {
                  ...this.selectedPenerimaanBrgBks
                };
                this.selectedPenerimaanBrgBks = updatedselectedPenerimaanBrgBks;
                this.g.saveLocalstorage(
                  'selectedPenerimaanBrgBks',
                  JSON.stringify(updatedselectedPenerimaanBrgBks)
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
                this.countDetail = mappedData.length;
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: mappedData,
                });

              });
            this.paramGenerateReport = {
              nomorTransaksi: this.selectedPenerimaanBrgBks.nomorTransaksi,
              userEntry: this.selectedPenerimaanBrgBks.userCreate,
              jamEntry: this.g.transformTime(this.selectedPenerimaanBrgBks.timeCreate),
              tglEntry: this.g.transformDate(this.selectedPenerimaanBrgBks.dateCreate),
              outletBrand: 'KFC',
              kodeGudang: this.g.getUserLocationCode(),
              isDownloadCsv: false,
              reportName: 'cetak_penerimaan_barang_bekas',
            };
            this.paramUpdatePrintStatus = {
              nomorTransaksi: this.selectedPenerimaanBrgBks.nomorTransaksi
            }
          }, DEFAULT_DELAY_TABLE);
        },
        columns: [
          { data: 'kodeBarang', title: 'Kode Barang' },
          { data: 'namaBarang', title: 'Nama Barang' },
          {
            data: 'konversi', title: 'Konversi',
            render: (data:any, type:any, row:any) => `${Number(data).toFixed(2)} ${row.satuanKecil}`
          },
          {
            data: 'qtyBesar', title: 'Qty Besar',
            render: (data:any, type:any, row:any) => `${Number(data).toFixed(2)} ${row.satuanBesar}`
          },
          {
            data: 'qtyKecil', title: 'Qty Kecil',
            render: (data:any, type:any, row:any) => `${Number(data).toFixed(2)} ${row.satuanKecil}`
          },
          {
            data: 'totalQty', title: 'Total Qty',
            render: (data:any, type:any, row:any) => `${Number(data).toFixed(2)} ${row.satuanKecil}`
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
      this.translation.instant('Detail Penerimaan Barang Bekas') + ' - ' + this.g.tabTitle
    );
    const isCanceled = this.selectedPenerimaanBrgBks.statusPesanan == CANCEL_STATUS;
    this.disabledPrintButton = isCanceled;
    this.disabledCancelButton = isCanceled;
    this.alreadyPrint =
      this.selectedPenerimaanBrgBks.cetakSuratJalan == SEND_PRINT_STATUS_SUDAH;
    this.buttonCaptionView = this.translation.instant('Lihat');
  }
  actionBtnClick(action: string, data: any = null) { }

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
    localStorage.removeItem('selectedWastage');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  onBackPressed() {
    this.router.navigate(['/transaction/penerimaan-barang-bekas/list']);
  }



  getPrintStatus() {
    if (this.selectedPenerimaanBrgBks.statusCetak != SEND_PRINT_STATUS_SUDAH) {
      return 'Belum';
    }
    return 'Sudah';
  }
}
