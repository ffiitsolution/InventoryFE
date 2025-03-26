import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GlobalService } from '../../service/global.service';
import moment from 'moment';
import { AppService } from '../../service/app.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_EDIT_STATUS,
  ACTION_VIEW,
  BUTTON_CAPTION_EDIT,
  BUTTON_CAPTION_VIEW,
  LS_INV_SELECTED_BRANCH,
} from '../../../constants';
import { TranslationService } from '../../service/translation.service';
import { Page } from '../../model/page';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'end-of-month.component.html',
  styleUrls: ['end-of-month.component.scss'],
})
export class EndOfMonthComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: any = {};

  dtColumns: any = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;
  buttonCaptionView: string = BUTTON_CAPTION_VIEW;
  buttonCaptionEdit: string = BUTTON_CAPTION_EDIT;
  CONST_ACTION_ADD: string = ACTION_ADD;
  selectedRowData: any;
  page = new Page();

  loading: boolean = false;
  loadingProcess: boolean = false;
  isShowModalProcess: boolean = false;
  isDateEqual: boolean = false;

  currentView: string = 'closing';
  rangeBulan: any[] = [];
  rangeTahun: any[] = [];
  inputGudang: string = '00072 - GUDANG COMMISARY SENTUL BOGOR';
  lastYear: any = 2025;
  lastMonth: any = 1;
  lastDate: any = '';

  selectedMonth: any = 1;
  selectedYear: any = 2025;
  selectedLastDate: any = '';

  errorInModal: string = '';

  constructor(
    public g: GlobalService,
    private service: AppService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        dataTablesParameters['kodeGudang'] =
          this.userData?.defaultLocation?.kodeLocation ?? '';
        this.service
          .insert('/api/end-of-month/dt', dataTablesParameters)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
                dateProses: this.g.transformDate(item.dateProses),
                timeProses: this.g.transformTime(item.timeProses, true),
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
      },
      // KODE_GUDANG, YEAR_EOM, MONTH_EOM, STATUS_PROSES, USER_PROSES, DATE_PROSES, TIME_PROSES
      columns: [
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        { data: 'yearEom', title: 'TAHUN', searchable: true },
        { data: 'monthEom', title: 'BULAN', searchable: true },
        {
          data: 'statusProses',
          title: 'STATUS',
          searchable: false,
          render: (data) => {
            if (data === 'Y') {
              return `<div class=""> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c;">SUDAH DIPROSES</span></div>`;
            }
            return `<div class=""> <span class="badge badge-secondary py-2" style="background-color:#b51823;">BELUM DIPROSES</span> </div>`;
          },
        },
        { data: 'userProses', title: 'USER', searchable: true },
        { data: 'dateProses', title: 'TGL. PROSES', searchable: true },
        { data: 'timeProses', title: 'JAM PROSES', searchable: true },
      ],
      searchDelay: 1500,
      order: [
        [3, 'asc'],
        [1, 'desc'],
        [2, 'desc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-edit', row).on('click', () =>
          this.actionBtnClick(ACTION_EDIT, data)
        );
        $('.action-status', row).on('click', () =>
          this.actionBtnClick(ACTION_EDIT_STATUS, data)
        );
        if (this.selectedRowData !== data) {
          this.selectedRowData = data;
        } else {
          this.selectedRowData = undefined;
        }
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
  }

  ngOnInit(): void {
    this.userData = this.service.getUserData();

    this.lastDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    )
      .endOf('month')
      .format('DD/MM/yyyy');

    const currentDate = moment();
    this.selectedMonth = currentDate.month() + 1;
    this.selectedYear = currentDate.year();
    this.onChangeMonthYear();

    this.rangeBulan = this.g.generateNumberRange(1, 12);
    this.rangeTahun = this.g.generateNumberRange(
      this.selectedYear,
      this.selectedYear + 10
    );

    this.getLastEndOfMonth();
  }

  getServerDate() {
    return this.g.transformDate(this.g.currentDate, 'dd/MM/yyyy');
  }

  setCurrentView(view: string) {
    this.currentView = view;
    if (view === 'history') {
      this.rerenderDatatable();
    }
  }

  onChangeMonthYear() {
    this.errorInModal = '';
    this.isDateEqual = false;
    this.selectedLastDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    )
      .endOf('month')
      .format('DD/MM/yyyy');
    const lastDate = moment(`${this.lastYear}-${this.lastMonth}`, 'YYYY-MM');
    const newDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    );
    const serverDate = moment(this.g.currentDate, 'DD MMM YYYY');
    const isDateEqual = serverDate.isSame(lastDate);

    const isOlder = newDate.isBefore(lastDate);
    if (
      isOlder ||
      (this.lastMonth == this.selectedMonth &&
        this.lastYear == this.selectedYear)
    ) {
      this.errorInModal =
        'Periode Bulan-Tahun yg dipilih <br>harus setelah periode tutup bulan terakhir.';
    } else if (isDateEqual) {
      this.isDateEqual = true;
    }
  }

  getLastEndOfMonth() {
    this.loading = true;
    this.service
      .insert('/api/end-of-month/last', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const data = res.data ?? {};
          if (data.monthEom) {
            this.lastMonth = data.monthEom;
            this.lastYear = data.yearEom;

            this.lastDate = moment(
              `${this.lastYear}-${this.lastMonth}`,
              'YYYY-MM'
            )
              .endOf('month')
              .format('DD/MM/YYYY');
          }
        },
        error: (err) => {
          this.loading = false;
          console.log('err: ' + err);
        },
      });
  }

  confirmProcess() {
    this.isShowModalProcess = true;
  }

  processEndOfMonth() {
    this.isShowModalProcess = false;
    this.loadingProcess = true;
    this.service
      .insert('/api/end-of-month/process', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        kodeUser: this.userData?.kodeUser,
        yearEom: this.selectedYear,
        monthEom: this.selectedMonth,
        lastYearEom: this.lastYear,
        lastMonthEom: this.lastMonth,
      })
      .subscribe({
        next: (res) => {
          this.loadingProcess = false;
          const data = res.data ?? {};
          if(data.success){
            this.errorInModal = 'Proses Tutup Bulan selesai.';
            this.rerenderDatatable();
          } else {
            const err = data.error;
            if(err.includes('unique constraint')){
              this.errorInModal = 'Gagal proses. Terjadi kesalahan: unique constraint.';
            } else {
              this.errorInModal = 'Gagal proses. Mohon cek kembali koneksi ke server.';
            }
          }
        },
        error: (err) => {
          this.loadingProcess = false;
          console.log('err: ' + err);
          this.errorInModal = 'Gagal proses. Mohon cek kembali koneksi ke server.';
        },
      });
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
    this.datatableElement?.dtInstance?.then((dtInstance) => {
      dtInstance.destroy();
    });
    setTimeout(() => {
      this.dtTrigger.next(null);
    });
  }

  actionBtnClick(action: string, data: any = null) {
    switch (action) {
      case ACTION_VIEW:
        this.g.saveLocalstorage(LS_INV_SELECTED_BRANCH, JSON.stringify(data));
        this.router.navigate(['/master/master-branch/detail']);
        return true;
      case ACTION_EDIT:
        this.g.saveLocalstorage(LS_INV_SELECTED_BRANCH, JSON.stringify(data));
        this.router.navigate(['/master/master-branch/edit']);
        return true;
      case ACTION_ADD:
        this.router.navigate(['/master/master-branch/add']);
        return true;
      default:
        return true;
    }
  }

  dtPageChange(event: any) {
    this.selectedRowData = undefined;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }
}
