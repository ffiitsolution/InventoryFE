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
  LS_INV_SELECTED_LOCATION,
} from '../../../../constants';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Page } from 'src/app/model/page';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master-location',
  templateUrl: 'master-location.component.html',
  styleUrl: 'master-location.component.scss',
})
export class MasterLocationComponent
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
  buttonCaptionView: String = 'Lihat';
  buttonCaptionEdit: String = 'Ubah';
  CONST_ACTION_ADD: string = ACTION_ADD;
  adding: boolean = false;
  cityOptions: any;
  rscOptions: any = '';
  selectedCityFilter: any = '';
  selectedRscFilter: any = '';
  configSelectCity: any = {};
  configSelectRSC: any = {};

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
          KODE_RSC: Array.isArray(this.selectedRscFilter)
            ? ''
            : this.selectedRscFilter.id,
          KODE_KOTA: Array.isArray(this.selectedCityFilter)
            ? ''
            : this.selectedCityFilter.id,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/location/dt', requestData)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
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
        {
          data: 'kodeLocation',
          title: 'Kode',
          orderable: true,
          searchable: true,
        },
        {
          data: 'kodeInisial',
          title: 'Inisial',
          orderable: true,
          searchable: true,
        },
        {
          data: 'keteranganLokasi',
          title: 'Keterangan',
          orderable: true,
          searchable: true,
        },
        {
          data: 'lokasiGudang',
          title: 'Kota',
          orderable: true,
          searchable: true,
        },
        {
          data: 'keteranganRsc',
          title: 'RSC',
          orderable: true,
          searchable: true,
        },
        {
          title: 'Opsi',
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
        this.translation.instant('Lokasi') +
        ' - ' +
        this.g.tabTitle
    );
    this.buttonCaptionView = this.translation.instant('Lihat');
    this.buttonCaptionEdit = this.translation.instant('Ubah');
    localStorage.removeItem(LS_INV_SELECTED_LOCATION);

    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.cityOptions = resp.map((item: any) => ({
          id: item.KETERANGAN_KOTA,
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
          name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
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
  }

  actionBtnClick(action: string, data: any = null) {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(LS_INV_SELECTED_LOCATION, JSON.stringify(data));
      this.router.navigate(['/master/master-location/detail']);
    } else if (action === ACTION_EDIT) {
      this.g.saveLocalstorage(LS_INV_SELECTED_LOCATION, JSON.stringify(data));
      this.router.navigate(['/master/master-location/edit']);
    } else if (action === ACTION_ADD) {
      this.router.navigate(['/master/master-location/add']);
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

  onCityFilterChange(): void {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onRscFilterChange(): void {
    this.datatableElement?.dtInstance?.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
}
