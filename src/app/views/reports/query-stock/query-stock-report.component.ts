import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { AppService } from '../../../service/app.service';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-query-stock-report',
  templateUrl: './query-stock-report.component.html',
  styleUrl: './query-stock-report.component.scss',
})
export class QueryStockReportComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  [key: string]: any;
  loadingState: { [key: string]: boolean } = {
    submit: false,
    selectedRegion: false,
    statusAktif: false,
    tipeListing: false,
  };
  isLoading: boolean = false;
  isLoadingDetail: boolean = false;
  isLoadingSubdetail: boolean = false;
  showModalDetail: boolean = false;
  userData: any;
  searchText: string = '';

  listData: any[] = [];
  listDataDetail: any[] = [];
  listDataSetnum1: any[] = [];
  listDataSubdetail: any[] = [];
  mapDataDetail: { [key: string]: any } = {};
  selectedItem: any;
  selectedDate: Date;
  selectedSetnum: any;

  currentPage = 1;

  totalDetailAwal: number = 0;
  totalDetailIn: number = 0;
  totalDetailOut: number = 0;
  totalSubdetailIn: number = 0;
  totalSubdetailOut: number = 0;

  constructor(
    private service: AppService,
    public g: GlobalService,
    private translation: TranslationService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.g.changeTitle(
      this.translation.instant('Query') +
        ' ' +
        this.translation.instant('Stock') +
        ' - ' +
        this.g.tabTitle
    );
    this.userData = this.service.getUserData();
    this.selectedDate = new Date();
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.getSetnum1();
    this.getStockMovement();
  }

  onChangePeriode(event: any): void {}

  getObjectKeys(obj: Object) {
    return Object.keys(obj);
  }

  getSetnum1() {
    this.service.insert('/api/setnum1', {}).subscribe({
      next: (res) => {
        this.listDataSetnum1 = res.data ?? [];
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getStockMovement() {
    this.isLoading = true;
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    this.service
      .insert('/api/stock-movement', {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        // lastYearEom: 2025,
        // lastMonthEom: 2,
        yearEom: year,
        monthEom: month,
      })
      .subscribe({
        next: (res) => {
          this.listData = res.data ?? [];
          this.isLoading = false;
        },
        error: (error) => {
          console.log(error);
          this.isLoading = false;
        },
      });
  }

  getStockDetail(item: any) {
    this.selectedItem = item;
    this.showModalDetail = false;
    this.showModalDetail = true;
    this.listDataDetail = [];
    this.isLoadingDetail = true;
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    this.mapDataDetail = {};
    this.totalDetailAwal = 0;
    this.totalDetailIn = 0;
    this.totalDetailOut = 0;
    this.service
      .insert('/api/stock-movement', {
        kodeGudang: this.userData.defaultLocation.kodeLocation,
        kodeBarang: this.selectedItem?.kodeBarang,
        yearEom: year,
        monthEom: month,
        isDetail: true,
      })
      .subscribe({
        next: (res) => {
          this.listDataDetail = res.data ?? [];
          this.listDataSetnum1.map((m) => {
            const l = this.getDetailsByTipeTransaksi(m.keyTransaksi);
            if (l && (l.tipeTransaksi == 0 || l.tipeTransaksi)) {
              this.mapDataDetail[m.keyTransaksi] = l;
            } else {
              this.mapDataDetail[m.keyTransaksi] = {
                saldoAwal: 0,
                totalQtyIn: 0,
                tipeTransaksi: m.keyTransaksi,
                totalQtyOut: 0,
              };
            }
          });
          this.listDataDetail.map((d) => {
            this.totalDetailAwal += d.saldoAwal ?? 0;
            this.totalDetailIn += d.totalQtyIn ?? 0;
            this.totalDetailOut += d.totalQtyOut ?? 0;
          });
          this.isLoadingDetail = false;
        },
        error: (error) => {
          console.log(error);
          this.isLoadingDetail = false;
        },
      });
  }

  getStockSubdetail(setnum: any, data: any) {
    if (
      data &&
      data.kodeBarang &&
      [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].includes(setnum.keyTransaksi)
    ) {
      this.selectedSetnum = setnum;
      this.listDataSubdetail = [];
      this.totalSubdetailIn = 0;
      this.totalSubdetailOut = 0;
      this.isLoadingSubdetail = true;
      const year = this.selectedDate.getFullYear();
      const month = this.selectedDate.getMonth() + 1;
      this.service
        .insert('/api/stock-movement/subdetail', {
          kodeGudang: this.userData.defaultLocation.kodeLocation,
          yearEom: year,
          monthEom: month,
          kodeBarang: data.kodeBarang,
          tipeTransaksi: data.tipeTransaksi,
        })
        .subscribe({
          next: (res) => {
            this.listDataSubdetail = res.data ?? [];
            this.listDataSubdetail.forEach((sub) => {
              this.totalSubdetailIn += sub.qtyIn;
              this.totalSubdetailOut += sub.qtyOut;
            });
            this.isLoadingSubdetail = false;
          },
          error: (error) => {
            console.log(error);
            this.isLoadingSubdetail = false;
          },
        });
    }
  }

  toggleModalDetail() {
    this.showModalDetail = !this.showModalDetail;
  }

  onChangeModalDetail(event: any) {
    this.showModalDetail = event;
  }

  getDetailsByTipeTransaksi(keyTransaksi: any): any {
    return this.listDataDetail.filter(
      (detail) => detail.tipeTransaksi === keyTransaksi
    )?.[0];
  }

  getPeriode() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1;
    return (month + '').padStart(2, '0') + '/' + year;
  }
}
