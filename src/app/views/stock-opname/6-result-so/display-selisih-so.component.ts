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
import {
  ACTION_CETAK,
  ACTION_VIEW,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_SO,
} from '../../../../constants';

@Component({
  selector: 'app-display-selisih-so',
  templateUrl: './display-selisih-so.component.html',
  styleUrl: './display-selisih-so.component.scss',
})
export class DisplaySelisihSoComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  formData: any = {};
  alreadyPrint: boolean;
  disabledPrintButton: any;
  paramGenerateReport: any = {};
  isShowModalReport: boolean = false;
  paramUpdateReport: any = {};
  protected config = AppConfig.settings.apiServer;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  dtColumns: any = [];
  dataSo: any;

  constructor(
    private service: AppService,
    private g: GlobalService,
    private dataService: DataService,
    translation: TranslationService,
    private router: Router
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: () => {},
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.g.getUserLocationCode(),
          tipeTransaksi: '5',
          nomorTransaksi: this.dataSo?.noAdj ?? '',
        };
        setTimeout(() => {
          this.dataService
            .postData(
              this.config.BASE_URL + '/api/stock-opname/display-selisih-so',
              params
            )
            .subscribe((resp: any) => {
              const mappedData = resp.data.map((item: any, index: number) => {
                const { rn, ...rest } = item;
                const finalData = {
                  ...rest,
                  dtIndex: this.page.start + index + 1,
                  tglTransaksi: this.g.transformDate(rest.tglTransaksi),
                  dateCreate: this.g.transformDate(rest.dateCreate),
                  timeCreate: this.g.transformTime(rest.timeCreate),
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
      order: [[2, 'desc']],
      columns: [
        { data: 'dtIndex', title: '#' },
        { data: 'tglTransaksi', title: 'Tanggal Transaksi' },
        { data: 'nomorTransaksi', title: 'No Transaksi' },
        {
          data: 'keterangan',
          title: 'Keterangan Penyesuaian',
          searchable: true,
        },
        { data: 'userCreate', title: 'User Proses', searchable: true },
        {
          data: 'dateCreate',
          title: 'Tanggal',
          orderable: true,
          searchable: true,
        },
        {
          data: 'timeCreate',
          title: 'Jam',
          orderable: true,
          searchable: true,
        },
        {
          title: 'Aksi',
          className: 'text-center',

          render: () => {
            return ` <div class="d-flex px-2 gap-2">
                <button style="width: 100px" class="btn btn-sm action-view btn-outline-success btn-60 pe-1"><i class="fa fa-eye pe-1"></i>Lihat</button>
                <button style="width: 100px" class="btn btn-sm action-cetak btn-outline-info btn-60"><i class="fa fa-print pe-1"></i>Cetak</button>
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
      this.g.saveLocalstorage('selectedData', JSON.stringify(data));
      this.router.navigate(['/stock-opname/display-selisih-so/detail']);
    }
    if (action === ACTION_CETAK) {
      this.isShowModalReport = true;
      this.paramGenerateReport = {
        isDownloadCsv: false,
        kodeGudang: data.kodeGudang,
        nomorTransaksi: data.nomorTransaksi,
      };
    }
  }

  onPreviousPressed(): void {
    this.router.navigate(['/stock-opname/setup-so']);
  }

  ngOnInit(): void {
    this.dataSo = JSON.parse(
      this.g.getLocalstorage(LS_INV_SELECTED_SO) ?? '{}'
    );
    // if (this.dataSo?.noAdj != null) {
    //   this.dataService
    //     .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
    //     .subscribe((resp: any) => {
    //       console.log('resp', resp);
    //     });
    // }
  }

  ngOnDestroy(): void {
    localStorage.removeItem(LS_INV_SELECTED_SO);
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(): void {}

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  onShowModalReport() {
    this.isShowModalReport = true;
  }
}
