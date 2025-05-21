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
import { ACTION_VIEW, DEFAULT_DELAY_TABLE } from '../../../../constants';

@Component({
  selector: 'app-display-selisih-so',
  templateUrl: './display-selisih-so.component.html',
  styleUrl: './display-selisih-so.component.scss',
})
export class DisplaySelisihSoComponent implements OnInit, OnDestroy, AfterViewInit {
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  formData: any = {}
  alreadyPrint: boolean;
  disabledPrintButton: any;
  paramGenerateReport: any = {}
  isShowModalReport: boolean = false;
  paramUpdateReport: any = {}
  protected config = AppConfig.settings.apiServer;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];

  constructor(
    private service: AppService,
    private g: GlobalService,
    private dataService: DataService,
    translation: TranslationService,
    private router: Router,
  ) {
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
              kodeGudang: this.g.getUserLocationCode(),
              tipeTransaksi: '5'
            };
            setTimeout(() => {
              this.dataService
                .postData(this.config.BASE_URL + '/api/delivery-order/dt', params)
                .subscribe((resp: any) => {
                  const mappedData = resp.data.map((item: any, index: number) => {
                    // hapus rn dari data
                    const { rn, ...rest } = item;
                    const finalData = {
                      ...rest,
                      dtIndex: this.page.start + index + 1,
                      tglPesanan: this.g.transformDate(rest.tglPesanan),
                      tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                      dateCreate: this.g.transformDate(rest.dateCreate),
                      timeCreate: this.g.transformTime(rest.timeCreate),
                      datePosted: this.g.transformDate(rest.datePosted),
                      timePosted: this.g.transformTime(rest.timePosted)
                    };
                    return finalData;
                  });
                  this.page.recordsTotal = resp.recordsTotal;
                  this.page.recordsFiltered = resp.recordsFiltered;
                  callback({
                    recordsTotal: resp.recordsTotal,
                    recordsFiltered: resp.recordsFiltered,
                    data: mappedData,
                  });
                });
            }, DEFAULT_DELAY_TABLE);
          },
          order: [[9, 'asc'], [4, 'desc']],
          columns: [
            { data: 'dtIndex', title: '#' },
            { data: 'tglTransaksi', title: 'Tanggal Kirim' },
            { data: 'tglPesanan', title: 'Tanggal Pesan' },
            { data: 'nomorPesanan', title: 'Nomor Pesanan', searchable: true },
            { data: 'noSuratJalan', title: 'Nomor Pengiriman', searchable: true },
            {
              data: 'kodeTujuan',
              title: 'Kode Tujuan',
              orderable: true,
              searchable: true,
            },
            {
              data: 'namaTujuan',
              title: 'Tujuan',
              orderable: true,
              searchable: true,
            },
            {
              data: 'cetakSuratJalan',
              title: 'Status Cetak Surat Jalan',
              render: (data:any) => this.g.getStatusOrderLabel(data, true, true),
            },
            {
              data: 'statusDoBalik',
              title: 'Status DO Balik',
              render: (data:any) => this.g.getStatusOrderLabel(data, true, true),
            },
            {
              data: 'statusPosting',
              title: 'Status Pengiriman',
              render: (data:any) => {
                // const isCancel = data == CANCEL_STATUS;
                // const label = this.g.getStatusOrderLabel(data, false, true);
                // if (isCancel) {
                //   return `<span class="text-center text-danger">${label}</span>`;
                // }
                // return label;
              },
            },
            {
              title: 'Aksi',
              className: 'text-center',
    
              render: () => {
                return `<div class="d-flex px-2 gap-1">
                  <button style="width: 74px" class="btn btn-sm action-view btn-outline-info btn-60 pe-2">
                  <i class="fa fa-eye pe-2"></i>y</button>
                </div>`;
              },
            },
          ],
          searchDelay: 1000,
          // delivery: [],
          rowCallback: (row: Node, data: any[] | Object, index: number) => {
            $('.action-view', row).on('click', () =>
              this.actionBtnClick(ACTION_VIEW, data)
            );
            // $('.action-cetak', row).on('click', () =>
            //   // this.actionBtnClick(ACTION_CETAK, data)
            // );
            return row;
          },
        };
        this.dtColumns = this.dtOptions.columns;
        this.dpConfig.containerClass = 'theme-dark-blue';
        this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
        this.dpConfig.adaptivePosition = true;
  }

    actionBtnClick(action: string, data: any = null) {
      // if (action === ACTION_VIEW) {
      //   this.g.saveLocalstorage(
      //     LS_INV_SELECTED_DELIVERY_ORDER,
      //     JSON.stringify(data)
      //   );
      //   this.router.navigate(['/transaction/delivery-item/detail-transaction']); this
      // }
      // if (action === ACTION_CETAK) {
      // }
    }

  ngOnInit(): void {
    this.getDataSo();
  }

  ngOnDestroy(): void { }

  ngAfterViewInit(): void { }

  getDataSo() {
    const params = {
      kodeGudang: this.g.getUserLocationCode()
    };

    this.dataService
      .postData(
        this.config.BASE_URL + '/api/stock-opname/laporan-hasil-so',
        params
      ).subscribe(
        (res) => {
          this.formData = res.item[0]
          this.formData.tanggalSo = this.g.transformDate(this.formData.tanggalSo);
          const now = new Date();
          this.paramGenerateReport = {
            isDownloadCsv: false,
            nomorSo: this.formData.nomorSo,
            userCetak: this.g.getLocalstorage('inv_currentUser').namaUser,
            tglCetak: now.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short', // atau 'long' untuk "April"
              year: 'numeric'
            }), // hasil: 30 Apr 2025

            jamCetak: now.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }) // hasil: sil: 13:
          }
          setTimeout(() => {
          }, 1000);
        }
      );
  }


  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }


  onShowModalReport() {
    this.isShowModalReport = true;
  }
}
