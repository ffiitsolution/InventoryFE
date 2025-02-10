import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { AppService } from '../../../service/app.service';
import { DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../constants';

@Component({
  selector: 'app-detail-report-do-balik',
  templateUrl: './detail-report-do-balik.component.html',
  styleUrls: ['./detail-report-do-balik.component.scss'],
})
export class DetailReportDoBalikComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective | undefined;
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
    selectedOrder: any = JSON.parse(
      localStorage[LS_INV_SELECTED_DELIVERY_ORDER]
    );
  detailDoBalikData: any[] = [];
  loading: boolean = false;
  updatingStatus: boolean = false;

  disabledCancelButton: boolean = false;
  RejectingOrder: boolean = false;
  totalLength: number = 0;

  constructor(
    private dataService: DataService,
    private g: GlobalService,
    private router: Router,
    private toastr: ToastrService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    // Ambil data order yang dipilih dari localStorage
    this.selectedOrder = JSON.parse(this.selectedOrder);

    // Konfigurasi DataTables
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getDetailDoBalik(callback);
        // setTimeout(() => {
        //   this.page.start = dataTablesParameters.start;
        //   this.page.length = dataTablesParameters.length;
        // }DEFAULT_DELAY_TABLE)
      },
      columns: [
        { data: 'kode_gudang', title: 'Kode Gudang' },
        { data: 'nomor_pesanan', title: 'Nomor Pesanan' },
        { data: 'kode_barang', title: 'Kode Barang' },
        { data: 'satuan_kecil', title: 'Satuan' },
      ],
      order: [[1, 'asc']],
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  search(): void {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  onPrint(): void {

    console.log('Print button clicked');
  
  }

  onButtonActionPressed(field:any): void{

  }

  dtPageChange(event: any): void {
    console.log('Page changed', event);
  }
  
  getDetailDoBalik(callback: any): void {
    this.loading = true;

    const params = {
      kodeGudang: this.selectedOrder.kodeGudang,
      nomorPesanan: this.selectedOrder.nomorPesanan,
      tipeTransaksi: this.selectedOrder.tipeTransaksi,
      noSuratJalan: this.selectedOrder.noSuratJalan,
    };

    console.log("Mengirim data ke backend:", params);

    this.appService.getDetailDoBlik(params).subscribe(
      (response: any) => {
        this.detailDoBalikData = response.map((item: any) => ({
          kode_gudang: item.KODE_GUDANG,
          nomor_pesanan: item.NOMOR_PESANAN,
          kode_barang: item.KODE_BARANG,
          satuan_kecil: item.SATUAN_KECIL,
        }));

        callback({
          recordsTotal: response.length,
          recordsFiltered: response.length,
          data: this.detailDoBalikData,
        });

        this.loading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.loading = false;
      }
    );
  }

  onBackPressed(): void {
    this.router.navigate(['/delivery-item/dobalik']);
  }

  onDelete(): void {
    Swal.fire({
      title: 'Konfirmasi Pembatalan',
      text: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Batalkan',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updatingStatus = true;
        const params = {
          status: '4',
          user: this.g.getUserCode(),
          nomorPesanan: this.selectedOrder.nomorPesanan,
        };

        this.dataService.postData('/api/delivery-order/proses-do-balik', params).subscribe(
          (response: any) => {
            if (response.success) {
              this.toastr.success('Pesanan berhasil dibatalkan');
              this.router.navigate(['/order/receiving-order']);
            } else {
              this.toastr.error(response.message);
            }
            this.updatingStatus = false;
          },
          (error) => {
            this.toastr.error('Gagal membatalkan pesanan');
            this.updatingStatus = false;
          }
        );
      }
    });
  }

    formatStrDate(date: any) {
      return moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");
    }
}
