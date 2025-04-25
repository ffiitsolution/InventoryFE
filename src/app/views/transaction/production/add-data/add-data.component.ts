import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import { ACTION_SELECT, CANCEL_STATUS, DEFAULT_DELAY_TABLE, LS_INV_SELECTED_DELIVERY_ORDER } from '../../../../../constants';
import moment from 'moment';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-production',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe]

})
export class AddProductionComponent implements OnInit, AfterViewInit, OnDestroy {
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
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  buttonCaptionPrint: String = 'Cetak';
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;

  @ViewChild('formModal') formModal: any;
  // Form data object


  constructor(
    private router: Router,
    private helperService: HelperService,
    private globalService: GlobalService,
    private translationService: TranslationService,
    private form: FormBuilder,
    private appService: AppService,
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
    this.bsConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        rangeInputFormat: 'dd/MMm/yyyy',
      }
    );


    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);

    this.myForm = this.form.group({
          kodeBarang: ['', [Validators.required]],
          namaBarang: ['', [Validators.required]],
          satuanHasilProduksi: ['', [Validators.required]],
          tglTransaksi: [this.defaultDate, [Validators.required]],
          jumlahHasilProduksi: ['', [Validators.required,Validators.min(1)]],
          keterangan: ['',[this.specialCharValidator]],
          tglExp:[this.defaultDate, [Validators.required]],
          totalHasilProduksi: ['', [Validators.required,Validators.min(1)]],
          labelSatuanHasilProduksi: [''],
          totalBahanBaku: [0],
          hargaSatuan: [0],
          satuanKecil:[''],
          satuanBesar:[''],
    });

    this.myForm.get('jumlahHasilProduksi')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {
      this.calculateTotalHasilProduksi();
    });

    this.myForm.get('satuanHasilProduksi')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {
      this.calculateTotalHasilProduksi();
    });

    this.renderDataTables()
   
  }

  onAddDetail() {
    console.log("Before:", this.myForm.value.tglTransaksi); // Lihat apakah sudah 21 atau masih 20
  console.log("Raw Moment:", moment(this.myForm.value.tglTransaksi)); 
  console.log("Formatted:", moment(this.myForm.value.tglTransaksi, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    this.myForm.patchValue({
      tglTransaksi: moment(this.myForm.value.tglTransaksi,'DD/MM/YYYY',true).format('DD/MM/YYYY'),
      tglExp: moment(this.myForm.value.tglExp, 'DD/MM/YYYY',true).format('DD/MM/YYYY')
  });
  
    this.globalService.saveLocalstorage(
      'headerProduction',
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
      'headerProduction',
    );
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();  
    
  }

  specialCharValidator(control: AbstractControl): ValidationErrors | null {
    const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
    const value = control.value;
    if (value && specialCharRegex.test(value)) {
      return { specialCharNotAllowed: true };
    }
    return null;
  }

  onPreviousPressed(): void {
    this.router.navigate(['/transaction/production/list-dt']);
  }

  onShowModal() {
    this.isShowModal = true;
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedRow = JSON.stringify(data);
    this.renderDataTables();
    this.isShowModal = false;
    this.mapOrderData(data);
  }

  renderDataTables(): void {
    this.dtOptions = {
      language:
        this.translationService.getCurrentLanguage() == 'id' ? this.translationService.idDatatable : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength:5,
      lengthMenu: [  // Provide page size options
        [8, 10],   // Available page sizes
        ['8', '10']  // Displayed page size labels
      ],
      drawCallback: (drawCallback) => {
        this.selectedRowData = undefined;
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const params = {
          ...dataTablesParameters,
          kodeGudang: this.globalService.getUserLocationCode(),
        };
        this.appService.getProductionProductList(params)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn dari data
              const { rn, ...rest } = item;
              const finalData = {
                ...rest,
                dtIndex: this.page.start + index + 1,
              };
              return finalData;
            });
            this.page.recordsTotal = resp.recordsTotal;
            this.page.recordsFiltered = resp.recordsFiltered;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: mappedData,
            });
          });
      },
      columns: [
        { data: 'kodeBarang', title: 'Kode' },
        { data: 'namaBarang', title: 'Nama Barang' },
        {
          data: 'konversi', title: 'Konversi',
          render: (data, type, row) => `${Number(data).toFixed(2)} ${row.satuanKecil}`
        },
        { data: 'satuanBesar', title: 'Satuan Besar', },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang', },
        {
          data: 'status',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'Aktif') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: () => {
            return `<button class="btn btn-sm action-select btn-info btn-80 text-white">Pilih</button>`;
          },
        },

      ],
      searchDelay: 1000,
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        if (index === 0 && !this.selectedRowData) {
          setTimeout(() => {
            $(row).trigger('td'); 
          }, 0);
        }
        $('td', row).on('click', () => {
          $('td').removeClass('bg-secondary bg-opacity-25 fw-semibold');
          if (this.selectedRowData !== data) {
            this.selectedRowData = data;
            $('td', row).addClass('bg-secondary bg-opacity-25 fw-semibold');
          } else {
            this.selectedRowData = undefined;
          }
        });
      
    
        return row;

      },
    };
  }

    private mapOrderData(data: any): void {
      this.myForm.patchValue({
        kodeBarang: data.kodeBarang,
        namaBarang: data.namaBarang,
        satuanHasilProduksi: parseFloat(data.konversi).toFixed(2),
        labelSatuanHasilProduksi: data.satuanKecil+"/"+data.satuanBesar,
        hargaSatuan: 0,
        satuanKecil: data.satuanKecil,
        satuanBesar: data.satuanBesar,
      })
     
    }

    calculateTotalHasilProduksi(): void {
      const jumlahHasilProduksi = this.myForm.get('jumlahHasilProduksi')?.value;
      const satuanHasilProduksi = this.myForm.get('satuanHasilProduksi')?.value;
  
      if (jumlahHasilProduksi && satuanHasilProduksi) {
        const totalHasilProduksi = jumlahHasilProduksi * satuanHasilProduksi;
        this.myForm.patchValue({
          totalHasilProduksi: totalHasilProduksi
        });
      }
    }

    onBatalPressed(newItem: any): void {
      const todayDate = new Date();
      this.defaultDate = this.helperService.formatDate(todayDate);
      this.myForm.reset({
        kodeBarang: '',
        namaBarang: '',
        satuanHasilProduksi: '',
        tglTransaksi: this.defaultDate,  // Assign default date to tglTransaksi
        jumlahHasilProduksi: '',
        keterangan: '',
        tglExp: this.defaultDate,  // Assign default date to tglExp
        totalHasilProduksi: '',
        labelSatuanHasilProduksi: '',
        totalBahanBaku: 0,
        hargaSatuan: 0,
        satuanKecil:'',
        satuanBesar:'',
      });
      this.isShowDetail = false;
      if(newItem) this.onShowModalPrint(newItem);
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

    onShowModalPrint(data: any) {
      this.paramGenerateReport = {
        noTransaksi: data.nomorTransaksi,
        userEntry: data.userCreate,
        jamEntry: this.globalService.transformTime(data.timeCreate),
        tglEntry: this.globalService.transformDate(data.dateCreate),
        outletBrand: 'KFC',
        kodeGudang: this.globalService.getUserLocationCode(),
        isDownloadCsv: false,
        reportName: 'cetak_production',
        confirmSelection: 'Ya',
      };
      this.isShowModalReport = true;
      // this.onBackPressed();
    }
    
    closeModal(){
      this.isShowModalReport = false;
      this.disabledPrintButton = false;
    }
}










