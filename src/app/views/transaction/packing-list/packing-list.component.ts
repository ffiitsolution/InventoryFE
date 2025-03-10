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
  }

  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      pageLength: 5,
      lengthMenu: [5],
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getProsesDoBalik(callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      autoWidth: true,
      columns: [
        {
          data: null,
          title: 'Pilih Data',
          className: 'text-center',
          orderable: false,
          render: (data: any, type: any, row: any) => {
            return `<input type="checkbox" class="select-row action-select-data" data-id="${row.NO_SURAT_JALAN}">`;
          },
        },
        { data: 'NO_SURAT_JALAN', title: 'NO. Surat Jalan (D.O)' },
        {
          data: 'TGL_TRANSAKSI',
          title: 'Tanggal Kirim',
          render: (data, type, row) => this.g.transformDate(data),
        },
        {
          data: 'TGL_PESANAN',
          title: 'Tanggal Pesanan',
          render: (data, type, row) => this.g.transformDate(data),
        },
        { data: 'NOMOR_PESANAN', title: 'Nomor Pesanan' },
        { data: 'KODE_TUJUAN', title: 'Kode Tujuan' },
        { data: 'NAMA_TUJUAN', title: 'Keterangan Tujuan' },
        { data: 'KOTA_TUJUAN', title: 'Kota' },
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-posting', row).on('click', () =>
          this.actionBtnClick('POSTING', data)
        );
        $('.action-select-data', row).on('click', () =>
          this.actionBtnClick('SELECT_DATA', data)
        );
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

  actionBtnClick(action: string, data: any): void {
    if (action === ACTION_VIEW) {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      this.router.navigate([
        '/transaction/delivery-item/dobalik/detail-report-do-balik',
      ]);
      this;
    }
    if (action === 'POSTING') {
      this.g.saveLocalstorage(
        LS_INV_SELECTED_DELIVERY_ORDER,
        JSON.stringify(data)
      );
      const param = {
        kodeGudang: data.KODE_GUDANG,
        noSuratJalan: data.NO_SURAT_JALAN,
        userPosted: JSON.parse(localStorage.getItem('inv_currentUser') || '')
          .namaUser,
      };
      this.appService.updateDeliveryOrderPostingStatus(param).subscribe({
        next: (response) => {
          this.toastr.success('Berhasil Posting DO Balik');
          this.search();
        },
        error: (error) => {
          this.toastr.error('Gagal Posting DO Balik');
        },
      });
    }
    if (action === 'SELECT_DATA') {
      this.selectedRows.push(data);
    }
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

  getProsesDoBalik(callback: any): void {
    this.loading = true;

    // Format tanggal menjadi 'dd MM yyyy' sebelum dikirim ke backend
    const formattedStartDate = moment(this.startDate).format('DD MMM yyyy');
    const formattedEndDate = moment(this.endDate).format('DD MMM yyyy');

    const params = {
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
          let index = 0;
          dtIndex: this.page.start + index + 1;
          this.reportProposeData = response.packingList;
          this.reportProposeData.forEach((item) => {
            this.listNoDO.push({ noSuratJalan: item.NO_SURAT_JALAN });
          });

          this.totalLength = response.recordsTotal;
          callback({
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
            data: this.reportProposeData,
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
      this.toastr.error('Harap Pilih Data!', 'Peringatan');
      return;
    }

    this.g.saveLocalstorage('listNoDO', JSON.stringify(this.selectedRows));
    this.router.navigate(['/transaction/delivery-item/packing-list/entry-packing-list']);
  }
}