import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  LS_INV_SELECTED_UOM,
} from '../../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '../../../model/page';
import { DataService } from '../../../service/data.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, Location } from '@angular/common';
import { AppService } from '../../../service/app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-check-data-sent-sync-data',
  templateUrl: './check-data-sent.component.html',
  styleUrl: './check-data-sent.component.scss',
})
export class CheckDataSentSyncDataComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  loadings: { [key: string]: boolean } = {};
  clicked: { [key: string]: boolean } = {};
  messages: { [key: string]: string } = {};
  columns: any;
  page: any;
  data: any;
  companyProfile: any = {};
  userData: any;
  selectedGudang!: string;
  selectedGudangName!: string;
  startDate!: string;
  endDate!: string;
  listGudang: any[] = [];
  listHq: any[] = [];
  dataGudang: { [key: string]: number } = {};
  dataHq: { [key: string]: number } = {};

  constructor(
    private service: AppService,
    private dataService: DataService,
    public g: GlobalService,
    private translation: TranslationService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Cek Data Gudang vs HQ') +
        ' - ' +
        this.g.tabTitle
    );
    this.userData = this.service.getUserData();

    this.route.queryParams.subscribe((params) => {
      this.selectedGudang = params['selectedGudang'];
      this.selectedGudangName = params['selectedGudangName'];
      this.startDate = params['startDate'];
      this.endDate = params['endDate'];
    });
    this.dataGudang = {
      adjdt: 0,
      adjhd: 0,
      bksdt: 0,
      bkshd: 0,
      expired: 0,
      expired_so: 0,
      hiseom: 0,
      hisso: 0,
      jbksdt: 0,
      jbkshd: 0,
      outdt: 0,
      outdtx: 0,
      outhd: 0,
      prddt: 0,
      prdhd: 0,
      rcvdt: 0,
      rcvhd: 0,
      rtcdt: 0,
      rtchd: 0,
      rtsdt: 0,
      rtshd: 0,
      sldawal: 0,
      sldexp: 0,
      sodt: 0,
      sohd: 0,
      tindt: 0,
      tinhd: 0,
      usagedt: 0,
      usagehd: 0,
      wstdt: 0,
      wsthd: 0,
    };
    this.dataHq = { ...this.dataGudang };
  }

  ngOnDestroy(): void {}

  capitalizeWords(str: string) {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngAfterViewInit(): void {
    if (
      this.selectedGudang &&
      this.selectedGudangName &&
      this.startDate &&
      this.endDate
    ) {
      this.getCountGudang();
      this.getCountHq();
    } else {
      this.goToPage('/sync-data/all');
    }
  }

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  goToPage(route: string) {
    this.router.navigate([route]);
  }

  getCountGudang() {
    this.loadings['getCountGudang'] = true;
    this.service
      .insert('/api/sync-data/count-gudang', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        startDate: this.startDate,
        endDate: this.endDate,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getCountGudang'] = res.error;
            console.log('getCountGudang error: ' + res.error);
          } else {
            this.listGudang = res.data ?? [];
            for (let i = 0; i < this.listGudang.length; i++) {
              const item = this.listGudang[i];
              this.dataGudang[item.trx] = item.val;
            }
          }
          this.loadings['getCountGudang'] = false;
        },
        error: (err) => {
          console.log('getCountGudang err: ' + err);
          this.loadings['getCountGudang'] = false;
        },
      });
  }

  getCountHq() {
    this.loadings['getCountHq'] = true;
    this.service
      .insert('/api/request-to-external', {
        endpoint: 'warehouse',
        url: '/api/sync-data/count-hq',
        method: 'POST',
        body: {
          kodeGudang: this.userData?.defaultLocation?.kodeLocation,
          startDate: this.startDate,
          endDate: this.endDate,
        },
      })
      .subscribe({
        next: (res) => {
          this.loadings['getCountHq'] = false;
          if (res.error) {
            this.messages['getCountHq'] = res.error;
            console.log('getCountHq error: ' + res.error);
          } else {
            const data = res.data ?? '';
            if (data) {
              this.listHq = data ?? [];
              for (let i = 0; i < this.listHq.length; i++) {
                const item = this.listHq[i];
                this.dataHq[item.trx] = item.val ?? 0;
              }
            } else {
              this.toastr.error(
                'Gagal mendapatkan data HQ',
                'Terjadi kesalahan!'
              );
            }
            this.clicked['btnKirimDataAll'] = false;
          }
        },
        error: (err) => {
          console.log('getCountHq err: ' + err);
          this.loadings['getCountHq'] = false;
          this.toastr.error('Gagal mendapatkan data HQ', 'Terjadi kesalahan!');
        },
      });
  }

  kirimDataAll() {
    this.clicked['btnKirimDataAll'] = true;
    const datetimeKirim = this.g.currentDate + ' ' + this.g.currentTime;
    this.toastr.info(
      'Proses berjalan dilatar belakang...',
      'Kirim data ' + this.g.currentDate + ' ke HQ'
    );

    this.service
      .insert('/api/sync-data/kirim-all', {
        userProses: this.userData.kodeUser,
        tanggalSync: this.g.currentDate ?? '',
      })
      .subscribe({
        next: (res) => {
          const data = res?.data || {};
          const entries = Object.entries(data)
            .filter(([key]) => key !== 'hisSync')
            .sort(([a], [b]) => a.localeCompare(b));

          const rows: string[] = [];

          entries.forEach(([key, value]: any) => {
            if (value?.error) {
              let errorMessage = value.error;
              if (errorMessage.includes('No data to send')) {
                errorMessage = 'No data';
              }
              rows.push(
                `<tr><td class="text-start">${key}</td><td><span class="badge bg-danger">${errorMessage}</span></td></tr>`
              );
            } else if (value?.success) {
              rows.push(
                `<tr><td class="text-start">${key}</td><td>
                <span class="badge bg-success fs-6">Dikirim: ${value.rowSent}</span>
                <br/>
                <span class="fs-8 d-none">Updated: ${value.updated} / ${value.updatedStatusSync}</span>
              </td></tr>`
              );
            }
          });

          let tableContent = '<p>Tidak ada data untuk dikirim.</p>';

          if (rows.length > 0) {
            const mid = Math.ceil(rows.length / 2);
            const leftRows = rows.slice(0, mid).join('');
            const rightRows = rows.slice(mid).join('');

            tableContent = `
              <div class="text-center mb-2">${datetimeKirim} | ${this.userData.defaultLocation?.kodeLocation} - ${this.userData.defaultLocation.keteranganLokasi}</div>
              <div class="row">
                <div class="col">
                  <table class="table table-bordered table-sm fs-8">
                    <thead><tr><th>TRANSAKSI</th><th>STATUS</th></tr></thead>
                    <tbody>${leftRows}</tbody>
                  </table>
                </div>
                <div class="col">
                  <table class="table table-bordered table-sm fs-8">
                    <thead><tr><th>TRANSAKSI</th><th>STATUS</th></tr></thead>
                    <tbody>${rightRows}</tbody>
                  </table>
                </div>
              </div>
            `;
          }

          Swal.fire({
            title: 'Hasil Kirim Data',
            html: tableContent,
            width: '60%',
            confirmButtonText: 'Tutup',
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim data.', 'error');
        },
      });
  }
}
