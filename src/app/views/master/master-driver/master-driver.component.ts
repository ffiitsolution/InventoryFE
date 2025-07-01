import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import { ACTION_ADD, ACTION_VIEW, ACTION_EDIT, LS_INV_SELECTED_RUTE } from 'src/constants';

@Component({
  selector: 'app-master-driver',
  templateUrl: './master-driver.component.html',
  styleUrl: './master-driver.component.scss'
})
export class MasterDriverComponent implements OnInit, OnDestroy, AfterViewInit {  
  CONST_ACTION_ADD: string = ACTION_ADD;
  hasCreate: boolean = false;
  hasUpdate: boolean = false;
  dtOptions: any = {};
  roleId: any;
  dtColumns: any = [];
  page = new Page();
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Ubah';
  selectedRowData: any;
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  ListKendaraan = [];
  isFilterShown: boolean = false;
    constructor(
      private dataService: DataService,
      private g: GlobalService,
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
      drawCallback: (drawCallback: any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        this.dataService
          .postData(this.g.urlServer + '/api/driver/dt', dataTablesParameters)
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
          data: 'kodeUser',
          title: 'Kode Supir',
          orderable: true,
          searchable: true,
        },
        {
          data: 'namaUser',
          title: 'Nama Supir',
          orderable: true,
          searchable: true,
        },
        { data: 'jabatan', 
          title: 'Jabatan',
          searchable: true,
          orderable:true },
        { data: 'tanggal dibuat', 
          title: 'Tanggal Dibuat', 
          searchable: true, 
          orderable: true 
        },
        { data: 'tanggal diubah', 
          title: 'Tanggal Diubah', 
          searchable: true, 
          orderable: true 
        },
      {
  data: 'statusAktif',
  title: 'Status Supir',
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
  searchable: true,
  orderable: true
},
        
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

    toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  actionBtnClick(action: string, data: any = null) {
      if (action === ACTION_VIEW) {
        this.g.saveLocalstorage(LS_INV_SELECTED_RUTE, JSON.stringify(data));
        this.router.navigate(['/master/master-driver/detail']);
      } else if (action === ACTION_EDIT) {
        this.g.saveLocalstorage(LS_INV_SELECTED_RUTE, JSON.stringify(data));
        this.router.navigate(['/master/master-driver/edit']);
      } else if (action === ACTION_ADD) {
        this.router.navigate(['/master/master-driver/add']);
      }
    }

    ngOnInit(): void {
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
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
          p.permission.startsWith('master_master') &&
          p.permission.endsWith('_create')
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
    this.datatableElement?.dtInstance?.then((dtInstance) => {
      dtInstance.destroy();
    });
    setTimeout(() => {
      this.dtTrigger.next(null);
    });
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
