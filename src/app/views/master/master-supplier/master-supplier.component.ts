import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_SUPPLIER,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-master-supplier',
  templateUrl: 'master-supplier.component.html',
  styleUrl: 'master-supplier.component.scss',
})
export class MasterSupplierComponent
  implements OnInit, OnDestroy, AfterViewInit
{
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
  isFilterShown: boolean = false;
  selectedStatusFilter: any = '';
  dtColumns: any = [];
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Ubah';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  cityOptions: any;
  selectedCityFilter: any = '';
  rscOptions: any = '';
  selectedRscFilter: any = '';
  selectedTerimaCnFilter: any = '';
  selectedStatusSyncFilter: any = '';
  selectedGudangFilter: any = '';
  gudangOptions: any;
  uomList: any;
  supplierList: any;
  defaultOrderGudangList: any;
  configSelectCity: any = {};
  configSelectRSC: any = {};
  roleId: any;
  hasCreate: any = false;
  hasUpdate: any = false;

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  onStatusFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }
  onCityFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }
  onRscFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }
  onGudangFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }
  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private service: AppService
  ) {
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      drawCallback: (drawCallback:any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback:any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const requestData = {
          ...dataTablesParameters,
          status: this.selectedStatusFilter,
          KODE_KOTA: Array.isArray(this.selectedCityFilter)
            ? ''
            : this.selectedCityFilter.id,
          KODE_RSC: Array.isArray(this.selectedRscFilter)
            ? ''
            : this.selectedRscFilter.id,
          DEFAULT_GUDANG: this.selectedGudangFilter,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/supplier/dt', requestData)
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
        {
          data: 'kodeSupplier',
          title: 'Kode Supplier',
          orderable: true,
          searchable: true,
        },
        {
          data: 'namaSupplier',
          title: 'Nama Supplier ',
          orderable: true,
          searchable: true,
        },
        {
          data: 'alamat1',
          title: 'Alamat' + ' 1',
          orderable: true,
          searchable: true,
        },
        {
          data: 'alamat2',
          title: 'Alamat' + ' 2',
          orderable: true,
          searchable: true,
        },
        { data: 'kota', title: 'Kota', orderable: true, searchable: true },
        {
          data: 'defaultGudang',
          title: 'Tipe Gudang',
          orderable: true,
          searchable: false,
        },
        { data: 'telpon1', title: 'Telpon', orderable: true, searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data:any) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
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
      order: [
        [7, 'asc'],
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

  ngOnInit(): void {
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
    this.g.changeTitle(
      this.translation.instant('Master') +
        ' ' +
        this.translation.instant('Suplier') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.buttonCaptionEdit = this.translation.instant('Ubah');
    localStorage.removeItem(LS_INV_SELECTED_SUPPLIER);

    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.cityOptions = resp.map((item: any) => ({
          id: item.KODE_KOTA,
          name: item.KODE_KOTA + ' - ' + item.KETERANGAN_KOTA,
        }));
        this.configSelectCity = {
          displayKey: 'name',
          search: true,
          height: '200px',
          customComparator: () => {},
          moreText: 'lebih banyak',
          noResultsFound: 'Tidak ada hasil',
          searchOnKey: 'name',
          placeholder: 'Pilih City',
          searchPlaceholder: 'Cari City',
          limitTo: this.cityOptions?.length,
        };
      });

    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.rscOptions = resp.map((item: any) => ({
          id: item.KODE_RSC,
          name: item.KETERANGAN_RSC,
        }));
        this.configSelectRSC = {
          displayKey: 'name',
          search: true,
          height: '200px',
          customComparator: () => {},
          moreText: 'lebih banyak',
          noResultsFound: 'Tidak ada hasil',
          searchOnKey: 'name',
          placeholder: 'Pilih RSC',
          searchPlaceholder: 'Cari RSC',
          limitTo: this.rscOptions.length,
        };
      });
    this.dataService
      .postData(this.g.urlServer + '/api/supplier/dropdown-gudang', {})
      .subscribe((resp: any) => {
        this.gudangOptions = resp.map((item: any) => ({
          value: item.DEFAULT_GUDANG,
          label: item.KETERANGAN_GUDANG,
        }));
      });
    this.hasCreate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master.master-supplier') &&
          p.permission.endsWith('.create')
      );
    this.hasUpdate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master.master-supplier') &&
          p.permission.endsWith('.update')
      );
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_SUPPLIER, JSON.stringify(data));
      this.router.navigate(['/master/master-supplier/detail']);
    } else if (action === ACTION_EDIT) {
      this.g.saveLocalstorage(LS_INV_SELECTED_SUPPLIER, JSON.stringify(data));
      this.router.navigate(['/master/master-supplier/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/master/master-supplier/add']);
    }
  }

  dtPageChange(event: any) {
    this.selectedRowData = undefined;
  }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }

  getUomList() {
    this.service.getUomList().subscribe((res: any) => {
      this.uomList = res;
    });
  }

  getSupplierList() {
    this.service.getSupplierList().subscribe((res: any) => {
      this.supplierList = res;
    });
  }

  getDefaultOrderGudangList() {
    this.service.getDefaultOrderGudangList().subscribe((res: any) => {
      this.defaultOrderGudangList = res.map((item: any) => ({
        cad1: item.cad1,
        kodeSingkat: item.kodeSingkat.substring(0, 3),
      }));
    });
  }
}
