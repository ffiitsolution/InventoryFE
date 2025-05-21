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
import Swal from 'sweetalert2';
import {
  ACTION_VIEW,
  DEFAULT_DATE_RANGE_RECEIVING_ORDER,
  DEFAULT_DELAY_TABLE,
  DEFAULT_DELAY_TIME,
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
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  page = new Page();
  adding: boolean = false;

  startDate: Date = new Date();
  endDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  loading: boolean = false;
  showFilterSection: boolean = false;
  reportProposeData: any[] = [];
  totalLength: number = 0;
  currentDate: Date = new Date();

  startDateFilter: Date = new Date(
    this.currentDate.setDate(
      this.currentDate.getDate() - DEFAULT_DATE_RANGE_RECEIVING_ORDER
    )
  );
  dateRangeFilter: any = [this.startDateFilter, new Date()];
  dataUser: any;
  protected config = AppConfig.settings.apiServer;
  selectedRowData: any;
  isShowModalPosting: boolean = false;

  constructor(
    private dataService: DataService,
    public g: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService
  ) {
    this.minDate.setDate(this.minDate.getDate() - 7);
    this.dpConfig.rangeInputFormat = 'DD/MM/YYYY';
    this.dpConfig.containerClass = 'theme-dark-blue';

    this.dtOptions = {
      paging: true,
      pageLength: 5,
      lengthMenu: [5],
      processing: true,
      serverSide: true,
      ajax: (dataTablesParameters: any, callback:any) => {
        setTimeout(() => this.getProsesDoBalik(dataTablesParameters, callback), DEFAULT_DELAY_TABLE);


        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
      },
      scrollX: true,
      autoWidth: true,
      columns: [
        { data: 'dtIndex', title: '#' },
        {
          data: 'tglTransaksi',
          title: 'Tanggal Kirim',
          render: (data:any) => this.g.transformDate(data),
        },
        {
          data: 'tglPesanan',
          title: 'Tanggal Pesanan',
          render: (data:any) => this.g.transformDate(data),
        },
        { data: 'nomorPesanan', title: 'Nomor Pesanan' },
        { data: 'noSuratJalan', title: 'No Surat Jalan' },
        { data: 'kodeTujuan', title: 'Kode Tujuan' },
        { data: 'namaCabang', title: 'Kode Tujuan' },
        {
          data: 'cetakSuratJalan',
          title: 'Status Cetak Surat Jalan',
          render: (data: string) => this.g.getStatusOrderLabel(data, true, true),
        },
        {
          data: 'statusDoBalik',
          title: 'Status DO Balik',
          render: (data: string) => this.g.getStatusOrderLabel(data, true, true),
        },
        {
          data: 'statusPosting',
          title: 'Status Transaksi',
          render: (data: string) => this.g.getStatusOrderLabel(data, false, true),
        },
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

        $('.action-posting', row).on('click', () => {
          this.actionBtnClick('POSTING', data)
        });

        return row;
      },
      order: [[4, 'desc']],
    };
  }

  getStatusPostingLegend(status: string): string {
    if (status === 'I') {
      return 'INTRANSIT';
    } else if (status === 'P') {
      return 'POSTED';
    } else {
      return 'UNKNOWN';
    }
  }

  getStatusDoBalikLegend(status: string): string {
    if (status === 'B') {
      return 'BARU';
    } else {
      return 'UNKNOWN';
    }
  }

  gettIipeTransaksiLabel(tipe: string): string {
    if (status === '3') {
      return 'SELESAI';
    } else {
      return 'SELESAI';
    }
  }

  ngOnInit(): void {

  }

  showPostingConfirmation(data: any) {
    // Menggunakan SweetAlert2 jika tersedia
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Pastikan Data Tersebut Yang Akan Di POSTING...!!!',
        text: 'Akan merubah status Intransit menjadi POSTED, dan mengurangi Stock Intransit...!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Posting',
        cancelButtonText: 'Tidak',
      }).then((result) => {
        if (result.isConfirmed) {
          this.actionBtnClick('POSTING', data);
        }
      });
    } else {
      // Alternatif jika SweetAlert tidak tersedia
      const confirmPost = window.confirm(
        'Pastikan Data Tersebut Yang Akan Di POSTING...!!!\n\nAkan merubah status Intransit menjadi POSTED, dan mengurangi Stock Intransit...!\n\nLanjutkan?'
      );
      if (confirmPost) {
        this.actionBtnClick('POSTING', data);
      }
    }
  }

  onShowModalPosting(data: any) {
    this.isShowModalPosting = true;
    this.selectedRowData = data
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
      if(data.cetakSuratJalan !== 'S'){
        this.toastr.warning( 'DO BALIK TIDAK DAPAT DIPROSES, SURAT JALAN BELUM DICETAK..!!'
        );
      } else if (data.cetakSuratJalan === 'S'){
        this.onShowModalPosting(data)
      }
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  dtPageChange(event: any): void { }

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }

  getProsesDoBalik(dataTablesParameters: any, callback: any): void {
    this.loading = true;

    // Format tanggal menjadi 'dd MM yyyy' sebelum dikirim ke backend
    const formattedStartDate = moment(this.startDate).format('DD MMM yyyy');
    const formattedEndDate = moment(this.endDate).format('DD MMM yyyy');

    const params = {
      ...dataTablesParameters,
      kodeGudang: this.g.getUserLocationCode(),
      statusPosting: 'I',
      startDate: moment(
        this.dateRangeFilter[0],
        'ddd MMM DD YYYY HH:mm:ss [GMT]Z'
      ).format('DD-MM-YYYY'), // Kirim dengan format 'dd MM yyyy'
      endDate: moment(
        this.dateRangeFilter[1],
        'ddd MMM DD YYYY HH:mm:ss [GMT]Z'
      ).format('DD-MM-YYYY'), // Jika perlu, bisa dikirim juga
    };

    this.dataService
      .postData(
        this.config.BASE_URL + '/api/delivery-order/proses-do-balik',
        params
      )
      .subscribe(
        (response: any) => {
          const mappedData = response.data.map((item: any, index: number) => {
            const { rn, ...rest } = item;
            return {
              ...item,
              dtIndex: this.page.start + index + 1,
              tglTransaksi: this.g.transformDate(item.tglTransaksi),
              tglPesanan: this.g.transformDate(item.tglPesanan),
            };
          });
          this.reportProposeData = response.data;
          this.totalLength = response.recordsTotal;
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

  onAddPressed() {
    this.router.navigate(['/transaction/delivery-item/proses-do-balik']);
  }

  onFilterPressed() {
    this.datatableElement?.dtInstance.then((dtInstance: any) => {
      dtInstance.ajax.reload();
    });
  }

  onProsesDoBalik(data: any) {
    this.adding = true;
    const param = {
      kodeGudang: data.kodeGudang,
      noSuratJalan: data.noSuratJalan,
      userPosted: JSON.parse(localStorage.getItem('inv_currentUser') || '')
        .namaUser,
      datePosted: this.g.getLocalDateTime(new Date()),
    };
    this.appService.updateDeliveryOrderPostingStatus(param).subscribe({
      next: (response) => {
        this.toastr.success('Berhasil Posting DO Balik');
        this.isShowModalPosting = false;
        this.search();
        this.adding = false;

      },
      error: (error) => {
        this.adding = false;
        this.toastr.error('Gagal Posting DO Balik');
      },
    });
  }
}
