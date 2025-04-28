import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../model/page';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../constants';
import moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HelperService } from '../../../service/helper.service';
import { GlobalService } from '../../../service/global.service';
import { TranslationService } from '../../../service/translation.service';

@Component({
  selector: 'app-add-planning-order',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe]

})
export class AddPlanningOrderComponent implements OnInit, AfterViewInit, OnDestroy {
  nomorPesanan: any;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public dpConfigtrans: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  isShowModal: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  bsConfig: Partial<BsDatepickerConfig>;
  page = new Page();
  selectedRow: any = {};
  minDate: Date;
  maxDate: Date;
  isShowDetail: boolean = false;
  selectedRowData: any;
  defaultDate: any ;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  selectedMonth: any = 1;
  selectedYear: any = 2025;
  selectedLastDate: any = '';
  rangeBulan: any[] = [];
  rangeTahun: any[] = [];
  @ViewChild('formModal') formModal: any;
  // Form data object


  constructor(
    private router: Router,
    private helperService: HelperService,
    public globalService: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass='today-highlight';


    this.dpConfigtrans.containerClass = 'theme-red';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass='today-highlight';

  
  }

  myForm: FormGroup;

  ngOnInit(): void {
   
    const currentDate = moment();
    this.selectedMonth = currentDate.month() + 1;
    this.selectedYear = currentDate.year();

    this.myForm = this.form.group({
      bufferStock: ['0.00',[Validators.required,Validators.min(1)]],
      selectedMonth: [this.selectedMonth],
      selectedYear: [this.selectedYear],  
    });

    console.log(this.selectedMonth, this.selectedYear, 'selectedMonth selectedYear')
    this.rangeBulan = this.globalService.generateNumberRange(this.selectedMonth, 12);
    this.rangeTahun = this.globalService.generateNumberRange(
      this.selectedYear,
      this.selectedYear + 2
    );
   
  }

  ngDoCheck() {
    const current = this.globalService.statusPlanningOrder;
    if (current && !this.isShowDetail) {
     this.onAddDetail();
    }
  }

  onAddDetail() {
    this.myForm.patchValue({
      tglTransaksi: moment(this.myForm.value.tglTransaksi,'DD/MM/YYYY',true).format('DD/MM/YYYY'),
      tglExp: moment(this.myForm.value.tglExp, 'DD/MM/YYYY',true).format('DD/MM/YYYY')
  });
  
    this.globalService.saveLocalstorage(
      'headerPlanningOrder',
      JSON.stringify(this.myForm.value)
    );

    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return true
    // return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage(
      'headerPlanningOrder',
    );
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();  
    
  }


  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = JSON.stringify(data);
    this.isShowModal = false;
    this.mapOrderData(data);
  }


    private mapOrderData(data: any): void {
      this.myForm.patchValue({
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        satuanHasilProduksi: parseFloat(data.konversi).toFixed(2),
        labelSatuanHasilProduksi: data.satuanKecil+"/"+data.satuanBesar,
      })
     
    }

   

    onBatalPressed(newItem: any): void {
      const todayDate = new Date();
      this.defaultDate = this.helperService.formatDate(todayDate);
      this.myForm.reset({
        bufferStock: '0.00',
        selectedMonth: this.selectedMonth,
        selectedYear: this.selectedYear,  
      });
      this.isShowDetail = false;
    }

    addJumlahBahanBaku($event:any): void {
        this.myForm.patchValue({
          totalBahanBaku: $event  
        });
    }

    formatDate(date: string | Date): string {
      console.log(date,'date')
      if (typeof date === 'string') {
        return date;
      }else{
        return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
      }
    }

    onInputValue(
     event:any
    ) {

       
      let value=event.target.value;
        if (value !== null && value !== undefined) {
          let numericValue = parseFloat(value.toString().replace(',', '.'));
          if (isNaN(numericValue)) {
              numericValue = 0;
          }
          value =  Math.abs(numericValue).toFixed(2);
        } else {
          value = "0.00"; // Default if empty
        }

        this.myForm.get('bufferStock')?.setValue(value, { emitEvent: false });
    }

}










