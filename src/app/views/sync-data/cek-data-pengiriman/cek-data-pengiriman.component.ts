import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AppService } from '../../../service/app.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DataService } from '../../../service/data.service';
import { AppConfig } from '../../../config/app.config';
import { Subject } from 'rxjs';
import { Page } from '../../../model/page';
import moment from 'moment';
import { ACTION_CETAK, ACTION_VIEW, DEFAULT_DELAY_TABLE } from '../../../../constants';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-cek-data-pengiriman',
  templateUrl: './cek-data-pengiriman.component.html',
  styleUrl: './cek-data-pengiriman.component.scss',
})
export class CekDataPengirimanComponent implements OnInit, OnDestroy, AfterViewInit {
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;
  minDate: Date;
  maxDate: Date;
  formData: any = {}
  alreadyPrint: boolean;
  disabledPrintButton: any;
  paramGenerateReport: any = {}
  isShowModalReport: boolean = false;
  paramUpdateReport: any = {}
  protected config = AppConfig.settings.apiServer;
  dtOptions: any = {};
  dtOptionsDetail: any = {};
  selectedData: any = {};
  isShowDetail: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  listProsesDoBalik: any = [];
  startDate: any;
  endDate: any;

  constructor(
    private service: AppService,
    private g: GlobalService,
    private dataService: DataService,
    translation: TranslationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.dtOptions = {
      language: translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          startDate: this.startDate,
          endDate: this.endDate,
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/recv-store/list-receiving-data', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;

                // Hitung skor checklist
                const rowRcv = rest.rowRcv || 0;
                const rowDlv = rest.rowDlv || 0;
                const qtyBesarRcv = rest.qtyBesarRcv || 0;
                const qtyKecilRcv = rest.qtyKecilRcv || 0;
                const qtyBesarDlv = rest.qtyBesarDlv || 0;
                const qtyKecilDlv = rest.qtyKecilDlv || 0;

                const totalQtyRcv = qtyBesarRcv + qtyKecilRcv;
                const totalQtyDlv = qtyBesarDlv + qtyKecilDlv;

                let rcvScore = 0;
                if (rowRcv > 0) rcvScore++;
                if (rowRcv === rowDlv) rcvScore++;
                if (totalQtyRcv === totalQtyDlv) rcvScore++;

                if (rcvScore === 3) {
                  if (!this.listProsesDoBalik) {
                    this.listProsesDoBalik = [];
                  }

                  const user = JSON.parse(localStorage.getItem('inv_currentUser') || '{}');
                  const userPosted = user?.namaUser || 'anonymous';

                  const processed = {
                    ...rest,
                    userPosted: userPosted,
                    datePosted: this.g.getLocalDateTime(new Date())
                  };

                  this.listProsesDoBalik.push(processed);
                }

                return {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  dateUpd: this.g.transformDate(rest.dateUpd),
                  rcvScore
                };
              });

