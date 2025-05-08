import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';
import { TranslationService } from '../../../../service/translation.service';
import { skip, Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AppService } from '../../../../service/app.service';
import {
  ACTION_SELECT,
  CANCEL_STATUS,
  DEFAULT_DELAY_TABLE,
  LS_INV_SELECTED_DELIVERY_ORDER,
} from '../../../../../constants';
import moment from 'moment';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-production',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.scss'],
  providers: [DatePipe],
})
export class AddProductionComponent
  implements OnInit, AfterViewInit, OnDestroy
{
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
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  paramGenerateReport = {};
  isShowModalReport: boolean = false;
  buttonCaptionPrint: String = 'Cetak';
  alreadyPrint: boolean = false;
  disabledPrintButton: boolean = false;
  headerMpcsProduksi: any ={};
  listProductData: any[] = [
    {
      bahanBaku: '',
      namaBarang: '',
      konversi: '',
      satuanKecil: '',
      satuanBesar: '',
      qtyWasteBesar: '',
      qtyWasteKecil: '',
      isConfirmed: false,
      tipeProduksi: 'R',
    },
  ];
  listExpiredData: any[] = [];
  isUpdate: boolean = false;
  isFirstChange = true;
  @ViewChild('formModal') formModal: any;
  // Form data object
  @Output() formDataChange = new EventEmitter<any>();
  formData: any = {};
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
    this.dpConfig.customTodayClass = 'today-highlight';

    this.dpConfigtrans.containerClass = 'theme-red';
    this.dpConfigtrans.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfigtrans.adaptivePosition = true;
    this.dpConfigtrans.maxDate = new Date();
    this.dpConfigtrans.customTodayClass = 'today-highlight';
  }

  myForm: FormGroup;

  ngOnInit(): void {
    this.headerMpcsProduksi= this.globalService.getLocalstorage('headerMpcsProduksi');
    if(this.headerMpcsProduksi){
      this.headerMpcsProduksi = JSON.parse(this.headerMpcsProduksi)
    }

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
      jumlahHasilProduksi: ['', [Validators.required, Validators.min(1)]],
      keterangan: ['', [this.specialCharValidator]],
      tglExp: [this.defaultDate, [Validators.required]],
      totalHasilProduksi: ['', [Validators.required, Validators.min(1)]],
      labelSatuanHasilProduksi: [''],
      totalBahanBaku: [0],
      hargaSatuan: [0],
      satuanKecil: [''],
      satuanBesar: [''],
      nomorTransaksi: [''],
    });
    this.myForm.get('kodeBarang')?.disable();
    this.myForm.get('namaBarang')?.disable();
    this.myForm.get('satuanHasilProduksi')?.disable();
    this.myForm.get('totalHasilProduksi')?.disable();
    this.myForm.get('totalBahanBaku')?.disable();
   

    this.myForm
      .get('jumlahHasilProduksi')
      ?.valueChanges.pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        if (this.headerMpcsProduksi?.nomorTransaksi && this.isFirstChange) {
          this.isFirstChange = false; // skip only the first call
          return; // skip execution
        }else{
          this.calculateTotalHasilProduksi();
    
          if (this.headerMpcsProduksi.nomorTransaksi) {
            this.refreshBahanBaku();
          }
        }
    
       
      });

    this.myForm
      .get('satuanHasilProduksi')
      ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.calculateTotalHasilProduksi();
      });

    if (this.headerMpcsProduksi?.nomorTransaksi) {
      this.isUpdate = true;
      this.loadDetailData();
      this.updateFormData();

      this.myForm.valueChanges.subscribe(() => this.updateFormData());
      this.myForm.statusChanges.subscribe(() => this.updateFormData())
      
    }
    this.renderDataTables();
  }

  onAddDetail() {
    this.myForm.get('kodeBarang')?.enable();
    this.myForm.get('namaBarang')?.enable();
    this.myForm.get('satuanHasilProduksi')?.enable();
    this.myForm.get('totalHasilProduksi')?.enable();

    this.myForm.patchValue({
      tglTransaksi: moment(
        this.myForm.value.tglTransaksi,
        'DD/MM/YYYY',
        true
      ).format('DD/MM/YYYY'),
      tglExp: moment(this.myForm.value.tglExp, 'DD/MM/YYYY', true).format(
        'DD/MM/YYYY'
      ),
    });

    console.log( JSON.stringify(this.myForm.value), 'form value');
    this.globalService.saveLocalstorage(
      'headerProduction',
      JSON.stringify(this.myForm.value)
    );

    this.myForm.get('kodeBarang')?.disable();
    this.myForm.get('namaBarang')?.disable();
    this.myForm.get('satuanHasilProduksi')?.disable();
    this.myForm.get('totalHasilProduksi')?.disable();
    this.myForm.get('jumlahHasilProduksi')?.disable();
    this.myForm.get('keterangan')?.disable();
    this.myForm.get('tglExp')?.disable();
    this.myForm.get('tglTransaksi')?.disable();

    this.isShowDetail = true;
  }

  get isFormInvalid(): boolean {
    return true;
    // return Object.values(this.formData).some(value => value === '');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.globalService.removeLocalstorage('headerProduction');
    this.globalService.removeLocalstorage('headerMpcsProduksi');
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
    if(this.isUpdate){
      this.router.navigate(['/transaction/production/list-dt-for-posting']);
    }else{
      this.router.navigate(['/transaction/production/list-dt']);
    }
   
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
        this.translationService.getCurrentLanguage() == 'id'
          ? this.translationService.idDatatable
          : {},
      processing: true,
      serverSide: true,
      autoWidth: true,
      info: true,
      pageLength: 5,
      lengthMenu: [
        // Provide page size options
        [8, 10], // Available page sizes
        ['8', '10'], // Displayed page size labels
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
        this.appService
          .getProductionProductList(params)
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
          data: 'konversi',
          title: 'Konversi',
          render: (data, type, row) =>
            `${Number(data).toFixed(2)} ${row.satuanKecil}`,
        },
        { data: 'satuanBesar', title: 'Satuan Besar' },
        { data: 'satuanKecil', title: 'Satuan Kecil' },
        { data: 'defaultGudang', title: 'Default Gudang' },
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
      labelSatuanHasilProduksi: data.satuanKecil + '/' + data.satuanBesar,
      hargaSatuan: 0,
      satuanKecil: data.satuanKecil,
      satuanBesar: data.satuanBesar,
    });
  }

  calculateTotalHasilProduksi(): void {
    const jumlahHasilProduksi = this.myForm.get('jumlahHasilProduksi')?.value;
    const satuanHasilProduksi = this.myForm.get('satuanHasilProduksi')?.value;

    if (jumlahHasilProduksi && satuanHasilProduksi) {
      const totalHasilProduksi = jumlahHasilProduksi * satuanHasilProduksi;
      this.myForm.patchValue({
        totalHasilProduksi: totalHasilProduksi,
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
      tglTransaksi: this.defaultDate, // Assign default date to tglTransaksi
      jumlahHasilProduksi: '',
      keterangan: '',
      tglExp: this.defaultDate, // Assign default date to tglExp
      totalHasilProduksi: '',
      labelSatuanHasilProduksi: '',
      totalBahanBaku: 0,
      hargaSatuan: 0,
      satuanKecil: '',
      satuanBesar: '',
    });

    this.myForm.get('jumlahHasilProduksi')?.enable();
    this.myForm.get('keterangan')?.enable();
    this.myForm.get('tglExp')?.enable();
    this.myForm.get('tglTransaksi')?.enable();
    this.isShowDetail = false;
    if (newItem) this.onShowModalPrint(newItem);
  }

  addJumlahBahanBaku($event: any): void {
    this.myForm.patchValue({
      totalBahanBaku: $event,
    });
  }

  formatDate(date: string | Date): string {
    console.log(date, 'date');
    if (typeof date === 'string') {
      return date;
    } else {
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

  closeModal() {
    this.isShowModalReport = false;
    this.disabledPrintButton = false;
  }

  refreshBahanBaku() {
    this.isShowDetail = true;
    // this.myForm.get('jumlahHasilProduksi')?.disable();
    // this.myForm.get('tglExp')?.disable();
    // this.myForm.get('keterangan')?.disable();
    let param = this.myForm.get('kodeBarang')?.value;

    this.appService.getBahanBakuByResep(param).subscribe({
      next: (res) => {
        this.listProductData = res.data.map((item: any) => {
          const jumlahHasil = this.myForm.get('jumlahHasilProduksi')?.value ?? 0;
          const totalQty = item.qtyPemakaian * jumlahHasil;
          const qtyPemakaianBesarRaw = Math.floor(totalQty / item.konversi);
          const qtyPemakaianBesar = qtyPemakaianBesarRaw.toFixed(2); // result: string (e.g. "40.00")
          const qtyPemakaianKecil = parseFloat(
            (totalQty - (qtyPemakaianBesarRaw * item.konversi)).toFixed(2)
          );
                  
          return {
            jumlahHasilProduksi: jumlahHasil,
            bahanBaku: item.bahanBaku,
            namaBarang: item.namaBarang,
            konversi: (item.konversi).toFixed(2),
            qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2), // You can leave this as string if needed
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            tipeProduksi: 'R',
            qtyPemakaianBesar: qtyPemakaianBesar,
            qtyPemakaianKecil: qtyPemakaianKecil,
            totalQtyPemakaian: totalQty.toFixed(2),
            isConfirmed: item.flagExpired === 'Y',
          };
        });
        

        this.myForm.patchValue({
          totalBahanBaku: this.listProductData.length,
        });

        
      },
    });
  }

    loadDetailData() {
    
     
      if(this.headerMpcsProduksi.statusPosting === 'P'){
          this.myForm.get('jumlahHasilProduksi')?.disable();
          this.myForm.get('tglExp')?.disable();
          this.myForm.get('keterangan')?.disable();
          this.isShowDetail = true;
      }
   
      this.myForm.get('kodeBarang')?.disable();
      let param = {
        nomorTransaksi: this.headerMpcsProduksi?.nomorTransaksi,
        kodeGudang: this.globalService.getUserLocationCode(),
      };
  
      this.appService.detailProductionAndExpired(param).subscribe({
        next: (res) => {
          this.isFirstChange =true;
          this.myForm.patchValue({
            kodeBarang: res.data.kodeResep,
            namaBarang: res.data.namaResep,
            satuanHasilProduksi: res.data.konversi,
            labelSatuanHasilProduksi:
              res.data.satuanKecil + '/' + res.data.satuanBesar,
            hargaSatuan: 0,
            satuanKecil: res.data.satuanKecil,
            satuanBesar: res.data.satuanBesar,
            jumlahHasilProduksi: res.data.jumlahResep,
            tglTransaksi: moment(res.data.tglTransaksi).format('DD/MM/YYYY'),
            tglExp: moment(res.data.tglExp).format('DD/MM/YYYY'),
            keterangan: res.data.keterangan,
            nomorTransaksi: res.data.nomorTransaksi,
          });

          console.log(res.data.nomorTransaksi, 'nomorTransaksi');
          this.calculateTotalHasilProduksi();
          this.listProductData = res.data.detail.map((item: any) => ({
            jumlahHasilProduksi: this.myForm.get('jumlahHasilProduksi')?.value,
            bahanBaku: item.kodeBarang,
            namaBarang: item.namaBarang,
            konversi:(item.konversi).toFixed(2),
            qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            tipeProduksi: 'R',
            qtyPemakaianBesar: parseFloat(item.qtyBesar).toFixed(2),
            qtyPemakaianKecil: parseFloat(item.qtyKecil).toFixed(2),
            totalQtyPemakaian: parseFloat(item.totalQty).toFixed(2),
            isConfirmed: item.flagExpired == 'Y' ? true : false,
          }));
          
          console.log(this.listProductData, 'data listProductData');
          this.listExpiredData = res.data.expired.map((item: any) => ({
            tglExpired: moment(item.tglExpired).toDate(),
            keteranganTanggal: moment(item.tglExpired)
              .locale('id')
              .format('DD MMM YYYY'),
            qtyPemakaianBesar: Math.abs(item.qtyBesar).toFixed(2),
            qtyPemakaianKecil: Math.abs(item.qtyKecil).toFixed(2),
            satuanKecil: item.satuanKecil,
            satuanBesar: item.satuanBesar,
            konversi: parseFloat(item.konversi).toFixed(2),
            totalQty: Math.abs(item.totalQty).toFixed(2),
            kodeBarang: item.kodeBarang,
            namaBarang: item.namaBarang,
            validationExpiredMessageList: '',
            validationQty: '',
          }));
  
          this.myForm.patchValue({
            totalBahanBaku: this.listProductData.length,
          });

          this.onAddDetail();
          this.myForm.get('jumlahHasilProduksi')?.enable();
          this.myForm.get('keterangan')?.enable();
          this.myForm.get('tglExp')?.enable();
        },
      });
    }

    private updateFormData(): void {
      this.formData = this.myForm.getRawValue();
    }
    // get formData() {
    //   return this.myForm.getRawValue(); // includes disabled fields
    // }
  }    
