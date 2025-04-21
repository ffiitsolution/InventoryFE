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
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ACTION_VIEW, CANCEL_STATUS, DEFAULT_DELAY_TABLE, SEND_PRINT_STATUS_SUDAH } from '../../../../../constants';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-detail-terima-barang-retur-dari-site',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailTerimaBarangReturDariSiteComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) datatableElement!: DataTableDirective;
  @ViewChild('tableIdExpired', { static: false }) tableExpired: any;
  @ViewChild(DataTableDirective, { static: false })
  dtElementExpired: DataTableDirective;
  @ViewChild('staticBackdropModal') staticBackdropModal: any;
  @ViewChild(DataTableDirective, {static: false}) dtElement:DataTableDirective;

  config = AppConfig.settings.apiServer;

  page = new Page();
  orders: any[] = [];
  selectedProduction: any = JSON.parse(localStorage['selectedProduction']);
  selectedRowData: any;
  selectedRow: any;
  selectedKodeBarang: string = '';

  dtTrigger: Subject<any> = new Subject();
  dtTriggerExpired: Subject<any> = new Subject();
  dtOptions: DataTables.Settings = {};
  dtOptionsExpired: DataTables.Settings | undefined;
  dtColumns: any = [];

  isShowModal = false;
  adding = false;
  loadingIndicator = false;
  showFilterSection = false;
  disabledCancelButton = false;
  disabledPrintButton = false;
  updatingStatus = false;
  RejectingOrder = false;
  alreadyPrint = false;

  buttonCaptionView: String = 'Lihat';
  totalLength = 0;
  totalQtyExpired = 0;

  paramGenerateReport: any = {};
  paramUpdatePrintStatus: any = {};

  isInitializedExpiredTable = false;
  selectedRowCetak: any = false;

  formExpiredData = {
    kodeNamaBarang: '',
    konversi: '',
    qtyBesar: '',
    qtyKecil: '',
    totalQty: ''
  };

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.g.navbarVisibility = true;
    this.selectedProduction = JSON.parse(this.selectedProduction);
    this.selectedProduction.tglTransaksi = this.g.transformDate(this.selectedProduction.tglTransaksi);
    this.dtColumns = this.dtOptions.columns;
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
    this.setupMainTable();
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    localStorage.removeItem('selectedProduction');
    this.g.navbarVisibility = true;
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
    this.dtTriggerExpired.unsubscribe();
  }

  setupMainTable(): void {
    this.dtOptions = {
      language: this.translation.getCurrentLanguage() == 'id' ? this.translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      searchDelay: 1000,
      order: [[1, 'asc']],
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const request = {
          ...dataTablesParameters,
          nomorTransaksi: this.selectedProduction.nomorTransaksi,
        };

        setTimeout(() => {
          this.dataService
            .postData(`${this.config.BASE_URL}/api/return-order-from-site/detail`, request)
            .subscribe((resp: any) => {
              const updatedProduction = {
                ...this.selectedProduction,
              };
              this.selectedProduction = updatedProduction;
              this.g.saveLocalstorage('selectedProduction', JSON.stringify(updatedProduction));

              const mappedData = resp.data.map((item: any, i: number) => ({
                ...item,
                dtIndex: this.page.start + i + 1,
                tglTransaksi: this.g.transformDate(item.tglTransaksi),
              }));

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
            jamEntry: this.g.transformTime(this.selectedProduction.timeCreate),
            tglEntry: this.g.transformDate(this.selectedProduction.dateCreate),
            outletBrand: 'KFC',
            kodeGudang: this.g.getUserLocationCode(),
            isDownloadCsv: false,
            reportName: 'cetak retur dari site',
          };

          this.paramUpdatePrintStatus = {
            noTransaksi: this.selectedProduction.nomorTransaksi,
          };
        }, DEFAULT_DELAY_TABLE);
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode Barang' },
        { data: 'namaBarang', title: 'Nama Barang' },
        {
          data: 'konversi', title: 'Konversi',
          render: (data, type, row) => `${data} ${row.satuanKecil}`
        },
        {
          data: 'qtyBesar', title: 'Qty Besar',
          render: (data, type, row) => `${data} ${row.satuanBesar}`
        },
        {
          data: 'qtyKecil', title: 'Qty Kecil',
          render: (data, type, row) => `${data} ${row.satuanKecil}`
        },
        {
          data: 'totalQty', title: 'Total Qty',
          render: (data, type, row) => `${data} ${row.satuanKecil}`
        },
        {
          title: 'Cek Quantity Expired',
          orderable: false,
          render: (data, type, row, meta) => {
            return `
              <div class="d-flex justify-content-start">
                <button class="btn btn-sm btn-outline-success action-print">
                  <i class="fa fa-check pe-1"></i> Cek
                </button>
              </div>`;
          },
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        $('.action-print', row).on('click', () => {
          const rowData = data as any; // 👈 cast data biar bisa akses properti
      
          this.selectedRowCetak = rowData;
          const kodeBarang = rowData?.kodeBarang;
      
          if (kodeBarang) {
            this.formExpiredData = {
              kodeNamaBarang: `${rowData.kodeBarang} - ${rowData.namaBarang}`,
              konversi: `${rowData.konversi} ${rowData.satuanKecil}`,
              qtyBesar: `${Math.abs(rowData.qtyBesar)} ${rowData.satuanBesar}`,
              qtyKecil: `${Math.abs(rowData.qtyKecil)} ${rowData.satuanKecil}`,
              totalQty: `${Math.abs(rowData.totalQty)} ${rowData.satuanKecil}`,
            };
      
            this.renderDataTables(kodeBarang);
            this.isShowModal = true;
          }
        });
        return row;
      }                  
    };
  }

  renderDataTables(kodeBarang?: string): void {
    console.log('🔄 Memulai renderDataTables dengan kodeBarang:', kodeBarang);
  
    if (!kodeBarang) {
      console.warn('❌ kodeBarang tidak valid saat renderDataTables');
      return;
    }
  
    // Kosongkan dulu dtOptionsExpired agar *ngIf bisa unmount <table>
    this.dtOptionsExpired = undefined;
  
    // Delay agar Angular sempat hapus elemen <table> dari DOM
    setTimeout(() => {
      // Atur ulang konfigurasi DataTable expired
      this.dtOptionsExpired = {
        processing: true,
        serverSide: true,
        autoWidth: true,
        info: true,
        pageLength: 5,
        lengthMenu: [[5, 10, 25, 50], ['5', '10', '25', '50']],
        searchDelay: 1500,
        order: [[2, 'asc'], [1, 'asc']],
        drawCallback: () => {
          this.selectedRowData = undefined;
        },
        ajax: (dataTablesParameters: any, callback) => {
          this.page.start = dataTablesParameters.start;
          this.page.length = dataTablesParameters.length;
  
          const request = {
            ...dataTablesParameters,
            nomorTransaksi: this.selectedProduction.nomorTransaksi,
            kodeBarang: kodeBarang,
          };
  
          console.log('📦 Request expired table:', request);
  
          this.dataService
            .postData(`${this.config.BASE_URL}/api/expired/dt`, request)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, i: number) => ({
                ...item,
                dtIndex: this.page.start + i + 1,
              }));
  
              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
  
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: mappedData,
              });
            });
        },
        columns: [
          { data: 'dtIndex', title: '#', orderable: false, searchable: false },
          { data: 'tglExpired', title: 'Tgl. Expired' },
          { data: 'ketTglExpired', title: 'Keterangan Tanggal' },
          {
            data: 'qtyBesar',
            title: 'Qty Besar',
            render: (data, _, row) => `${Math.abs(data)} ${row.satuanBesar}`,
          },
          {
            data: 'qtyKecil',
            title: 'Qty Kecil',
            render: (data, _, row) => `${Math.abs(data)} ${row.satuanKecil}`,
          },
          {
            data: 'totalQty',
            title: 'Total Qty',
            render: (data, _, row) => `${Math.abs(data)} ${row.satuanKecil}`,
          },
        ],
      };
  
      // Reset & Trigger datatable expired dengan delay DOM
      this.dtTriggerExpired.unsubscribe();
      this.dtTriggerExpired = new Subject();
  
      // Delay agar *ngIf benar-benar selesai render ulang
      setTimeout(() => {
        this.dtTriggerExpired.next(null);
        this.isShowModal = true;
        console.log('✅ Expired table ditampilkan, kodeBarang:', kodeBarang);
      }, 200); // Delay ini krusial
    });
  }  
  
  closeModal(event: Event): void {
    // Hapus fokus dari tombol (prevent aria-hidden warning)
    (event.target as HTMLElement).blur();
    this.isShowModal = false;
  }

  
  reloadTable(): void {
    setTimeout(() => {
      this.datatableElement?.dtInstance.then((dt) => dt.ajax.reload());
    }, DEFAULT_DELAY_TABLE);
  }

  onBackPressed(): void {
    this.router.navigate(['/transaction/terima-barang-retur-dari-site/list-dt']);
  }

  getPrintStatus(): string {
    return this.selectedProduction.statusCetak != SEND_PRINT_STATUS_SUDAH ? 'Belum' : 'Sudah';
  }

  onShowModal(row: any): void {
    this.selectedRow = row;
    this.isShowModal = true;
  }

  actionBtnClick(action: string, data: any = null): void {}

  dtPageChange(event: any): void {}
}
