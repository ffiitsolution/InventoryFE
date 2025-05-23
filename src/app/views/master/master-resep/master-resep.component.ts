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
  LS_INV_SELECTED_RESEP,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-resep',
  templateUrl: 'master-resep.component.html',
  styleUrl: 'master-resep.component.scss',
})
export class MasterResepComponent
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
  selectedGudangFilter: any = '';
  selectedSatuanMinOrderFilter: any = '';
  selectedLokasiBarangDiGudangFilter: any = '';
  dtColumns: any = [];
  buttonCaptionAction: String = 'Resep';
  buttonCaptionEdit: String = 'Ubah';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  defaultOrderOptions: any = [];
  satuanMinOrderOptions: any = [];
  configSelectDefaultOrder: any = {};
  configSelectSatuanMinOrder: any = {};
  roleId: any;

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
    this.roleId = this.g.getLocalstorage('inv_currentUser')?.roleId;
    this.dtOptions = {
      language:
        translation.getCurrentLanguage() == 'id' ? translation.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      order: [[8,'asc'],[1,'asc']],
      drawCallback: (drawCallback:any) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback:any) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const requestData = {
          ...dataTablesParameters,
          STATUS: this.selectedStatusFilter,
          DEFAULT_GUDANG: this.selectedGudangFilter.id
            ? this.selectedGudangFilter.id
            : '',
          SATUAN_MIN_ORDER: this.selectedSatuanMinOrderFilter.id
            ? this.selectedSatuanMinOrderFilter.id
            : '',
          LOKASI_BARANG_DI_GUDANG: this.selectedLokasiBarangDiGudangFilter,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/resep/dt', requestData)
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
          width: '80px'
        },
        {
          data: 'namaBarang',
          title: 'Nama',
          orderable: true,
          searchable: true,
        },
        {
          data: 'defaultGudang',
          title: 'Default Gudang',
          searchable: false,
          width:'30px'
        },
        {
          data: 'konversi',
          title: 'Konversi',
          searchable: false,
          width:'50px',
          render: (data:any) => {
            if (!isNaN(parseFloat(data)) && isFinite(data)) {
              return parseFloat(data).toFixed(2);
            }
            return data; // Return as is if not a number
          },
        },
        {
          data: 'satuanBesar',
          title: 'Satuan Besar',
          searchable: false ,
          width:'30px'
        },
        {
          data: 'satuanKecil',
          title: 'Satuan Kecil',
          searchable: false,
           width:'30px'
        },
        {
          data: 'jumlahBahanBaku',
          title: 'Jumlah Resep',
          orderable: false,
          searchable: false,
          width:'30px'
        },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          width:'30px',
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
            if (this.roleId !== '3' && this.roleId !== '2') {
              return `
              <div class="btn-group" role="group" aria-label="Action">
                <button
                  class="btn btn-sm action-resep btn-outline-info btn-60"
                 ">
                  ${this.buttonCaptionAction}
                </button>
              </div>
            `;

            }
            return `
            <div class="btn-group" role="group" aria-label="Action">
              <button
                class="btn btn-sm action-resep btn-outline-info btn-60"
               ">
                ${this.buttonCaptionAction}
              </button>
            </div>
          `;

          },
        },
      ],
      searchDelay: 1500,

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-resep', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
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
    this.buttonCaptionAction = this.translation.instant('Resep');
    localStorage.removeItem(LS_INV_SELECTED_RESEP);

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
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_RESEP, JSON.stringify(data));
      this.router.navigate(['/master/master-resep/detail']);
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
}
