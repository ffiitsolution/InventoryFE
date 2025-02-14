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
  templateUrl: './dobalik.component.html',
  styleUrls: ['./dobalik.component.scss'],
})
export class DobalikComponent implements OnInit, AfterViewInit, OnDestroy {
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

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private config: AppConfig,
    private appService: AppService
  ) {
    this.minDate.setDate(this.minDate.getDate() - 7);
  }

  ngOnInit(): void {
    this.dtOptions = {
      paging: true,
      pageLength: 5,
      lengthMenu: [5],
      processing: true,
      ajax: 
      (dataTablesParameters: any, callback) => {
        this.getProsesDoBalik(callback);
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      scrollX: true,
      autoWidth: true,
      columns: [
        { data: 'KODE_GUDANG', title: 'Kode Gudang' },
        { data: 'STATUS_POSTING', title: 'Status Posting' },
        { data: 'TGL_TRANSAKSI', title: 'Tanggal Transaksi', render:(data) => this.g.transformDate(data)},
        { data: 'TIPE_TRANSAKSI', title: 'Tipe Transaksi' },
        { data: 'TGL_PESANAN', title: 'Tanggal Pesanan' , render:(data) => this.g.transformDate(data)},
        { data: 'NOMOR_PESANAN', title: 'Nomor Pesanan' },
        { data: 'NO_SURAT_JALAN', title: 'No Surat Jalan' },
        { data: 'KODE_TUJUAN', title: 'Kode Tujuan' },
        { data: 'STATUS_DO_BALIK', title: 'Status DO Balik' },
        {
          title: 'Opsi',
          className: 'text-center',
          render: () => {
            return `
              <div class="d-flex px-2 gap-2">
                <button style="width: 100px" class="btn btn-sm action-posting btn-outline-success btn-60 pe-1">Posting</button>
                <button style="width: 100px" class="btn btn-sm action-view btn-outline-info btn-60">Lihat</button>
              </div>
             `;
          },
        },
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-view', row).on('click', () =>
          this.actionBtnClick(ACTION_VIEW, data)
        );
        $('.action-posting', row).on('click', () =>
          this.actionBtnClick('POSTING', data)
        );
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
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  dtPageChange(event: any): void {}

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
      .postData(
        this.config.BASE_URL + '/delivery-order/proses-do-balik',
        params
      )
      .subscribe(
        (response: any) => {
          let index = 0;
          dtIndex: this.page.start + index + 1;
          this.reportProposeData = response.item;
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

  onAddPressed() {
    this.router.navigate(['/transaction/delivery-item/proses-do-balik']);
  }

  
  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
}
