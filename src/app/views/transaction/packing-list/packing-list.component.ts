import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import {
  ACTION_VIEW,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../constants';
import { AppService } from '../../../service/app.service';
import { Page } from '../../../model/page';

@Component({
  selector: 'app-dobalik',
  templateUrl: './packing-list.component.html',
  styleUrls: ['./packing-list.component.scss'],
})
export class PackagingListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) datatableElement:
    | DataTableDirective
    | undefined;

  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  page = new Page();

  startDate: Date = new Date();
  endDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  loading: boolean = false;
  showFilterSection: boolean = false;
  reportProposeData: any[] = [];
  totalLength: number = 0;

  dateRangeFilter: any = [new Date(), new Date()];
  dataUser: any;
  listNoDO: { noSuratJalan: any }[] = [];
  selectedRows: any[] = [];
  protected config = AppConfig.settings.apiServer;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService,
  ) {
    this.minDate.setDate(this.minDate.getDate() - 7);
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
    this.dpConfig.containerClass = 'theme-dark-blue';
  }

  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      pageLength: 10,
      processing: true,
      lengthMenu: [5, 10, 25, 50, 100],
      ordering: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getProsesDoBalik(dataTablesParameters, callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      autoWidth: true,
      serverSide: true,
      columns: [
        { data: 'dtIndex', title: '#' },
        {
          title: 'Pilih Data',
          className: 'text-center',
          orderable: false,
          render: (data: any, type: any, row: any) => {
            let isChecked = this.selectedRows.some(item => item.noSuratJalan === row.noSuratJalan) ? 'checked' : '';
            return `<input type="checkbox" class="select-row action-select-data" data-id="${row.noSuratJalan}" ${isChecked}>`;
          },
        },
        { data: 'noSuratJalan', title: 'No. Surat Jalan (D.O)' },
        {
          data: 'tglTransaksi',
          title: 'Tanggal Kirim',
          render: (data, type, row) => this.g.transformDate(data),
        },
        {
          data: 'tglPesanan',
          title: 'Tanggal Pesanan',
          render: (data, type, row) => this.g.transformDate(data),
        },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        { data: 'kodeTujuan', title: 'Kode Tujuan' },
        { data: 'namaTujuan', title: 'Keterangan Tujuan' },
        { data: 'kotaTujuan', title: 'Kota' },
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $(row).find('.select-row').off('change').on('change', (event: JQuery.ChangeEvent<HTMLElement>) => {
          this.handleCheckboxChange(event, data);
        });
        $('td', row).on('click', (event) => {
          const checkbox = $(row).find('.select-row');
          const index = this.selectedRows.findIndex(item => item === data);

          if (index === -1) {
            this.selectedRows.push(data);
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', true);
          } else {
            this.selectedRows.splice(index, 1);
            $('td', row).css({ 'background-color': '' }).removeClass('bg-secondary bg-opacity-25 fw-semibold');
            checkbox.prop('checked', false);
          }
          if ($(event.target).is('.select-row')) {
            event.stopPropagation();
          }
        });


        return row;
      },
      order: [[2, 'desc']],
    };

  }

  handleCheckboxChange(event: JQuery.ChangeEvent<HTMLElement>, data: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log("isChecked",isChecked)
    if (isChecked) {
        // Add kodeBarang if checked
        if (! this.selectedRows.some(item => item.noSuratJalan === data.noSuratJalan)) {
            this.selectedRows.push(data);
        }
    } else {
        // Remove noSuratJalan if unchecked
        this.selectedRows = this.selectedRows.filter(item => item.noSuratJalan !== data.kodeBarang);
        console.log("this.selectedRows else",this.selectedRows)
    }
    console.log("selectedRows",this.selectedRows)
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);

    $('#select-all').on('click', function () {
      const rows = $('#datatable').DataTable().rows({ search: 'applied' }).nodes();
      $('input[type="checkbox"]', rows).prop('checked', (this as HTMLInputElement).checked);
    });

    $('#datatable tbody').on('change', 'input[type="checkbox"]', function () {
      if (!this.checked) {
        const el = $('#select-all').get(0);
        if (el && (el as HTMLInputElement).checked && ('indeterminate' in el)) {
          el.indeterminate = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  dtPageChange(event: any): void { }

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  getProsesDoBalik(dataTablesParameters: any,callback: any): void {
    this.loading = true;

    // Format tanggal menjadi 'dd MM yyyy' sebelum dikirim ke backend
    const formattedStartDate = moment(this.startDate).format('DD MMM yyyy');
    const formattedEndDate = moment(this.endDate).format('DD MMM yyyy');

    const params = {
      ...dataTablesParameters,
      kodeGudang: this.g.getUserLocationCode(),
      statusPosting: 'I',
      fromDate: moment(
        this.dateRangeFilter[0],
        'ddd MMM DD YYYY HH:mm:ss [GMT]Z'
      ).format('DD-MM-YYYY'), // Kirim dengan format 'dd MM yyyy'
      toDate: moment(
        this.dateRangeFilter[1],
        'ddd MMM DD YYYY HH:mm:ss [GMT]Z'
      ).format('DD-MM-YYYY'), // Jika perlu, bisa dikirim juga
    };

    console.log('Mengirim data ke backend:', params);

    this.dataService
      .postData(this.config.BASE_URL + '/api/delivery-order/packing-list', params)
      .subscribe(
        (response: any) => {
          const mappedData = response.data.map((item: any, index: number) => {
            const { rn, ...rest } = item;
            const finalData = {
              ...rest,
              dtIndex: this.page.start + index + 1,
            };
            return finalData;
          })
          this.reportProposeData = response.data;
          this.reportProposeData.forEach((item) => {
            this.listNoDO.push({ noSuratJalan: item.noSuratJalan });
          });

          this.totalLength = response.recordsTotal;
          this.page.recordsTotal = response.recordsTotal;
          this.page.recordsFiltered = response.recordsFiltered;
          this.showFilterSection = false;
          callback({
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
            data: mappedData,
          });
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  toggleFilter() {
    this.showFilterSection = !this.showFilterSection;
  }

  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  navigateToDeliveryItem(): void {
    this.router.navigate(['/transaction/delivery-item/add-data']);
  }
  navigateToEntryPackingList(): void {

    if (!this.selectedRows || this.selectedRows.length === 0) {
      this.toastr.warning('Harap Pilih Data!', 'Peringatan');
      return;
    }

    this.g.saveLocalstorage('listNoDO', JSON.stringify(this.selectedRows));
    this.router.navigate(['/transaction/delivery-item/packing-list/entry-packing-list']);
  }
}