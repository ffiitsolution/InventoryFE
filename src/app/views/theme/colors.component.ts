import {
  AfterViewInit,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Page } from '../../model/page';
import { Subject } from 'rxjs';
import { DataService } from '../../service/data.service';
import { DataTableDirective } from 'angular-datatables';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: 'colors.component.html',
})
export class ColorsComponent implements OnInit, OnDestroy, AfterViewInit {
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

  constructor(
    private dataService: DataService,
    translate: TranslateService
  ) {
    translate.use(localStorage.getItem('inv_language') || 'id');
  }

  ngOnInit(): void {
    this.dtOptions = {
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
        this.dataService
          .postData(
            'http://172.16.9.80:8090/inventory/dt/master-branch',
            dataTablesParameters
          )
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
        { data: 'kodeCabang', title: 'Kode', searchable: false },
        { data: 'namaCabang', title: 'Nama', searchable: false },
        { data: 'tipeCabang', title: 'Tipe', searchable: false },
        { data: 'kota', title: 'Kota', searchable: false },
      ],
      searchDelay: 1500,
      order: [[1, 'asc']],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        const self = this;
        // Unbind first in order to avoid any duplicate handler
        $('td', row).off('click');
        $('td', row).on('click', () => {
          $('td').removeClass('bg-info');
          if (self.selectedRowData !== data) {
            self.selectedRowData = data;
            $('td', row).addClass('bg-info');
          } else {
            self.selectedRowData = undefined;
          }
        });
        return row;
      },
    };
    this.dtTrigger.next(1);
  }

  actionBtnClick(action: string) {
    let data = this.selectedRowData;
    alert(action + ': ' + data?.kodeUom)
    if (action === 'view') {
    } else if (action === 'add') {
    } else if (action === 'edit') {
    } else if (action === 'delete') {
    } else {
    }
  }

  dtPageChange(event: any) {
    console.log(event);
    this.selectedRowData = undefined;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {
  }
}

@Component({
  selector: 'app-theme-color',
  template: ``,
})
export class ThemeColorComponent implements OnInit {
  @Input() color = '';
  public colorClasses = {
    'theme-color w-75 rounded mb-3': true,
  };

  @HostBinding('style.display') display = 'contents';

  ngOnInit(): void {
    this.colorClasses = {
      ...this.colorClasses,
      [`bg-${this.color}`]: !!this.color,
    };
  }
}
