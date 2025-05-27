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
      .insert('/api/sync-data/count-gudang', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        startDate: this.startDate,
        endDate: this.endDate,
      })
      .subscribe({
        next: (res) => {
          if (res.error) {
            this.messages['getCountHq'] = res.error;
            console.log('getCountHq error: ' + res.error);
          } else {
            this.listHq = res.data ?? [];
            for (let i = 0; i < this.listHq.length; i++) {
              const item = this.listHq[i];
              this.dataHq[item.trx] = item.val ?? 0;
            }
          }
          this.loadings['getCountHq'] = false;
        },
        error: (err) => {
          console.log('getCountHq err: ' + err);
          this.loadings['getCountHq'] = false;
        },
      });
  }
}
