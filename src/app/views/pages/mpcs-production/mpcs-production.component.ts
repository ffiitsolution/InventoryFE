import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../service/app.service';
import { isEmpty } from 'lodash-es';
import { environment } from '../../../../environments/environment';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../../../service/translation.service';
import { GlobalService } from '../../../service/global.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Page } from '../../../model/page';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HelperService } from '../../../service/helper.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { DEFAULT_DELAY_TIME } from '../../../../constants';
import { AppConfig } from '../../../config/app.config';
@Component({
  selector: 'app-mpcs-production',
  templateUrl: './mpcs-production.component.html',
  styleUrls: ['./mpcs-production.component.scss'],
})
export class MpcsProductionComponent implements OnInit {
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
  listRecipeData: any = [];
  defaultDate: any;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  searchText: string = '';
  draw: any = 1;
  totalItems = 0;
  itemsPerPage = 15;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];
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
  jumlahBahanbaku: number = 1;
  listEntryExpired: any[] = [];
  isShowDetail: boolean = false;
  isShowExpired: boolean = false;
  selectedExpProduct: any = {};
  totalFilteredExpired: any = '0.0';
  headerMpcsProduksi: any = {};
  protected configGudang = '';
  constructor(
    translate: TranslateService,
    private route: ActivatedRoute,
    private translation: TranslationService,
    private appService: AppService,
    public g: GlobalService,
    private router: Router,
    private el: ElementRef,
    private form: FormBuilder,
    public helperService: HelperService,
    private toastr: ToastrService
  ) {
    translate.use(g.getLocalstorage('inv_language') || 'id');
    this.dpConfig.containerClass = 'theme-dark-blue';
    this.dpConfig.dateInputFormat = 'DD/MM/YYYY';
    this.dpConfig.adaptivePosition = true;
    this.dpConfig.minDate = new Date();
    this.dpConfig.customTodayClass = 'today-highlight';
    this.dpConfig.isDisabled = true;
    this.configGudang = this.g.mpcsDefaultGudang;
  }
  myForm: FormGroup;

  ngOnInit(): void {
    if (!this.g.mpcsDefaultGudang) {
      this.onBack();
    }
    this.headerMpcsProduksi = this.g.getLocalstorage('headerMpcsProduksi');
    if (this.headerMpcsProduksi) {
      this.headerMpcsProduksi = JSON.parse(this.headerMpcsProduksi);
    }
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
        if (this.headerMpcsProduksi.nomorTransaksi) {
          this.refreshBahanBaku();
        }
      });

    this.myForm
      .get('satuanHasilProduksi')
      ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.calculateTotalHasilProduksi();
      });

    this.getDataRecipe();

    if (this.headerMpcsProduksi?.nomorTransaksi) {
      this.loadDetailData();
    }
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

  showRecipe() {
    setTimeout(() => {
      this.isShowRecipe = true;
    }, 10);
  }

  blockTyping(event: Event) {
    const allowedKeys = [
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Backspace',
    ];

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

  getDataRecipe() {
    const params = {
      start: this.currentPage * this.itemsPerPage || 0,
      search: { value: this.searchText, regex: false },
      length: this.itemsPerPage || 15,
      order: [{ column: 0, dir: 'asc' }],
      ...this.paramaters,
      draw: this.draw,
      kodeGudang: this.configGudang,
      jenisGudang: this.g.mpcsJenisGudang,
      columns: [
        {
          data: 'kodeBarang',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'namaBarang',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'konversi',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'satuanBesar',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'satuanKecil',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'defaultGudang',
          name: '',
          searchable: true,
          orderable: true,
          search: { value: '', regex: false },
        },
        {
          data: 'status',
          name: '',
          searchable: false,
          orderable: true,
          search: { value: '', regex: false },
        },
      ],
    };

    this.appService.getProductionProductList(params).subscribe((resp: any) => {
      const mappedData = resp.data.map((item: any, index: number) => {
        // hapus rn dari data
        const { rn, ...rest } = item;
        const finalData = {
          ...rest,
          dtIndex: this.page.start + index + 1,
        };
        return finalData;
      });

      this.listRecipeData = mappedData;

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
    this.g.removeLocalstorage('headerMpcsProduksi');
    // clean subsribe rxjs
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBackPressed() {
    this.isShowRecipe = false;
  }
  onBack() {
    const route = this.router.createUrlTree(['/mpcs/list']);
    this.router.navigateByUrl(route);
  }

  pilihBarang(data: any): void {
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
          konversi: item.konversi,
          qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          tipeProduksi: 'R',
          qtyPemakaianBesar: Math.floor(
            (item.qtyPemakaian *
              this.myForm.get('jumlahHasilProduksi')?.value) /
              item.konversi
          ).toFixed(2),
          qtyPemakaianKecil: (
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value -
            Math.floor(
              (item.qtyPemakaian *
                this.myForm.get('jumlahHasilProduksi')?.value) /
                item.konversi
            ) *
              item.konversi
          ).toFixed(2),
          totalQtyPemakaian: (
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value
          ).toFixed(2),
          isConfirmed: item.flagExpired == 'Y' ? true : false,
        }));

        this.myForm.patchValue({
          totalBahanBaku: this.listProductData.length,
        });
      },
    });
  }

  getTotalExpiredData(kodeBarang: string, konversi: any) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPemakaianBesar +=
          (this.helperService.sanitizedNumberWithoutComa(
            item.qtyPemakaianBesar
          ) || 0) * this.helperService.sanitizedNumberWithoutComa(konversi); // Multiply qtyPemakaianBesar by konversi
        acc.qtyPemakaianKecil +=
          this.helperService.sanitizedNumberWithoutComa(
            item.qtyPemakaianKecil
          ) || 0;
        return acc;
      },
      { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 }
    );
    return (
      totalExpired.qtyPemakaianBesar + totalExpired.qtyPemakaianKecil
    ).toFixed(2);
  }

  onBatalPressed(newItem: any = []): void {
    const todayDate = new Date();
    this.defaultDate = this.helperService.formatDate(todayDate);

    this.myForm.get('jumlahHasilProduksi')?.enable();
    this.myForm.get('tglExp')?.enable();
    this.myForm.get('keterangan')?.enable();

    this.listProductData = [];
    this.listEntryExpired = [];
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

  onShowExpired(event: any, index: number) {
    this.selectedExpProduct = this.listProductData[index];
    this.selectedExpProduct.totalQtyProduksi = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPemakaianBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPemakaianKecil)
      ).toFixed(2)
    ).toFixed(2);
    this.selectedExpProduct.konversi = parseFloat(
      this.selectedExpProduct.konversi
    ).toFixed(2);
    this.selectedExpProduct.qtyPemakaianBesar = parseFloat(
      this.selectedExpProduct.qtyPemakaianBesar
    ).toFixed(2);

    let totalQtySum = parseFloat(
      (
        Number(this.selectedExpProduct.qtyPemakaianBesar) *
          Number(this.selectedExpProduct.konversi) +
        Number(this.selectedExpProduct.qtyPemakaianKecil)
      ).toFixed(2)
    ).toFixed(2);

    this.totalFilteredExpired = totalQtySum;
    if (
      !this.listEntryExpired.some(
        (item) => item.kodeBarang === this.selectedExpProduct.bahanBaku
      )
    ) {
      this.listEntryExpired.push({
        tglExpired: moment().add(1, 'days').toDate(),
        keteranganTanggal: moment()
          .add(1, 'days')
          .locale('id')
          .format('DD MMM YYYY'),
        qtyPemakaianBesar: parseFloat(
          this.selectedExpProduct.qtyPemakaianBesar
        ).toFixed(2),
        qtyPemakaianKecil: parseFloat(
          this.selectedExpProduct.qtyPemakaianKecil
        ).toFixed(2),
        satuanKecil: this.selectedExpProduct.satuanKecil,
        satuanBesar: this.selectedExpProduct.satuanBesar,
        konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
        totalQty: parseFloat(totalQtySum).toFixed(2),
        kodeBarang: this.selectedExpProduct.bahanBaku,
        namaBarang: this.selectedExpProduct.namaBarang,
        validationExpiredMessageList: '',
        validationQty: '',
      });
    }

    this.isShowExpired = true;
  }

  onAddExpiredRow() {
    this.listEntryExpired.push({
      tglExpired: '',
      keteranganTanggal: '',
      qtyPemakaianBesar: '0.0',
      qtyPemakaianKecil: '0.0',
      satuanKecil: this.selectedExpProduct.satuanKecil,
      satuanBesar: this.selectedExpProduct.satuanBesar,
      konversi: parseFloat(this.selectedExpProduct.konversi).toFixed(2),
      totalQty: '0.0',
      kodeBarang: this.selectedExpProduct.bahanBaku,
      validationExpiredMessageList:
        'Tanggal tidak boleh kosong, silahkan pilih tanggal!',
      validationQty: '',
    });
  }

  updateKeteranganTanggal(item: any, event: any, index: number) {
    const dateFormatRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (event == 'Invalid Date' && !dateFormatRegex.test(item.tglExpired)) {
      // Reset if invalid format
      item.tglExpired = null; // Reset model value
      item.validationExpiredMessageList = 'Invalid date format!';
    } else {
      // item.validationExpiredMessageList='';
      item.keteranganTanggal = moment(item.tglExpired)
        .locale('id')
        .format('D MMMM YYYY');
      this.validateDate(event, item.kodeBarang, index);
    }
  }

  isValidQtyExpired: boolean = true;

  get filteredList() {
    return this.listEntryExpired.filter(
      (item) => item.kodeBarang === this.selectedExpProduct.bahanBaku
    );
  }

  validateDate(event: any, kodeBarang: string, index: number) {
    let inputDate: any = '';
    let source: string;
    let validationMessage = '';

    if (event?.target?.value) {
      inputDate = event.target.value;
      source = 'manual input';
    } else {
      inputDate = event;
      source = 'datepicker';
    }

    const expiredDate = moment(inputDate, 'DD/MM/YYYY').startOf('day').toDate();
    const today = moment().startOf('day').toDate();

    console.log('today', today);
    console.log('expiredDate', expiredDate);

    if (expiredDate < today) {
      validationMessage = `Tanggal kadaluarsa tidak boleh lebih < dari sekarang, silahkan pilih tanggal lain!`;
    }

    // ✅ Get only the filtered list of entries for the same `kodeBarang`
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );
    console.log('tgllist', filteredEntries);

    // ✅ Validate empty input
    if (!inputDate) {
      validationMessage = 'Tanggal tidak boleh kosong, silahkan pilih tanggal!';
    } else {
      // ✅ Check if the item is expired
      const expiredData = this.listEntryExpired.find(
        (exp) => exp.kodeBarang === kodeBarang
      );

      // ✅ Check for duplicate expiration dates within the same kodeBarang
      const isDuplicate = filteredEntries.some(
        (otherEntry, otherIndex) =>
          otherIndex !== index &&
          moment(otherEntry.tglExpired).format('YYYY-MM-DD') ===
            moment(expiredDate).format('YYYY-MM-DD')
      );

      if (isDuplicate) {
        validationMessage =
          'Tanggal ini sudah ada dalam daftar, silahkan pilih tanggal lain!';
      }
    }

    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    if (realIndex !== -1) {
      // ✅ Update the correct entry in the original list
      this.listEntryExpired[realIndex] = {
        ...this.listEntryExpired[realIndex],
        tglExpired: expiredDate, // Update the date in the list
        validationExpiredMessageList: validationMessage,
      };

      console.log('Updated Validation:', this.listEntryExpired[realIndex]);
    }
  }

  onBatalExpired() {
    this.isShowExpired = false;
  }

  onInputQtyBesarExpired(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = numericValue.toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    // ✅ Find all entries with the same kodeBarang
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyPemakaianBesar: value,
          validationQty:
            parseFloat(value) +
              parseFloat(this.listEntryExpired[realIndex].qtyPemakaianKecil) <=
            0
              ? 'Quantity tidak boleh < 0'
              : '',
        };
      }
    }

    this.updateTotalExpired();
  }

  onInputQtyKecilExpired(event: any, kodeBarang: string, index: number) {
    let value = event.target.value;

    if (value !== null && value !== undefined) {
      let numericValue = parseFloat(value.toString().replace(',', '.'));
      if (isNaN(numericValue)) {
        numericValue = 0;
      }
      value = numericValue.toFixed(2);
    } else {
      value = '0.00'; // Default if empty
    }

    // ✅ Find all entries with the same kodeBarang
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    if (filteredEntries.length > index) {
      // ✅ Get the real index in listEntryExpired
      const realIndex = this.listEntryExpired.indexOf(filteredEntries[index]);

      if (realIndex !== -1) {
        let messageValidation = '';

        if (
          parseFloat(value) +
            parseFloat(this.listEntryExpired[realIndex].qtyPemakaianBesar) <=
          0
        ) {
          messageValidation = 'Quantity tidak boleh < 0';
        } else if (
          Math.round(value) >=
          Math.round(this.listEntryExpired[realIndex].konversi)
        ) {
          messageValidation = 'Quantity kecil tidak boleh >= konversi';
          value = '0.0';
        }

        this.listEntryExpired[realIndex] = {
          ...this.listEntryExpired[realIndex],
          qtyPemakaianKecil: value,
          validationQtyKecil: messageValidation,
        };
      }
    }
    this.updateTotalExpired();
  }

  updateTotalExpired() {
    this.totalFilteredExpired = this.filteredList.reduce(
      (sum, data) =>
        Number(sum) +
        Number(
          Number(data.qtyPemakaianBesar) * Number(data.konversi) +
            Number(data.qtyPemakaianKecil)
        ),
      0
    );

    this.totalFilteredExpired = parseFloat(this.totalFilteredExpired).toFixed(
      2
    );
  }

  onSaveEntryExpired() {
    let totalQtyExpired = 0;
    let validationExpiredMessageList = '';
    let totalQtyEmpty = 0;

    console.log('selected', this.selectedExpProduct);
    console.log(
      'sanitizedNumberWithoutComa',
      this.helperService.sanitizedNumberWithoutComa(
        this.selectedExpProduct.qtyPemakaianBesar
      )
    );
    console.log(
      'sanitizedNumberWithoutComa2',
      this.helperService.sanitizedNumberWithoutComa(
        this.selectedExpProduct.qtyPemakaianKecil
      )
    );

    const totalQtyPemakaian =
      this.helperService.sanitizedNumberWithoutComa(
        this.selectedExpProduct.qtyPemakaianBesar
      ) *
        this.selectedExpProduct.konversi +
      this.helperService.sanitizedNumberWithoutComa(
        this.selectedExpProduct.qtyPemakaianKecil
      );

    this.listEntryExpired.forEach((item: any) => {
      if (item.kodeBarang === this.selectedExpProduct.bahanBaku) {
        item.totalQty =
          this.helperService.sanitizedNumberWithoutComa(
            item.qtyPemakaianBesar
          ) *
            item.konversi +
          this.helperService.sanitizedNumberWithoutComa(item.qtyPemakaianKecil);
        item.kodeBarang = this.selectedExpProduct.bahanBaku;
        totalQtyExpired += item.totalQty;

        if (item.totalQty <= 0) {
          totalQtyEmpty++;
        }
        validationExpiredMessageList = item.validationExpiredMessageList;
      }
    });

    console.log('totalQtyPemakaian', totalQtyPemakaian);
    console.log('totalQtyExpired', totalQtyExpired);
    if (totalQtyExpired != totalQtyPemakaian) {
      this.toastr.error(
        'Total Qty Expired harus sama dengan Qty Pemakaian, Tolong masukan Qty Expired dengan benar!'
      );
    } else if (validationExpiredMessageList) {
      this.toastr.error(validationExpiredMessageList);
    } else if (totalQtyEmpty > 0) {
      this.toastr.error(
        'Total Qty Expired tidak boleh 0 , Silahkan hapus data yg tidak terpakai atau isikan Qty dengan benar!'
      );
    } else {
      this.isShowExpired = false;
    }
  }

  onExpiredDeleteRow(kodeBarang: string, index: number) {
    const filteredEntries = this.listEntryExpired.filter(
      (entry) => entry.kodeBarang === kodeBarang
    );

    // Step 2: Find the actual index in the original list
    const realIndex = this.listEntryExpired.findIndex(
      (entry) =>
        entry.kodeBarang === kodeBarang &&
        entry.tglExpired === filteredEntries[index].tglExpired
    );

    // Step 3: Remove the entry only if realIndex is valid
    if (realIndex !== -1) {
      this.listEntryExpired.splice(realIndex, 1);
    }

    this.updateTotalExpired();
  }

  onSubmit() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const extraItem = {
        kodeGudang: this.configGudang,
        tglTransaksi: moment(
          this.myForm.get('tglTransaksi')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        tipeTransaksi: 12,
        kodeBarang: this.myForm.get('kodeBarang')?.value,
        tglExpired: moment(
          this.myForm.get('tglExp')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        konversi: this.myForm.get('satuanHasilProduksi')?.value,
        satuanKecil: this.myForm.get('satuanKecil')?.value,
        satuanBesar: this.myForm.get('satuanBesar')?.value,
        qtyBesar: this.myForm.get('jumlahHasilProduksi')?.value,
        qtyKecil: '0.00',
        totalQty: this.myForm.get('totalHasilProduksi')?.value,
        totalQtyExpired: this.myForm.get('totalHasilProduksi')?.value,
        flagExpired: 'Y',
        tipeProduksi: 'F',
        hargaSatuan: this.myForm.get('hargaSatuan')?.value,
        userCreate: 'system',
      };

      const param = {
        kodeGudang: this.configGudang,
        tglTransaksi: moment(
          this.myForm.get('tglTransaksi')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'B',
        keterangan: this.myForm.get('keterangan')?.value,
        kodeResep: this.myForm.get('kodeBarang')?.value,
        tglExp: moment(this.myForm.get('tglExp')?.value, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        jumlahResep: this.myForm.get('jumlahHasilProduksi')?.value,
        userCreate: 'system',
        details: [
          ...this.listProductData
            .filter(
              (item: any) => item.bahanBaku && item.bahanBaku.trim() !== ''
            )
            .map((item) => ({
              kodeGudang: this.configGudang,
              tglTransaksi: moment(
                this.myForm.get('tglTransaksi')?.value,
                'DD-MM-YYYY'
              ).format('D MMM YYYY'),
              tipeTransaksi: 12,
              kodeBarang: item.bahanBaku,
              konversi: this.helperService.sanitizedNumberWithoutComa(
                item.konversi
              ),
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              qtyBesar:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianBesar
                ) || 0,
              qtyKecil:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianKecil
                ) || 0,
              flagExpired: item.isConfirmed ? 'Y' : 'T',
              tipeProduksi: 'R',
              totalQty:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianKecil
                ),
              totalQtyExpired:
                this.helperService.sanitizedNumberWithoutComa(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helperService.sanitizedNumberWithoutComa(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianKecil
                ),
              hargaSatuan: 0,
              userCreate: 'system',
            })),
          extraItem,
        ],

        detailsExpired: [
          ...this.listEntryExpired?.map((expiredItem) => ({
            kodeGudang: this.configGudang,
            tglTransaksi: moment(
              this.myForm.get('tglTransaksi')?.value,
              'DD-MM-YYYY'
            ).format('D MMM YYYY'),
            tipeTransaksi: 12,
            kodeBarang: expiredItem.kodeBarang,
            tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
              'D MMM YYYY'
            ),
            konversi: Math.abs(expiredItem.konversi).toFixed(2),
            qtyBesar:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianBesar)).toFixed(2) ||
              0,
            qtyKecil:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianKecil)).toFixed(2) ||
              0,
            totalQty: -parseFloat(
              (
                Number(expiredItem.qtyPemakaianBesar) *
                  Number(expiredItem.konversi) +
                Number(expiredItem.qtyPemakaianKecil)
              ).toFixed(2)
            ).toFixed(2),
          })),
          extraItem,
        ],
      };

      Swal.fire({
        ...this.g.componentKonfirmasiSimpanMpcs,
        showConfirmButton: false,
        showCancelButton: false,
        width: '600px',
        customClass: {
          popup: 'custom-popup',
        },
        allowOutsideClick: () => {
          return false; // Prevent closing
        },
        didOpen: () => {
          const submitBtn = document.getElementById(
            'btn-submit'
          ) as HTMLButtonElement;
          const cancelBtn = document.getElementById(
            'btn-cancel'
          ) as HTMLButtonElement;
          const inputName = document.getElementById(
            'input-name'
          ) as HTMLInputElement;
          const nameError = document.getElementById(
            'name-error'
          ) as HTMLElement;

          submitBtn?.addEventListener('click', () => {
            const userName = inputName.value.trim();

            if (!userName) {
              nameError.classList.remove('d-none');
              inputName.focus();
              return;
            }

            nameError.classList.add('d-none');
            submitBtn.disabled = true;
            cancelBtn.disabled = true;
            // 👉 tambahkan nama ke userCreate
            param.userCreate = userName;
            Swal.close();
            submitBtn.disabled = true;
            cancelBtn.disabled = true;
            this.appService
              .insert('/api/production/insert', param)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                  } else {
                    // this.onBackPressed(res.data);
                    setTimeout(() => {
                      this.toastr.success('Data production berhasil disimpan!');
                      this.onBack();
                    }, DEFAULT_DELAY_TIME);
                  }
                  this.loadingSimpan = false;
                },
                error: () => {
                  this.loadingSimpan = false;
                  submitBtn.disabled = false;
                  cancelBtn.disabled = false;
                },
              });
            Swal.close();
          });

          cancelBtn?.addEventListener('click', () => {
            Swal.close();
            this.loadingSimpan = false;
            this.toastr.info('Posting dibatalkan');
          });
        },
      });
    }
  }

  getExpiredData(kodeBarang: string) {
    const filtered = this.listEntryExpired.filter(
      (item) => item.kodeBarang === kodeBarang
    );

    const totalExpired = filtered.reduce(
      (acc, item) => {
        acc.qtyPemakaianBesar += Number(item.qtyPemakaianBesar) || 0;
        acc.qtyPemakaianKecil += Number(item.qtyPemakaianKecil) || 0;
        return acc;
      },
      { qtyPemakaianBesar: 0, qtyPemakaianKecil: 0 }
    );

    return totalExpired;
  }

  isDataInvalid() {
    let dataInvalid = false;

    const invalidItems = this.listProductData.filter(
      (item) =>
        this.helperService.sanitizedNumberWithoutComa(
          item.totalQtyPemakaian
        ) !==
          this.helperService.sanitizedNumberWithoutComa(
            this.getTotalExpiredData(item.bahanBaku, item.konversi)
          ) && item.isConfirmed === true
    );

    const invalidExpired = this.listEntryExpired.filter(
      (item) => item.validationExpiredMessageList !== ''
    );

    if (invalidItems.length > 0) {
      dataInvalid = true;
      this.toastr.error('Data Qty Pemakaian harus sama dengan Qty Expired');
    }

    if (invalidExpired.length > 0) {
      dataInvalid = true;
      this.toastr.error(
        `Data tgl expired tidak sesuai di kode barang ${invalidExpired[0].kodeBarang} !`
      );
    }

    return dataInvalid;
  }

  loadDetailData() {
    if (this.headerMpcsProduksi.statusPosting === 'P') {
      this.myForm.get('jumlahHasilProduksi')?.disable();
      this.myForm.get('tglExp')?.disable();
      this.myForm.get('keterangan')?.disable();
      this.isShowDetail = true;
    }

    this.myForm.get('kodeBarang')?.disable();
    let param = {
      nomorTransaksi: this.headerMpcsProduksi?.nomorTransaksi,
      kodeGudang: this.configGudang,
    };

    this.appService.detailProductionAndExpired(param).subscribe({
      next: (res) => {
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
          keterangan: res.data.keterangan,
        });

        this.listProductData = res.data.detail.map((item: any) => ({
          jumlahHasilProduksi: this.myForm.get('jumlahHasilProduksi')?.value,
          bahanBaku: item.kodeBarang,
          namaBarang: item.namaBarang,
          konversi: parseFloat(item.konversi).toFixed(2),
          qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          tipeProduksi: 'R',
          qtyPemakaianBesar: parseFloat(item.qtyBesar).toFixed(2),
          qtyPemakaianKecil: parseFloat(item.qtyKecil).toFixed(2),
          totalQtyPemakaian: parseFloat(item.totalQty).toFixed(2),
          isConfirmed: item.flagExpired == 'Y' ? true : false,
        }));

        this.listEntryExpired = res.data.expired.map((item: any) => ({
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
      },
    });
  }

  refreshBahanBaku() {
    // this.isShowDetail = true;
    // this.myForm.get('jumlahHasilProduksi')?.disable();
    // this.myForm.get('tglExp')?.disable();
    // this.myForm.get('keterangan')?.disable();
    let param = this.myForm.get('kodeBarang')?.value;

    this.appService.getBahanBakuByResep(param).subscribe({
      next: (res) => {
        this.listProductData = res.data.map((item: any) => ({
          jumlahHasilProduksi: this.myForm.get('jumlahHasilProduksi')?.value,
          bahanBaku: item.bahanBaku,
          namaBarang: item.namaBarang,
          konversi: parseFloat(item.konversi).toFixed(2),
          qtyPemakaian: parseFloat(item.qtyPemakaian).toFixed(2),
          satuanKecil: item.satuanKecil,
          satuanBesar: item.satuanBesar,
          tipeProduksi: 'R',
          qtyPemakaianBesar: Math.floor(
            (item.qtyPemakaian *
              this.myForm.get('jumlahHasilProduksi')?.value) /
              item.konversi
          ).toFixed(2),
          qtyPemakaianKecil: (
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value -
            Math.floor(
              (item.qtyPemakaian *
                this.myForm.get('jumlahHasilProduksi')?.value) /
                item.konversi
            ) *
              item.konversi
          ).toFixed(2),
          totalQtyPemakaian: (
            item.qtyPemakaian * this.myForm.get('jumlahHasilProduksi')?.value
          ).toFixed(2),
          isConfirmed: item.flagExpired == 'Y' ? true : false,
        }));

        this.myForm.patchValue({
          totalBahanBaku: this.listProductData.length,
        });
      },
    });
  }

  onUpdate() {
    if (!this.isDataInvalid()) {
      this.loadingSimpan = true;
      // param for order Header

      const extraItem = {
        kodeGudang: this.configGudang,
        tglTransaksi: moment(
          this.myForm.get('tglTransaksi')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        tipeTransaksi: 12,
        kodeBarang: this.myForm.get('kodeBarang')?.value,
        tglExpired: moment(
          this.myForm.get('tglExp')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        konversi: this.myForm.get('satuanHasilProduksi')?.value,
        satuanKecil: this.myForm.get('satuanKecil')?.value,
        satuanBesar: this.myForm.get('satuanBesar')?.value,
        qtyBesar: this.myForm.get('jumlahHasilProduksi')?.value,
        qtyKecil: '0.00',
        totalQty: this.myForm.get('totalHasilProduksi')?.value,
        totalQtyExpired: this.myForm.get('totalHasilProduksi')?.value,
        flagExpired: 'Y',
        tipeProduksi: 'F',
        hargaSatuan: this.myForm.get('hargaSatuan')?.value,
      };

      const param = {
        kodeGudang: this.configGudang,
        nomorTransaksi: this.headerMpcsProduksi.nomorTransaksi,
        tglTransaksi: moment(
          this.myForm.get('tglTransaksi')?.value,
          'DD-MM-YYYY'
        ).format('D MMM YYYY'),
        statusPosting: 'B',
        keterangan: this.myForm.get('keterangan')?.value,
        kodeResep: this.myForm.get('kodeBarang')?.value,
        tglExp: moment(this.myForm.get('tglExp')?.value, 'DD-MM-YYYY').format(
          'D MMM YYYY'
        ),
        jumlahResep: this.myForm.get('jumlahHasilProduksi')?.value,
        userCreate: 'system',
        details: [
          ...this.listProductData
            .filter(
              (item: any) => item.bahanBaku && item.bahanBaku.trim() !== ''
            )
            .map((item) => ({
              kodeGudang: this.configGudang,
              tglTransaksi: moment(
                this.myForm.get('tglTransaksi')?.value,
                'DD-MM-YYYY'
              ).format('D MMM YYYY'),
              tipeTransaksi: 12,
              kodeBarang: item.bahanBaku,
              konversi: item.konversi,
              satuanKecil: item.satuanKecil,
              satuanBesar: item.satuanBesar,
              qtyBesar:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianBesar
                ) || 0,
              qtyKecil:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianKecil
                ) || 0,
              flagExpired: item.isConfirmed ? 'Y' : 'T',
              tipeProduksi: 'R',
              totalQty:
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helperService.sanitizedNumberWithoutComa(
                  item.qtyPemakaianKecil
                ),
              totalQtyExpired:
                this.helperService.sanitizedNumberWithoutComa(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianBesar
                ) *
                  item.konversi +
                this.helperService.sanitizedNumberWithoutComa(
                  this.getExpiredData(item.bahanBaku).qtyPemakaianKecil
                ),
              hargaSatuan: 0,
              userCreate: 'system',
            })),
          extraItem,
        ],

        detailsExpired: [
          ...this.listEntryExpired?.map((expiredItem) => ({
            kodeGudang: this.configGudang,
            tglTransaksi: moment(
              this.myForm.get('tglTransaksi')?.value,
              'DD-MM-YYYY'
            ).format('D MMM YYYY'),
            tipeTransaksi: 12,
            kodeBarang: expiredItem.kodeBarang,
            tglExpired: moment(expiredItem.tglExpired, 'DD-MM-YYYY').format(
              'D MMM YYYY'
            ),
            konversi: Math.abs(expiredItem.konversi).toFixed(2),
            qtyBesar:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianBesar)).toFixed(2) ||
              0,
            qtyKecil:
              -Math.abs(parseFloat(expiredItem.qtyPemakaianKecil)).toFixed(2) ||
              0,
            totalQty: -parseFloat(
              (
                Number(expiredItem.qtyPemakaianBesar) *
                  Number(expiredItem.konversi) +
                Number(expiredItem.qtyPemakaianKecil)
              ).toFixed(2)
            ).toFixed(2),
          })),
          extraItem,
        ],
      };

      Swal.fire({
        ...this.g.componentKonfirmasiSimpanMpcs,
        showConfirmButton: false,
        showCancelButton: false,
        width: '600px',
        customClass: {
          popup: 'custom-popup',
        },
        allowOutsideClick: () => {
          return false; // Prevent closing
        },
        didOpen: () => {
          const submitBtn = document.getElementById(
            'btn-submit'
          ) as HTMLButtonElement;
          const cancelBtn = document.getElementById(
            'btn-cancel'
          ) as HTMLButtonElement;
           const inputName = document.getElementById(
            'input-name'
          ) as HTMLInputElement;
          const nameError = document.getElementById(
            'name-error'
          ) as HTMLElement;


          submitBtn?.addEventListener('click', () => {
            const userName = inputName.value.trim();

            if (!userName) {
              nameError.classList.remove('d-none');
              inputName.focus();
              return;
            }

            nameError.classList.add('d-none');
            submitBtn.disabled = true;
            cancelBtn.disabled = true;
            // 👉 tambahkan nama ke userCreate
            param.userCreate = userName;

            submitBtn.disabled = true;
            cancelBtn.disabled = true;
            Swal.close();
            this.appService
              .insert('/api/production/update', param)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
                next: (res) => {
                  if (!res.success) {
                    this.toastr.error(res.message);
                  } else {
                    // this.onBackPressed(res.data);
                    setTimeout(() => {
                      this.toastr.success('Data production berhasil diupdate!');
                      this.onBack();
                    }, DEFAULT_DELAY_TIME);
                  }
                  this.loadingSimpan = false;
                },
                error: () => {
                  this.loadingSimpan = false;
                  submitBtn.disabled = false;
                  cancelBtn.disabled = false;
                },
              });
            Swal.close();
          });

          cancelBtn?.addEventListener('click', () => {
            Swal.close();
            this.loadingSimpan = false;
            this.toastr.info('Simpan dibatalkan');
          });
        },
      });
    }
  }
}
