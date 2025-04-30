import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../../service/app.service';
import { isEmpty } from 'lodash-es';
import { environment } from '../../../../../environments/environment';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../../../../service/translation.service';
import { GlobalService } from '../../../../service/global.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../../model/page';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HelperService } from '../../../../service/helper.service';

@Component({
  selector: 'app-mpcs-layout',
  templateUrl: './mpcs-layout.component.html',
  styleUrls: ['./mpcs-layout.component.scss'],
})
export class MpcsLayoutComponent implements OnInit {
  @ViewChild('usernameInput')
  usernameInput: ElementRef | undefined;

  @ViewChild('passwordInput')
  passwordInput: ElementRef | undefined;
  loadingSimpan: boolean = false;
  translate: string = 'id';
  redirectUrl: string = '';
  logingIn: boolean = false;
  searchingUsername: boolean = false;
  errorMessage: string = '';
  defaultGudang: string = '';
  subscription$: any;
  version: string = environment.VERSION;
  private usernameSubject = new Subject<string>(); // Subject untuk debounce
  passwordVisible: boolean = false;
  loadingUser: boolean = false;
  public dpConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  bsConfig: Partial<BsDatepickerConfig>;
  isShowRecipe: boolean = false;
  page = new Page();
  paramaters = {};
  listRecipeData : any = [];
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  searchText: string ='';
  draw:any =1;
  totalItems = 0;
  itemsPerPage = 15;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];
  listProductData: any = [];
  jumlahBahanbaku: number = 1;
  listEntryExpired: any[] = [];
  isShowDetail: boolean = false;

  constructor(
    translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService,
    private appService: AppService,
    private g: GlobalService,
    private router: Router,
    private el: ElementRef,
    private form: FormBuilder,
    private helperService: HelperService,
  ) {
    translate.use(g.getLocalstorage('inv_language') || 'id');
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass='today-highlight';
    this.dpConfig.isDisabled = true;
  
  }
  myForm: FormGroup;

  ngOnInit(): void {
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
        });
    
        this.myForm
          .get('jumlahHasilProduksi')
          ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.calculateTotalHasilProduksi();
          });
    
        this.myForm
          .get('satuanHasilProduksi')
          ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.calculateTotalHasilProduksi();
          });

    this.getDataRecipe();
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

  showRecipe(){
    console.log('masukkk')
    setTimeout(() => {
      this.isShowRecipe = true;
    }, 10);
  }

  blockTyping(event: Event) {
    const allowedKeys = ['Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'];
  
    if (event instanceof KeyboardEvent) {
      if (!allowedKeys.includes(event.key)) {
        event.preventDefault();
      }
    } else {
      // For non-keyboard events like paste
      event.preventDefault();
    }
  }

  changePage(page: number) {
    if (page < 0 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.getDataRecipe();
  }

  getDataRecipe(){
    const params = {
      start: this.currentPage*this.itemsPerPage || 0,
      search: { value: this.searchText,regex:false },
      length: this.itemsPerPage || 15,
      order: [{ column: 0, dir: 'asc' }],
      ...this.paramaters ,
      draw:this.draw,
      kodeGudang: this.g.getUserLocationCode(),
      columns: [
        { data: 'kodeBarang', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'namaBarang', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'konversi', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'satuanBesar', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'satuanKecil', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'defaultGudang', name: '', searchable: true, orderable: true, search: { value: '', regex: false } },
        { data: 'status', name: '', searchable: false, orderable: true, search: { value: '', regex: false } },
      ],    };

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

        this.listRecipeData= mappedData;

        this.totalItems = resp.recordsTotal;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      });

      this.draw++;
  }
  
  specialCharValidator(control: AbstractControl): ValidationErrors | null {
    const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
    const value = control.value;
    if (value && specialCharRegex.test(value)) {
      return { specialCharNotAllowed: true };
    }
    return null;
  }

    ngOnDestroy(): void {
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed() {
    this.isShowRecipe = false;
  }

   pilihBarang(data: any): void {
    console.log(data,'data');
    this.myForm.patchValue({
      kodeBarang: data.kodeBarang,
      namaBarang: data.namaBarang,
      satuanHasilProduksi: parseFloat(data.konversi).toFixed(2),
      labelSatuanHasilProduksi: data.satuanKecil + '/' + data.satuanBesar,
      hargaSatuan: 0,
      satuanKecil: data.satuanKecil,
      satuanBesar: data.satuanBesar,
    });

    this.isShowRecipe = false;
  }

  loadBahanBaku() {
    this.isShowDetail = true;
    this.myForm.get('jumlahHasilProduksi')?.disable();
    this.myForm.get('tglExp')?.disable();
    this.myForm.get('keterangan')?.disable();
    let param = this.myForm.get('kodeBarang')?.value;

    this.appService.getBahanBakuByResep(param).subscribe({
      next: (res) => {
        this.listProductData = res.data.map((item: any) => ({
          jumlahHasilProduksi: this.myForm.get('jumlahHasilProduksi')?.value,
          bahanBaku: item.bahanBaku,
          namaBarang: item.namaBarang,
          konversi: this.g.formatNumberId(item.konversi),
          qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          tipeProduksi: 'R',
          qtyPemakaianBesar:this.g.formatNumberId( Math.floor(
            (item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value) /
              item.konversi
          )),
          qtyPemakaianKecil: this.g.formatNumberId(
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value -
            Math.floor(
              (item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value) / item.konversi
            ) * item.konversi
          ),
          totalQtyPemakaian: this.g.formatNumberId(
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value
          ),
          isConfirmed: item.flagExpired == 'Y' ? true : false,
        }));

        this.jumlahBahanbaku=this.listProductData.length;
      },
    });
  }

  getTotalExpiredData(kodeBarang: string, konversi: number) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPemakaianBesar +=
          (Number(item.qtyPemakaianBesar) || 0) * konversi; // Multiply qtyPemakaianBesar by konversi
        acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
        return acc;
      },
      { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 }
    );

    return (
      totalExpired.qtyPemakaianBesar + totalExpired.qtyPemakaianKecil
    ).toFixed(2);
  }

  onBatalPressed(newItem: any=[]): void {
    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);

    this.myForm.get('jumlahHasilProduksi')?.enable();
    this.myForm.get('tglExp')?.enable();
    this.myForm.get('keterangan')?.enable();

    this.listProductData = [];
    this.listEntryExpired =[];
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
    this.isShowDetail = false;
    // if (newItem) this.onShowModalPrint(newItem);
  }
 
}
