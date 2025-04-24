import {
  AfterViewInit,
  Component,
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
  dtOptions: DataTables.Settings = {};
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

  constructor(
    private service: AppService,
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.userData = this.service.getUserData();
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
                statusProses: item.statusProses === 'P' ? 'PROSES' : 'BELUM',
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
        { data: 'userCreate', title: 'User Create', searchable: false },
        { data: 'dateCreate', title: 'Tanggal Create', searchable: false },
        { data: 'timeCreate', title: 'Jam Create', searchable: false },
        { data: 'userProses', title: 'User Proses', searchable: false },
        { data: 'dateProses', title: 'Tanggal Proses', searchable: false },
        { data: 'timeProses', title: 'Jam Proses', searchable: false },
        {
          title: 'Action',
          render: (data: any, type: any, row: any) => {
            let html =
              '<div class="btn-group" role="group" aria-label="Action">';
            if (row.statusProses !== 'PROSES') {
              html += '<button class="btn btn-sm action-edit btn-info btn-60">';
              html += this.buttonCaptionEdit;
              html += '</button>';
            }
            html +=
              '<button class="btn btn-sm action-view btn-outline-info btn-60">';
            html += this.buttonCaptionView;
            html += '</button></div>';
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
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-edit', row).on('click', () =>
          this.actionBtnClick(ACTION_EDIT, data)
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
    this.dtOptions?.columns?.forEach((column: any, index) => {
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
      this.g.saveLocalstorage(LS_INV_SELECTED_SO, JSON.stringify(data));
      this.router.navigate(['/stock-opname/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/stock-opname/add']);
    }
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
}
