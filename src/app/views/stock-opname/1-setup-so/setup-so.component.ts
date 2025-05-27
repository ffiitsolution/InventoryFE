import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_SO,
} from '../../../../constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { AppService } from '../../../service/app.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
declare var bootstrap: any;

@Component({
  selector: 'app-setup-so',
  templateUrl: './setup-so.component.html',
  styleUrl: './setup-so.component.scss',
})
export class SetupSoComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  orders: any[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedRowData: any;
  dtColumns: any = [];
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Entry';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  userData: any;
  selectedMenu: string = '';
  @ViewChild('modalMenuSo', { static: false }) modalElement!: ElementRef;
  private bsModalMenu: any;
  listData: any[] = [];
  filteredListData: any[] = [];

  alreadyPrint: boolean;
  disabledPrintButton: any;
  paramGenerateReport: any = {};
  paramReportSelisihSo: any = {};
  isShowModalReport: boolean = false;
  loadings: { [key: string]: boolean } = {};

  constructor(
    private service: AppService,
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private datePipe: DatePipe,
    private toastr: ToastrService
  ) {
    this.userData = this.service.getUserData();
    this.dtOptions = {
      pageLength: 5,
      lengthMenu: [
        [5, 10, 25, 50, 100],
        [5, 10, 25, 50, 100],
      ],
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback: any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        dataTablesParameters['kodeGudang'] =
          this.userData.defaultLocation.kodeLocation;
        this.dataService
          .postData(
            this.g.urlServer + '/api/stock-opname/dt',
            dataTablesParameters
          )
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
                statusProses: item.statusProses === 'S' ? 'SUDAH' : 'BELUM',
                tanggalSo: this.g.transformDate(item.tanggalSo),
                dateCreate: this.g.transformDate(item.dateCreate),
                dateProses: this.g.transformDate(item.dateProses),
                timeCreate: this.g.transformTime(item.timeCreate, true),
                timeProses: this.g.transformTime(item.timeProses, true),
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            this.listData.push(mappedData);
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        {
          data: 'tanggalSo',
          title: 'Tanggal S.O',
          orderable: true,
          searchable: true,
        },
        {
          data: 'nomorSo',
          title: 'Nomor Form S.O',
          orderable: true,
          searchable: true,
        },
        { data: 'statusProses', title: 'Status Proses', searchable: false },
        {
          title: 'Status Proses',
          render: (data: any, type: any, row: any) => {
            let html =
              '<div class="btn-group" role="group" aria-label="Action">';
            if (row.statusProses === 'SUDAH') {
              html += '<div class="badge text-white text-bg-primary">';
              html += row.statusProses;
              html += '</div>';
            } else {
              html += '<div class="badge text-white text-bg-danger">';
              html += row.statusProses;
              html += '</div>';
            }
            return html;
          },
        },
        { data: 'userCreate', title: 'User Create', searchable: false },
        { data: 'dateCreate', title: 'Tanggal Create', searchable: false },
        { data: 'timeCreate', title: 'Jam Create', searchable: false },
        { data: 'userProses', title: 'User Proses', searchable: false },
        { data: 'dateProses', title: 'Tanggal Proses', searchable: false },
        { data: 'timeProses', title: 'Jam Proses', searchable: false },
        {
          title: 'Action',
          render: (data: any, type: any, row: any) => {
            let html = '';
            // '<div class="btn-group" role="group" aria-label="Action">';
            if (row.statusProses !== 'SUDAH') {
              // html += '<button class="btn btn-sm action-edit btn-info btn-60">';
              // html += this.buttonCaptionEdit;
              // html += '</button>';
              html +=
                '<button class="btn btn-sm w-120 action-posting text-white btn-warning btn-60">';
              html += 'POSTING';
              html += '</button>';
            } else {
              html +=
                '<button class="btn btn-sm w-120 action-posting text-white btn-primary btn-60" disabled>';
              html += 'POSTED';
              html += '</button>';
            }
            // html +=
            //   '<button class="btn btn-sm action-view btn-outline-info btn-60">';
            // html += this.buttonCaptionView;
            // html += '</button></div>';
            return html;
          },
        },
      ],
      searchDelay: 1500,
      order: [
        [3, 'asc'],
        [1, 'desc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-edit', row).on('click', () =>
          this.actionBtnClick(ACTION_EDIT, data)
        );
        $('.action-posting', row).on('click', () =>
          this.actionBtnClick('posting', data)
        );

        $('td', row).off('click');
        $('td', row).on('click', () => {
          if (this.selectedRowData !== data) {
            self.selectedRowData = data;
            $(row).addClass('selected');
            $(row).siblings().removeClass('selected');
          } else {
            // $(row).removeClass('selected');
            // self.selectedRowData = undefined;
          }
        });
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
  }

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Stock') +
        ' ' +
        this.translation.instant('Opname') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.buttonCaptionEdit = this.translation.instant('Entri');
    localStorage.removeItem(LS_INV_SELECTED_SO);
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index: any) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
      this.router.navigate(['/stock-opname/detail']);
    } else if (action === ACTION_EDIT) {
      data.posting = false;
      this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
      this.router.navigate(['/stock-opname/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/stock-opname/add']);
    } else if (action === 'posting') {
      data.posting = true;
      this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
      this.router.navigate(['/stock-opname/edit']);
    }
  }

  downloadPDF(res: any, fileName: string) {
    var blob = new Blob([res], { type: 'application/pdf' });
    const downloadURL = window.URL.createObjectURL(blob);

    if (downloadURL.length) {
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = `${this.g.formatUrlSafeString(fileName)}.pdf`;
      link.click();
      this.toastr.success('File sudah terunduh');
    } else this.toastr.error('File tidak dapat terunduh');
  }

  printPDF(res: any) {
    var blob = new Blob([res], { type: 'application/pdf' });
    const downloadURL = window.URL.createObjectURL(blob);
    const printWindow = window.open(downloadURL);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else this.toastr.error('File tidak dapat terunduh');
  }

  dtPageChange(event: any) {
    this.selectedRowData = undefined;
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }
  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }

  onMenuClick(menu: string) {
    console.log('Menu clicked:', menu);
    this.selectedMenu = menu;
    const data = this.selectedRowData;
    const momentDate = moment(data.tanggalSo, 'DD MMM YYYY');
    const yearEom = momentDate.year();
    const monthEom = momentDate.month() + 1;
    const firstDate = momentDate.clone().startOf('month').format('DD MMM YYYY');
    const lastDate = momentDate.clone().endOf('month').format('DD MMM YYYY');
    switch (menu) {
      case 'Cetak Form SO':
        this.loadings['cetakFormSo'] = true;
        this.service
          .getFile('/api/report/report-jasper', {
            kodeGudang: data.kodeGudang,
            nomorSo: data.nomorSo,
            tanggalSo: data.tanggalSo,
            userData: this.userData,
            isDownloadCsv: false,
            reportName: 'Cetak Form Stock Opname',
            reportSlug: 'form-stock-opname',
            yearEom: yearEom,
            monthEom: monthEom,
            firstDate: firstDate,
            lastDate: lastDate,
          })
          .subscribe({
            next: (res: any) => {
              this.loadings['cetakFormSo'] = false;
              return this.downloadPDF(res, 'Form Stock Opname');
            },
            error: (err: any) => {
              this.loadings['cetakFormSo'] = false;
              this.toastr.error('Gagal mengunduh file', 'Terjadi kesalahan');
            },
          });
        break;

      case 'Laporan Selisih SO (Sementara)':
        this.paramReportSelisihSo = {
          kodeGudang: data.kodeGudang,
          nomorSo: data.nomorSo,
          tanggalSo: data.tanggalSo,
          userData: this.userData,
          isDownloadCsv: false,
          reportName: 'Laporan Selisih SO (Sementara)',
          reportSlug: 'selisih-so-sementara',
          yearEom: yearEom,
          monthEom: monthEom,
          firstDate: firstDate,
          lastDate: lastDate,
          confirmSelection: this.paramReportSelisihSo?.confirmSelection ?? 'Ya',
        };
        this.loadings['laporanSelisihSOModal'] = true;
        break;

      case 'Entry Stock Opname':
        this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
        this.router.navigate(['/stock-opname/edit']);
        break;

      case 'Lihat Detail':
        this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
        this.router.navigate(['/stock-opname/detail']);
        break;

      case 'Laporan Hasil SO':
        const now = new Date();
        this.isShowModalReport = true;
        this.disabledPrintButton = false;
        this.paramGenerateReport = {
          isDownloadCsv: false,
          nomorSo: data.nomorSo,
          userCetak: this.g.getLocalstorage('inv_currentUser').namaUser,
          tglCetak: now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short', // atau 'long' untuk "April"
            year: 'numeric',
          }), // hasil: 30 Apr 2025

          jamCetak: now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }), // hasil: sil: 13:
        };
        break;
      case 'Display Selisih SO':
        this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
        this.router.navigate(['/stock-opname/display-selisih-so']);
        break;

      default:
        this.openModalMenu();
        break;
    }
  }

  printSelisihSo(isDownload: boolean) {
    this.loadings['laporanSelisihSO'] = true;
    this.service
      .getFile('/api/report/report-jasper', {
        ...this.paramReportSelisihSo,
        showExpired: this.paramReportSelisihSo.confirmSelection === 'Ya',
      })
      .subscribe(
        (res: any) => {
          this.loadings['laporanSelisihSO'] = false;
          this.loadings['laporanSelisihSOModal'] = false;
          return isDownload
            ? this.downloadPDF(res, 'Laporan Selisih SO (Sementara)')
            : this.printPDF(res);
        },
        (err: any) => {
          this.loadings['laporanSelisihSO'] = false;
          this.loadings['laporanSelisihSOModal'] = false;
        }
      );
  }

  openModalMenu(): void {
    this.bsModalMenu = new bootstrap.Modal(this.modalElement.nativeElement);
    this.bsModalMenu.show();
  }

  closeModalMenu(): void {
    if (this.bsModalMenu) {
      this.bsModalMenu.hide();
    }
  }

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }
}
