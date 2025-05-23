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
  LS_INV_SELECTED_PRODUCT,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-product',
  templateUrl: 'master-product.component.html',
  styleUrl: 'master-product.component.scss',
})
export class MasterProductComponent
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
  selectedBarangExpiredFilter: any = '';
  selectedGudangFilter: any = '';
  selectedSatuanMinOrderFilter: any = '';
  selectedLokasiBarangDiGudangFilter: any = '';
  dtColumns: any = [];
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Ubah';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  defaultOrderOptions: any = [];
  satuanMinOrderOptions: any = [];
  configSelectDefaultOrder: any = {};
  configSelectSatuanMinOrder: any = {};
  roleId: any;
  hasCreate: boolean = false;
  hasUpdate: boolean = false;

  toggleFilter(): void {
    this.isFilterShown = !this.isFilterShown;
  }

  onStatusFilterChange() {
    this.datatableElement?.dtInstance?.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private translation: TranslationService,
    private router: Router
  ) {
    this.g.navbarVisibility = false;
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
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
          DEFAULT_GUDANG: this.selectedGudangFilter.id
            ? this.selectedGudangFilter.id
            : '',
          SATUAN_MIN_ORDER: this.selectedSatuanMinOrderFilter.id
            ? this.selectedSatuanMinOrderFilter.id
            : '',
          LOKASI_BARANG_DI_GUDANG: this.selectedLokasiBarangDiGudangFilter,
          FLAG_EXPIRED: this.selectedBarangExpiredFilter,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/product/dt', requestData)
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
          data: 'kodeBarang',
          title: 'Kode',
          orderable: true,
          searchable: true,
          width: '45px',
        },
        {
          data: 'namaBarang',
          title: 'Nama',
          orderable: true,
          searchable: true,
        },
        {
          data: 'konversi',
          title: 'Konv.',
          searchable: false,
          render: (data:any) => {
            if (!isNaN(parseFloat(data)) && isFinite(data)) {
              return parseFloat(data).toFixed(2);
            }
            return data; // Return as is if not a number
          },
          width: '25px',
        },
        {
          data: 'satuanBesar',
          title: 'Satuan Besar',
          searchable: false,
          width: '25px',
        },
        {
          data: 'satuanKecil',
          title: 'Satuan Kecil',
          searchable: false,
          width: '25px',
        },
        { data: 'flagCom', title: 'COM', searchable: false, width: '5px' },
        { data: 'flagDry', title: 'DRY', searchable: false, width: '5px' },
        { data: 'flagPrd', title: 'PRD', searchable: false, width: '5px' },
        { data: 'flagMkt', title: 'MKT', searchable: false, width: '5px' },
        { data: 'flagCtr', title: 'CTR', searchable: false, width: '5px' },
        { data: 'flagHra', title: 'HRA', searchable: false, width: '5px' },
        { data: 'defaultGudang', title: 'Default Order', searchable: false },
        // {
        //   data: 'minStock',
        //   title: 'Min. Stock',
        //   searchable: false,
        //   render: (data:any) => {
        //     if (!isNaN(parseFloat(data)) && isFinite(data)) {
        //       return parseFloat(data).toFixed(2);
        //     }
        //     return data; // Return as is if not a number
        //   },
        //   width: '25px',
        // },
        // {
        //   data: 'maxStock',
        //   title: 'Max. Stock',
        //   searchable: false,
        //   render: (data:any) => {
        //     if (!isNaN(parseFloat(data)) && isFinite(data)) {
        //       return parseFloat(data).toFixed(2);
        //     }
        //     return data; // Return as is if not a number
        //   },
        //   width: '25px',
        // },
        {
          data: 'flagExpired',
          title: 'Flag Expired',
          searchable: false,
          render: (data:any) => {
            if (data == 'Y') {
              return 'Ya';
            } else if (data == 'T') {
              return 'Tidak';
            }
            return data; // Return as is if not a number
          },
          width: '25px',
        },
        // {
        //   data: 'flagBrgBekas',
        //   title: 'Flag Brg Bekas',
        //   searchable: false,
        //   render: (data:any) => {
        //     if (data == 'Y') {
        //       return 'Ya';
        //     }else if (data == 'T'){
        //       return 'Tidak'
        //     }
        //     return data; // Return as is if not a number
        //   },
        //   width: '25px',
        // },
        {
          data: 'flagResepProduksi',
          title: 'Flag Resep Produksi',
          searchable: false,
          render: (data:any) => {
            if (data == 'Y') {
              return 'Ya';
            } else if (data == 'T') {
              return 'Tidak';
            }
            return data; // Return as is if not a number
          },
          width: '25px',
        },
        // {
        //   data: 'others2',
        //   title: 'Beli Kgs ?',
        //   searchable: false,
        //   render: (data:any) => {
        //     if (data == 'Y') {
        //       return 'Ya';
        //     }else if (data == 'T'){
        //       return 'Tidak'
        //     }
        //     return data; // Return as is if not a number
        //   },
        //   width: '25px',
        // },
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
        [15, 'asc'],
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
    this.g.changeTitle(
      this.translation.instant('Master') +
        ' ' +
        this.translation.instant('Barang') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.buttonCaptionEdit = this.translation.instant('Ubah');
    localStorage.removeItem(LS_INV_SELECTED_PRODUCT);

    this.dataService
      .getData(this.g.urlServer + '/api/product/default-order-gudang')
      .subscribe((resp: any) => {
        this.defaultOrderOptions = resp.map((item: any) => ({
          id: item.kodeSingkat.substring(0, 3),
          name: item.kodeSingkat.substring(0, 3) + ' - ' + item.cad1,
        }));
      });

    this.dataService
      .getData(this.g.urlServer + '/api/uom/list')
      .subscribe((resp: any) => {
        this.satuanMinOrderOptions = resp.map((item: any) => ({
          id: item.kodeUom,
          name: item.kodeUom + ' - ' + item.keteranganUom,
        }));
      });

    this.configSelectDefaultOrder = {
      displayKey: 'name',
      search: true,
      height: '200px',
      customComparator: () => {},
      moreText: 'lebih banyak',
      noResultsFound: 'Tidak ada hasil',
      searchOnKey: 'name',
      placeholder: 'Pilih Gudang',
      searchPlaceholder: 'Cari Gudang',
      limitTo: this.defaultOrderOptions.length,
    };

    this.configSelectSatuanMinOrder = {
      displayKey: 'name',
      search: true,
      height: '200px',
      customComparator: () => {},
      moreText: 'lebih banyak',
      noResultsFound: 'Tidak ada hasil',
      searchOnKey: 'name',
      placeholder: 'Pilih Satuan',
      searchPlaceholder: 'Cari Satuan',
      limitTo: this.satuanMinOrderOptions.length,
    };
    this.hasCreate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master_master-product') &&
          p.permission.endsWith('_create')
      );
    this.hasUpdate = this.g
      .getLocalstorage('inv_permissions')
      ?.some(
        (p: any) =>
          p.app === 'MODULE' &&
          p.permission.startsWith('master_master-product') &&
          p.permission.endsWith('_update')
      );
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_PRODUCT, JSON.stringify(data));
      this.router.navigate(['/master/master-product/detail']);
    } else if (action === ACTION_EDIT) {
      this.g.saveLocalstorage(LS_INV_SELECTED_PRODUCT, JSON.stringify(data));
      this.router.navigate(['/master/master-product/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/master/master-product/add']);
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
    this.g.navbarVisibility = true;
  }

  ngAfterViewInit(): void {
    this.rerenderDatatable();
  }
}
