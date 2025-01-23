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
  LS_INV_SELECTED_USER,
} from '../../../../constants';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-user',
  templateUrl: 'master-user.component.html',
  styleUrl: 'master-user.component.scss',
})
export class MasterUserComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
  isFilterShown: boolean = false;
  selectedStatusFilter: any = '';
  dtColumns: any = [];

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  onStatusFilterChange() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

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
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const requestData = {
          ...dataTablesParameters,
          status: this.selectedStatusFilter,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/users/dt', requestData)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                dtIndex: this.page.start + index + 1,
                ...rest,
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
        { data: 'kodeUser', title: 'Kode', searchable: false },
        { data: 'namaUser', title: 'Nama', searchable: false },
        { data: 'jabatan', title: 'Jabatan', searchable: false },
        { data: 'statusAktif', title: 'Status', searchable: false },
        { data: 'defaultLocation', title: 'Default Lokasi', searchable: false },
      ],
      searchDelay: 1500,
      order: [[1, 'asc']],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        $('td', row).off('click');
        $('td', row).on('click', () => {
          $('td').removeClass('bg-info text-white fw-bold');
          if (self.selectedRowData !== data) {
            self.selectedRowData = data;
            $('td', row).addClass('bg-info text-white fw-bold');
          } else {
            self.selectedRowData = undefined;
          }
        });
        return row;
      },
    };
    this.dtColumns = this.dtOptions.columns;
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

  ngOnInit(): void {
    this.g.changeTitle(this.translation.instant('Master') + ' ' + this.translation.instant('User') + ' - ' + this.g.tabTitle);
    localStorage.removeItem(LS_INV_SELECTED_USER);
  }

  actionBtnClick(action: string) {
    let data = this.selectedRowData;
    // this.g.alertConfirm(action, JSON.stringify(data)).then((result) => {
    //   console.log(result);
    // });
    if (action === 'view') {
      this.g.saveLocalstorage(LS_INV_SELECTED_USER, JSON.stringify(data));
      this.router.navigate(['/master/master-user/detail']);
    } else if (action === 'add') {
      this.router.navigate(['/master/master-user/add']);
    } else if (action === 'edit') {
      this.g.saveLocalstorage(LS_INV_SELECTED_USER, JSON.stringify(data));
      this.router.navigate(['/master/master-user/edit']);
    } else if (action === 'delete') {
    } else {
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
