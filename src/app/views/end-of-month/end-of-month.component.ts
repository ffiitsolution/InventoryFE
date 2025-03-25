import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { GlobalService } from '../../service/global.service';
import moment from 'moment';
import { AppService } from '../../service/app.service';

@Component({
  templateUrl: 'end-of-month.component.html',
  styleUrls: ['end-of-month.component.scss'],
})
export class EndOfMonthComponent implements OnInit {
  constructor(private g: GlobalService, private service: AppService) {}
  userData: any = {};

  loading: boolean = false;
  loadingProcess: boolean = false;
  isShowModalProcess: boolean = false;

  currentView: string = 'closing';
  rangeBulan: any[] = [];
  rangeTahun: any[] = [];
  inputGudang: string = '00072 - GUDANG COMMISARY SENTUL BOGOR';
  lastYear: any = 2025;
  lastMonth: any = 1;
  lastDate: any = '31/01/2025';

  selectedMonth: any = 1;
  selectedYear: any = 2025;
  selectedLastDate: any = '31/01/2025';

  errorInModal: string = '';

  ngOnInit(): void {
    this.userData = this.service.getUserData();

    this.lastDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    )
      .endOf('month')
      .format('DD/MM/yyyy');

    const currentDate = moment();
    this.selectedMonth = currentDate.month() + 1;
    this.selectedYear = currentDate.year();
    this.onChangeMonthYear();

    this.rangeBulan = this.g.generateNumberRange(1, 12);
    this.rangeTahun = this.g.generateNumberRange(
      this.selectedYear,
      this.selectedYear + 10
    );

    this.getLastEndOfMonth();
  }

  setCurrentView(view: string) {
    this.currentView = view;
  }

  onChangeMonthYear() {
    this.errorInModal = '';
    this.selectedLastDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    )
      .endOf('month')
      .format('DD/MM/yyyy');
    const lastDate = moment(`${this.lastYear}-${this.lastMonth}`, 'YYYY-MM');
    const newDate = moment(
      `${this.selectedYear}-${this.selectedMonth}`,
      'YYYY-MM'
    );

    const isOlder = newDate.isBefore(lastDate);
    if (
      isOlder ||
      (this.lastMonth == this.selectedMonth &&
        this.lastYear == this.selectedYear)
    ) {
      this.errorInModal =
        'Periode Bulan-Tahun yg dipilih <br>harus setelah periode tutup bulan terakhir.';
    }
  }

  getLastEndOfMonth() {
    this.loading = true;
    this.service
      .insert('/api/end-of-month/last', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          const data = res.data ?? {};
          if (data.monthEom) {
            this.lastMonth = data.monthEom;
            this.lastYear = data.yearEom;

            this.lastDate = moment(
              `${this.lastYear}-${this.lastMonth}`,
              'YYYY-MM'
            )
              .endOf('month')
              .format('DD/MM/YYYY');
          }
        },
        error: (err) => {
          this.loading = false;
          console.log('err: ' + err);
        },
      });
  }

  confirmProcess() {
    this.isShowModalProcess = true;
  }

  processEndOfMonth() {
    this.loadingProcess = true;
    this.service
      .insert('/api/end-of-month/process', {
        kodeGudang: this.userData?.defaultLocation?.kodeLocation,
        yearEom: this.selectedYear,
        monthEom: this.selectedMonth,
      })
      .subscribe({
        next: (res) => {
          this.loadingProcess = false;
          const data = res.data ?? {};
          console.log(data);
        },
        error: (err) => {
          this.loadingProcess = false;
          console.log('err: ' + err);
        },
      });
  }
}
