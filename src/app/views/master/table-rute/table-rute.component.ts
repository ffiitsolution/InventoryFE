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
  LS_INV_SELECTED_RUTE,
} from '../../../../constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-rute',
  templateUrl: './table-rute.component.html',
  styleUrl: './table-rute.component.scss',
})
export class TableRuteComponent implements OnInit, OnDestroy, AfterViewInit {
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
  buttonCaptionEdit: String = 'Ubah';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  roleId: any;

  hasCreate: boolean = false;
  hasUpdate: boolean = false;
  isFilterShown: boolean = false;
  configSelectStatus: any;

    baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };
  

  listStatus: any[] = [
    {
      id: 'A',
      name: 'Aktif',
    },
    {
      id: 'I',
      name: 'Tidak Aktif',
    },
  ];
  formStatusFilter: any;
  kodeGudang: any;


  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.kodeGudang = this.g.getUserLocationCode();
    console.log(this.listStatus);
    this.dtOptions = {
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

        const requestData = {
          ...dataTablesParameters,
            status: this.formStatusFilter?.id ? this.formStatusFilter.id : '',
            kodeGudang: this.kodeGudang
        };
        this.dataService
          .postData(this.g.urlServer + '/api/rute/dt', requestData)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
                dateCreate: this.g.transformDate(item.dateCreate),
                dateUpdate: this.g.transformDate(item.dateUpdate),
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
          data: 'nomorRute',
          title: 'Nomor Rute',
          orderable: true,
          searchable: true,
        },
        {
          data: 'namaRute',
          title: 'Nama Rute',
          orderable: true,
          searchable: true,
        },
          {
          data: 'kodeGudang',
          title: 'Kode Gudang',
          orderable: true,
          searchable: true,
        },
          {
          data: 'status',
          title: 'Status Rute',
           render: function (data: any, type: any, row: any): string {
  if (type === 'display') {
    if (data === 'A') {
      return '<span class="status-badge active">Active</span>';
    } else if (data === 'I') {
      return '<span class="status-badge inactive">Inactive</span>';
    } else {
      return '<span class="status-badge unknown">' + (data || 'Unknown') + '</span>';
    }
  }
  return data;
},
          orderable: true,
          searchable: true,
        },
        // { data: 'userCreate', title: 'Dibuat Oleh', searchable: false },
        // { data: 'dateCreate', title: 'Tanggal Dibuat', searchable: false },
        // { data: 'userUpdate', title: 'Diperbarui Oleh', searchable: false },
        // { data: 'dateUpdate', title: 'Tanggal Diperbarui', searchable: false },
        {
          title: 'Action',
          render: () => {
            if (!this.hasUpdate) {
              return `
                <div class="btn-group" role="group" aria-label="Action">
                  <button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>
                </div>
              `;
            }
            return `
            <div class="btn-group" role="group" aria-label="Action">
              <button class="btn btn-sm action-view btn-outline-info btn-60">${this.buttonCaptionView}</button>
              <button class="btn btn-sm action-edit btn-outline-info btn-60">${this.buttonCaptionEdit}</button>
            </div>
            `;
          },
        },
      ],
      searchDelay: 1500,
      order: [[1, 'asc']],
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
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;

        this.configSelectStatus = {
      ...this.baseConfig,
      placeholder: 'Pilih Status',
      searchPlaceholder: 'Cari Status',
      limitTo: this.listStatus.length,
    };
    this.g.changeTitle(
      this.translation.instant('Tabel') +
        ' ' +
        this.translation.instant('Satuan') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.buttonCaptionEdit = this.translation.instant('Ubah');
    localStorage.removeItem(LS_INV_SELECTED_RUTE);
    this.hasCreate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master-tonase') &&
          p.permission.endsWith('update')
      );
    this.hasUpdate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master_master') &&
          p.permission.endsWith('_update')
      );
  }

  rerenderDatatable(): void {
    this.dtOptions?.columns?.forEach((column: any, index: any) => {
      if (this.dtColumns[index]?.title) {
        column.title = this.translation.instant(this.dtColumns[index].title);
      }
    });
  }

    toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_RUTE, JSON.stringify(data));
      this.router.navigate(['/master/master-rute/detail']);
    } else if (action === ACTION_EDIT) {
      this.g.saveLocalstorage(LS_INV_SELECTED_RUTE, JSON.stringify(data));
      this.router.navigate(['/master/master-rute/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/master/master-rute/add']);
    }
  }
  dtPageChange(event: any) {
    this.selectedRowData = undefined;
  }

    onStatusFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
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