              // Urutkan berdasarkan rcvScore tertinggi
              const sortedData = mappedData.sort((a: any, b: any) => b.rcvScore - a.rcvScore);

              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: sortedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      order: [[3, 'desc']], // masih urut default berdasarkan kolom ke-4
      columns: [
        { data: 'noSuratJalan', title: 'DO - PENGIRIM', className: 'text-nowrap text-start' },
        {
          title: 'TUJUAN',
          className: 'text-nowrap text-start',
          render: (data: any, type: any, row: any) => `${row.kodeTujuan} - ${row.namaTujuan}`
        },
        { data: 'noRecv', title: 'NOTA - RECEIVE' },
        { data: 'tglTransaksi', title: 'TGL. KIRIM', searchable: true, className: 'text-nowrap text-start' },
        { data: 'dateUpd', title: 'TGL. TERIMA', searchable: true, className: 'text-nowrap text-start' },
        { data: 'rowDlv', title: 'ROW_DLV', className: 'text-center' },
        { data: 'rowRcv', title: 'ROW_RCV', className: 'text-center' },
        {
          title: 'QTY_DLV', className: 'text-center',
          render: (data: any, type: any, row: any) => (row.qtyBesarDlv || 0) + (row.qtyKecilDlv || 0)
        },
        {
          title: 'QTY_RCV', className: 'text-center',
          render: (data: any, type: any, row: any) => (row.qtyBesarRcv || 0) + (row.qtyKecilRcv || 0)
        },
        {
          title: 'Status RCV',
          className: 'text-center',
          render: (data: any, type: any, row: any) =>
            row.rowRcv > 0
              ? '<i class="fa fa-check text-success"></i>'
              : '<i class="fa fa-times text-danger"></i>'
        },
        {
          title: 'Total ROW',
          className: 'text-center',
          render: (data: any, type: any, row: any) =>
            row.rowRcv === row.rowDlv
              ? '<i class="fa fa-check text-success"></i>'
              : '<i class="fa fa-times text-danger"></i>'
        },
        {
          title: 'Total QTY',
          className: 'text-center',
          render: (data: any, type: any, row: any) => {
            const totalQtyRcv = (row.qtyBesarRcv || 0) + (row.qtyKecilRcv || 0);
            const totalQtyDlv = (row.qtyBesarDlv || 0) + (row.qtyKecilDlv || 0);
            return totalQtyRcv === totalQtyDlv
              ? '<i class="fa fa-check text-success"></i>'
              : '<i class="fa fa-times text-danger"></i>';
          }
        },
        {
          title: 'Cek',
          className: 'text-center',
          render: (data: any, type: any, row: any) => {
            const isRcv = row.rowRcv > 0;
            return `
          <div class="d-flex px-2 gap-2">
            <button ${isRcv ? '' : 'disabled'} style="width: 100px" class="btn btn-sm action-view btn-outline-success btn-60">
              <i class="fa fa-check pe-1"></i>Cek
            </button>
          </div>`;
          },
        },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-cetak', row).on('click', () =>
          this.actionBtnClick(ACTION_CETAK, data)
        );
        return row;
      },
    };

    this.dtColumns = this.dtOptions.columns;
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.isShowDetail = true
      this.selectedData = data
      this.renderDtDetail(data);
    }
    if (action === ACTION_CETAK) {
      this.isShowModalReport = true
      this.paramGenerateReport = {
        isDownloadCsv: false,
        kodeGudang: data.kodeGudang,
        nomorTransaksi: data.nomorTransaksi,
      }
    }
  }

  renderDtDetail(data: any) {
    this.dtOptionsDetail = {
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => { },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeTujuan: data.kodeTujuan,
          noSuratJalan: data.noSuratJalan
        };
        setTimeout(() => {
          this.dataService
            .postData(this.config.BASE_URL + '/api/recv-store/cek-receiving/dt', params)
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;

                return {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  dateUpd: this.g.transformDate(rest.dateUpd)
                };
              });

              // Urutkan berdasarkan rcvScore tertinggi
              const sortedData = mappedData.sort((a: any, b: any) => b.rcvScore - a.rcvScore);

              this.page.recordsTotal = resp.recordsTotal;
              this.page.recordsFiltered = resp.recordsFiltered;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: sortedData,
              });
            });
        }, DEFAULT_DELAY_TABLE);
      },
      order: [[3, 'desc']], // masih urut default berdasarkan kolom ke-4
      columns: [
        { data: 'kodeItem', title: 'KODE', className: 'text-nowrap text-start' },
        {
          data: 'namaBarang',
          title: 'Keterangan',
          className: 'text-nowrap text-start',
        },
        { data: 'konversi', title: 'Konversi' },
        { data: 'qtyBesarDlv', title: 'Besar', searchable: true, className: 'text-nowrap text-center' },
        { data: 'qtyKecilDlv', title: 'Kecil', searchable: true, className: 'text-nowrap text-center' },
        { data: 'qtyTotalDlv', title: 'Total', className: 'text-center' },
        { data: 'qtyBesarRcv', title: 'Besar', searchable: true, className: 'text-nowrap text-center' },
        { data: 'qtyKecilRcv', title: 'Kecil', searchable: true, className: 'text-nowrap text-center' },
        { data: 'qtyTotalRcv', title: 'Total', className: 'text-center' },
      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-cetak', row).on('click', () =>
          this.actionBtnClick(ACTION_CETAK, data)
        );
        return row;
      },
    };
  }

  onPreviousPressed(): void {
    this.router.navigate(['/sync-data/all']);
  }

  ngOnInit(): void {
    this.getFormattedDates()
  }


  getFormattedDates() {
   
  const localStorageData = JSON.parse(localStorage['dataCekPengiriman']);

  if (localStorageData) {
    const parsed = JSON.parse(localStorageData);

    this.startDate = moment(parsed.startDate).format('D MMMM YYYY');
    this.endDate = moment(parsed.endDate).format('D MMMM YYYY');
  }

}

  ngOnDestroy(): void {
    localStorage.removeItem('inv_last_menu_sync_data');
    localStorage.removeItem('dataCekPengiriman');
  }

  ngAfterViewInit(): void { }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }


  onShowModalReport() {
    this.isShowModalReport = true;
  }

  onUpdateReport() {

    const paramUpdate = {
      listProsesDoBalik: this.listProsesDoBalik
    }
    Swal.fire({
      title: '<div style="color: white; background:rgb(83, 188, 229); padding: 12px 20px; font-size: 18px;">Konfirmasi Posting D.O Balik</div>',
      html: `
      <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">
        <p>Program tersebut untuk melakukan proses D.O BALIK - AUTOMATIC yang status Receive = '<i class="fa fa-check"></i>' dan Flag_Row = '<i class="fa fa-check"></i>' dan Flag_Qty = '<i class="fa fa-check"></i>' </p>
      </div>
      <div class="divider my-3"></div>
      <div class="d-flex justify-content-center gap-3 mt-3">
        <button class="btn btn-info text-white btn-150 pe-3" id="btn-submit">
          <i class="fa fa-check pe-2"></i> Proses
        </button>
        <button class="btn btn-outline-info btn-150" id="btn-cancel">
          <i class="fa fa-times pe-1 text-danger"></i> Batal
        </button>
      </div>
    `,
      allowOutsideClick: false,
      showConfirmButton: false,
      showCancelButton: false,
      width: '600px',
      customClass: {
        popup: 'custom-popup'
      },
      didOpen: () => {
        const submitBtn = document.getElementById('btn-submit');
        const cancelBtn = document.getElementById('btn-cancel');

        // Submit action
        submitBtn?.addEventListener('click', () => {
          Swal.close();

          this.dataService
            .postData(this.config.BASE_URL + '/api/auto-posting-do-balik', paramUpdate)
            .subscribe((resp: any) => {
              this.disabledPrintButton = false;
              if (resp.success) {
                this.toastr.success('Berhasil Posting DO Balik!');
                this.datatableElement?.dtInstance.then((dtInstance: any) => {
                  dtInstance.ajax.reload();
                });
              } else {
                this.toastr.error('Gagal Posting DO Balik!');
              }
            });
        });

        // Cancel action
        cancelBtn?.addEventListener('click', () => {
          Swal.close();
        });
      }
    });
  }


}
