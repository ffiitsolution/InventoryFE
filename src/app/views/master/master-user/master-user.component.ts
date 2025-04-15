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
export class MasterUserComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: any;
  page = new Page();
  data: any;
  loadingIndicator = true;
  orders: any[] = [];
  dtOptions: DataTables.Settings = {};
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Ubah';
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | undefined;
  selectedRowData: any;
  isFilterShown: boolean = false;
  dtColumns: any = [];
  selectedJabatanFilter: any = '';
  selectedRoleFilter: any = '';
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };
  configSelectStatus: any;
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

  configSelectLokasi: any;
  listLokasi: any[] = [];
  formLokasiFilter: any;

  configSelectJabatan: any;
  listJabatan: any[] = [];
  formJabatanFilter: any;

  configSelectRole: any;
  listRole: any[] = [];
  formRoleFilter: any;

  roleId: any;

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  onStatusFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  onLokasiFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  onJabatanFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  onRoleFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
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
          status: this.formStatusFilter?.id ? this.formStatusFilter.id : '',
          defaultLocation: this.formLokasiFilter?.id
            ? this.formLokasiFilter.id
            : '',
          jabatan: this.formJabatanFilter?.id ? this.formJabatanFilter?.id : '',
          roleID: this.formRoleFilter?.id ? this.formRoleFilter?.id : '',
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
        { data: 'jabatanDesc', title: 'Jabatan', searchable: false },
        {
          data: 'keteranganLokasi',
          title: 'Default Lokasi',
          searchable: false,
        },
        { data: 'roleName', title: 'Role', searchable: false },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          orderable: false,
          render: () => {
            if (this.roleId !== '3' && this.roleId !== '2') {
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
      order: [
        [6, 'asc'],
        [1, 'asc'],
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
    this.g.changeTitle(
      this.translation.instant('Master') +
        ' ' +
        this.translation.instant('User') +
        ' - ' +
        this.g.tabTitle
    );
    localStorage.removeItem(LS_INV_SELECTED_USER);

    this.dataService
      .postData(this.g.urlServer + '/api/location/dropdown-lokasi', {})
      .subscribe((resp: any) => {
        this.listLokasi = resp.map((item: any) => ({
          id: item.KODE_LOCATION,
          name: item.KODE_LOCATION + ' - ' + item.KETERANGAN_LOKASI,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/jabatan/dropdown-jabatan', {})
      .subscribe((resp: any) => {
        this.listJabatan = resp.map((item: any) => ({
          id: item.CODE,
          name: item.CODE+" - "+ item.DESCRIPTION,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/role/dropdown-role', {})
      .subscribe((resp: any) => {
        this.listRole = resp.map((item: any) => ({
          id: item.ID,
          name: item.ID+" - "+item.NAME,
        }));
      });

    this.configSelectStatus = {
      ...this.baseConfig,
      placeholder: 'Pilih Status',
      searchPlaceholder: 'Cari Status',
      limitTo: this.listStatus.length,
    };
    this.configSelectLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Lokasi',
      searchPlaceholder: 'Cari Lokasi',
      limitTo: this.listLokasi.length,
    };
    this.configSelectJabatan = {
      ...this.baseConfig,
      placeholder: 'Pilih Jabatan',
      searchPlaceholder: 'Cari Jabatan',
      limitTo: this.listJabatan.length,
    };
    this.configSelectRole = {
      ...this.baseConfig,
      placeholder: 'Pilih Role',
      searchPlaceholder: 'Cari Role',
      limitTo: this.listRole.length,
    };
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_USER, JSON.stringify(data));
      this.router.navigate(['/master/master-user/detail']);
    } else if (action === ACTION_EDIT) {
      this.g.saveLocalstorage(LS_INV_SELECTED_USER, JSON.stringify(data));
      this.router.navigate(['/master/master-user/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/master/master-user/add']);
    } else if (action === 'add') {
      this.router.navigate(['/master/master-user/add']);
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
