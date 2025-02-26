import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_EDIT_STATUS,
  ACTION_VIEW,
  BUTTON_CAPTION_EDIT,
  BUTTON_CAPTION_VIEW,
  LS_INV_SELECTED_BRANCH,
} from 'src/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-branch',
  templateUrl: 'master-branch.component.html',
  styleUrl: 'master-branch.component.scss',
})
export class MasterBranchComponent implements OnInit, OnDestroy, AfterViewInit {
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
  dtColumns: any = [];
  buttonCaptionView: string = BUTTON_CAPTION_VIEW;
  buttonCaptionEdit: string = BUTTON_CAPTION_EDIT;
  CONST_ACTION_ADD: string = ACTION_ADD;

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
  formStatusFilter: any;
  listStatus: any[] = [
    {
      id: 'A',
      name: 'Aktif',
    },
    {
      id: 'T',
      name: 'Tidak Aktif',
    },
  ];

  configSelectCabang: any;
  formCabangFilter: any;
  listCabang: any[] = [];

  configSelectRsc: any;
  formRscFilter: any;
  listRsc: any[] = [];

  configSelectKota: any;
  formKotaFilter: any;
  listKota: any[] = [];

  configSelectGroup: any;
  formGroupFilter: any;
  listGroup: any[] = [];

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  onStatusFilterChange() {
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
          statusAktif: this.formStatusFilter?.id
            ? this.formStatusFilter.id
            : '',
          tipeCabang: this.formCabangFilter?.id ? this.formCabangFilter.id : '',
          kodeRSC: this.formRscFilter?.id ? this.formRscFilter.id : '',

          kota: this.formKotaFilter?.id ? this.formKotaFilter.id : '',
          kodeGroup: this.formGroupFilter?.id ? this.formGroupFilter.id : '',
        };
        this.dataService
          .postData(this.g.urlServer + '/api/branch/dt', requestData)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                keteranganRsc: `${rest.kodeRsc} - ${rest.keteranganRsc}`,
                dtIndex: this.page.start + index + 1,
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
        { data: 'kodeCabang', title: 'Kode', searchable: true },
        { data: 'kodeSingkat', title: 'Inisial', searchable: true },
        { data: 'tipeCabang', title: 'Tipe', searchable: true },
        { data: 'namaCabang', title: 'Nama', searchable: true },
        { data: 'keteranganRsc', title: 'RSC', searchable: true },
        { data: 'kota', title: 'Kota', searchable: true },
        { data: 'telpon1', title: 'Telp', searchable: true },
        { data: 'deskripsiGroup', title: 'Group', searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:grey; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: () => {
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
      order: [[9, 'asc']],
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
    localStorage.removeItem(LS_INV_SELECTED_BRANCH);

    this.g.changeTitle(
      this.translation.instant('Master') +
        ' ' +
        this.translation.instant('Cabang') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant(BUTTON_CAPTION_VIEW);
    this.buttonCaptionEdit = this.translation.instant(BUTTON_CAPTION_EDIT);

    this.dataService
      .postData(this.g.urlServer + '/api/branch/dropdown-tipe-cabang', {})
      .subscribe((resp: any) => {
        this.listCabang = resp.map((item: any) => ({
          id: item.TIPE_CABANG,
          name: item.TIPE_CABANG,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.listRsc = resp.map((item: any) => ({
          id: item.KODE_RSC,
          name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.listKota = resp.map((item: any) => ({
          id: item.KODE_KOTA,
          name: item.KODE_KOTA + ' - ' + item.KETERANGAN_KOTA,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/branch/dropdown-group', {})
      .subscribe((resp: any) => {
        this.listGroup = resp.map((item: any) => ({
          id: item.KODE_GROUP,
          name: item.KODE_GROUP + ' - ' + item.DESKRIPSI_GROUP,
        }));
      });

    this.configSelectStatus = {
      ...this.baseConfig,
      placeholder: 'Pilih Status',
      searchPlaceholder: 'Cari Status',
      limitTo: this.listStatus.length,
    };
    this.configSelectCabang = {
      ...this.baseConfig,
      placeholder: 'Pilih Cabang',
      searchPlaceholder: 'Cari Cabang',
      limitTo: this.listCabang.length,
    };
    this.configSelectRsc = {
      ...this.baseConfig,
      placeholder: 'Pilih RSC',
      searchPlaceholder: 'Cari RSC',
      limitTo: this.listRsc.length,
    };
    this.configSelectKota = {
      ...this.baseConfig,
      placeholder: 'Pilih Kota',
      searchPlaceholder: 'Cari Kota',
      limitTo: this.listKota.length,
    };
    this.configSelectGroup = {
      ...this.baseConfig,
      placeholder: 'Pilih Group',
      searchPlaceholder: 'Cari Group',
      limitTo: this.listGroup.length,
    };
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

  onTipeCabangFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onRscFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  onKotaFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onGroupFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
}
