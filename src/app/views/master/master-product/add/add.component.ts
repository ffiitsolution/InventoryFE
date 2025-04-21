import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Page } from 'src/app/model/page';
import { AppService } from 'src/app/service/app.service';
import { DataService } from 'src/app/service/data.service';
import { GlobalService } from 'src/app/service/global.service';
import { TranslationService } from 'src/app/service/translation.service';
import {
  ACTION_SELECT,
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_PRODUCT,
} from 'src/constants';

function nonZeroValidator(control: AbstractControl): ValidationErrors | null {
  if (
    control.value === null ||
    control.value === '' ||
    parseFloat(control.value) === 0
  ) {
    return { nonZero: true };
  }
  return null;
}

function kodeBarang(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^0-9-]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeBarang: true };
  }
  return null;
}

function namaBarang(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9&'/\-+().,\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { namaBarang: true };
  }
  return null;
}

function excludedSensitive(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9&\s.,#\-()\/]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { excludedSensitive: true };
  }
  return null;
}

function decimal10_2Validator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const regex = /^\d{1,8}(\.\d{1,2})?$/;
    if (value && !regex.test(value)) {
      return { invalidDecimal: true }; // Validasi gagal
    }
    return null; // Validasi berhasil
  };
}

function decimal12_2Validator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const regex = /^\d{1,10}(\.\d{1,2})?$/;
    if (value && !regex.test(value)) {
      return { invalidDecimal: true }; // Validasi gagal
    }
    return null; // Validasi berhasil
  };
}

function decimal12_6Validator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const regex = /^\d{1,6}(\.\d{1,6})?$/;
    if (value && !regex.test(value)) {
      return { invalidDecimal: true }; // Validasi gagal
    }
    return null; // Validasi berhasil
  };
}

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterProductAddComponent implements OnInit {
  defaultValue = 0;
  isSubmitting: boolean = false;

  dtOptions: DataTables.Settings = {};
  selectedSupplier: any;

  page = new Page();

  uomList: any;
  supplierList: any;
  defaultOrderGudangList: any;

  uomSatuanKecilList: any;
  uomSatuanBesarList: any;

  configUomSelect: any;
  configSupplierSelect: any;
  configDefaultGudangSelect: any;

  myForm: FormGroup;

  isShowModal: boolean = false;

  baseConfig: any = {
    displayKey: 'keteranganUom', // Key to display in the dropdown
    search: true, // Enable search functionality
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'keteranganUom', // Key to search
  };

  constructor(
    private translationService: TranslationService,
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService,
    private dataService: DataService
  ) {
    this.myForm = this.form.group({
      kodeBarang: ['', [Validators.required, kodeBarang]],
      namaBarang: ['', [Validators.required, namaBarang]],
      konversi: [
        this.defaultValue.toFixed(2),
        [nonZeroValidator, decimal10_2Validator()],
      ],
      satuanKecil: ['', Validators.required],
      satuanBesar: ['', Validators.required],
      defaultGudang: [''],
      defaultSupplier: [''],
      namaSupplier: [''],
      flagCom: [false],
      flagDry: [false],
      flagPrd: [false],
      flagMkt: [false],
      flagCtr: [false],
      flagHra: [false],
      flagExpired: ['T'],
      flagBrgBekas: ['T'],
      flagResepProduksi: ['T'],
      flagConversion: ['T'],
      stockOpname: ['T'],
      others2: ['T'],
      minStock: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      maxStock: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      minOrder: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      satuanMinOrder: [''],
      panjang: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      lebar: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      tinggi: [this.defaultValue.toFixed(2), decimal12_2Validator()],
      volume: [this.defaultValue.toFixed(2), decimal12_6Validator()],
      berat: [this.defaultValue.toFixed(2), decimal10_2Validator()],
      lokasiBarang: ['', excludedSensitive],
      statusAktif: ['', Validators.required],
      keteranganBrg: ['', excludedSensitive],
    });

    this.myForm.get('satuanKecil')?.disable();
    this.myForm.get('satuanBesar')?.disable();

    this.myForm.get('konversi')?.valueChanges.subscribe((value) => {
      this.handleKonversiChange(value);
    });

    this.myForm.get('satuanKecil')?.valueChanges.subscribe((value) => {
      this.handleSatuanKecilChange(value);
    });

    this.myForm.get('satuanBesar')?.valueChanges.subscribe((value) => {
      this.handleSatuanBesarChange(value);
    });
  }

  ngOnInit(): void {
    this.getUomList();
    this.getSupplierList();
    this.getDefaultOrderGudangList();

    this.configUomSelect = {
      disabled: true,
      displayKey: 'keteranganUom',
      search: true,
      height: '300px',
      width: 'auto',
      placeholder: 'Pilih Satuan',
      fontSize: '12px',
    };

    this.configDefaultGudangSelect = {
      disabled: true,
      displayKey: 'name',
      search: true,
      height: '300px',
      placeholder: 'Pilih Default Gudang',
    };

    this.configSupplierSelect = {
      disabled: true,
      displayKey: 'namaSupplier',
      search: true,
      height: '300px',
      placeholder: 'Pilih Supplier',
    };
    this.renderDataTables();
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

      ajax: (dataTablesParameters: any, callback) => {
        this.page.start = dataTablesParameters.start;
        this.page.length = dataTablesParameters.length;
        const requestData = {
          ...dataTablesParameters,
        };
        this.dataService
          .postData(this.g.urlServer + '/api/supplier/dt', requestData)
          .subscribe((resp: any) => {
            const mappedData = resp.data.map((item: any, index: number) => {
              // hapus rn
              const { rn, ...rest } = item;
              const finalData = {
                dtIndex: this.page.start + index + 1,
                ...rest,
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
        { data: 'dtIndex', title: '#', orderable: false, searchable: false },
        {
          data: 'kodeSupplier',
          title: 'Kode Supplier',
          orderable: true,
          searchable: true,
        },
        {
          data: 'namaSupplier',
          title: 'Nama Supplier ',
          orderable: true,
          searchable: true,
        },
        {
          data: 'alamat1',
          title: 'Alamat' + ' 1',
          orderable: true,
          searchable: true,
        },
        {
          data: 'alamat2',
          title: 'Alamat' + ' 2',
          orderable: true,
          searchable: true,
        },
        { data: 'kota', title: 'Kota', orderable: true, searchable: true },
        { data: 'telpon1', title: 'Telpon', orderable: true, searchable: true },
        {
          data: 'statusAktif',
          title: 'Status',
          searchable: false,
          render: (data) => {
            if (data === 'A') {
              return `<div class="d-flex justify-content-center"> <span class="badge badge-success py-2" style="color:white; background-color: #2eb85c; width: 60px">Active</span></div>`;
            }
            return `<div class="d-flex justify-content-center"> <span class="badge badge-secondary py-2" style="background-color:#b51823; width: 60px">Inactive</span> </div>`;
          },
        },
        {
          title: 'Action',
          render: (data, type, row) => {
            return `<button class="btn btn-sm action-select btn-outline-info btn-60">Pilih</button>`;
          },
        },
      ],
      searchDelay: 1500,
      order: [
        [7, 'asc'],
        [1, 'asc'],
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.action-select', row).on('click', () =>
          this.actionBtnClick(ACTION_SELECT, data)
        );
        return row;
      },
    };
  }

  actionBtnClick(action: string, data: any = null) {
    this.selectedSupplier = data;
    this.renderDataTables();
    this.myForm.patchValue({
      defaultSupplier: this.selectedSupplier.kodeSupplier,
      namaSupplier: this.selectedSupplier.namaSupplier,
    });
    this.isShowModal = false;
  }

  handleKonversiChange(value: any) {
    const satuanKecil = this.myForm.get('satuanKecil');
    const satuanBesar = this.myForm.get('satuanBesar');

    if (parseFloat(value) === 1) {
      satuanBesar?.disable();
      this.myForm.patchValue({
        satuanBesar: satuanKecil?.value,
      });
      satuanKecil?.enable();
    } else if (parseFloat(value) > 0) {
      if (
        satuanKecil?.value === satuanBesar?.value &&
        satuanKecil?.value != ''
      ) {
        this.myForm.patchValue({
          satuanBesar: '',
          satuanMinOrder: '',
        });
        this.uomSatuanBesarList = this.uomList.filter(
          (item: any) => item.kodeUom !== satuanKecil?.value?.kodeUom
        );
      } else if (satuanKecil?.value == '') {
        this.myForm.patchValue({
          satuanKecil: '',
        });
      }
      satuanKecil?.enable();
    } else if (parseFloat(value) === 0) {
      satuanKecil?.disable();
      satuanBesar?.disable();
    }
  }

  handleSatuanKecilChange(value: any) {
    const konversi = this.myForm.get('konversi')?.value;
    const satuanBesar = this.myForm.get('satuanBesar');

    if (parseFloat(konversi) === 1) {
      satuanBesar?.disable();
      this.myForm.patchValue({
        satuanBesar: value,
      });
    } else {
      if (value === satuanBesar?.value || value == '') {
        this.myForm.patchValue({
          satuanBesar: '',
          satuanMinOrder: '',
        });
      }
      this.uomSatuanBesarList = this.uomList.filter(
        (item: any) => item.kodeUom !== value.kodeUom
      );
      satuanBesar?.enable();
    }
  }

  handleSatuanBesarChange(value: any) {
    this.myForm.patchValue({
      satuanMinOrder: value,
    });
  }

  isInvalid(field: string, errorKey?: string): boolean {
    const control = this.myForm.get(field);
    return control
      ? control.invalid &&
          control.touched &&
          (!errorKey || control.hasError(errorKey))
      : false;
  }

  preventEmpty(event: any) {
    const input = event.target;

    if (input.value === '') {
      input.value = this.defaultValue.toFixed(2);
      this.myForm.patchValue({ konversi: this.defaultValue.toFixed(2) });
    }
  }

  getUomList() {
    this.service.getUomList().subscribe((res: any) => {
      this.uomList = res;
      this.uomSatuanKecilList = res;
      this.uomSatuanBesarList = res;
    });
  }

  getSupplierList() {
    this.service.getSupplierList().subscribe((res: any) => {
      this.supplierList = res;
    });
  }

  getDefaultOrderGudangList() {
    this.service.getDefaultOrderGudangList().subscribe((res: any) => {
      this.defaultOrderGudangList = res.map((item: any) => ({
        cad1: item.cad1,
        kodeSingkat: item.kodeSingkat.substring(0, 3),
        name: item.kodeSingkat.substring(0, 3) + ' - ' + item.cad1,
      }));
    });
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_PRODUCT);
    this.router.navigate(['/master/master-product']);
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric'
        ? /^[a-zA-Z0-9]$/
        : type == 'kodeBarang' //kode barang
        ? /^[0-9-]$/
        : type == 'namaBarang' //nama barang
        ? /^[a-zA-Z0-9-+().,&/ '\-]*$/
        : type == 'numeric'
        ? /^[0-9.]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type == 'email'
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'excludedSensitive'
        ? /^[a-zA-Z0-9&\s.,#\-()\/]+$/
        : type == 'kodeSingkat'
        ? /^[a-zA-Z]+$/
        : /^[a-zA-Z.() ,\-]*$/;

    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  convertToUppercase(id: any) {
    const control = this.myForm.get(id);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  onShowModal() {
    this.isShowModal = true;
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
      if (invalid) {
        if (
          Object.values(controls).some((control) =>
            control.hasError('required')
          )
        ) {
          this.toastr.error('Beberapa kolom wajib diisi.');
        } else if (
          Object.values(controls).some((control) =>
            control.hasError('kodeBarang')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('namaBarang')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('invalidDecimal')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('excludedSensitive')
          )
        ) {
          this.toastr.error(
            'Beberapa kolom mengandung karakter khusus yang tidak diperbolehkan.'
          );
        }
      }
    } else {
      this.isSubmitting = true;
      const payload = {
        kodeBarang: controls?.['kodeBarang']?.value,
        namaBarang: controls?.['namaBarang']?.value,
        konversi: controls?.['konversi']?.value,
        satuanKecil: controls?.['satuanKecil']?.value?.kodeUom,
        satuanBesar: controls?.['satuanBesar']?.value?.kodeUom,
        defaultGudang: Array.isArray(controls?.['defaultGudang']?.value)
          ? ''
          : controls?.['defaultGudang']?.value == ''
          ? ''
          : controls?.['defaultGudang']?.value?.kodeSingkat,
        defaultSupplier: controls?.['defaultSupplier']?.value,
        flagCom: controls?.['flagCom']?.value ? 'Y' : 'T',
        flagDry: controls?.['flagDry']?.value ? 'Y' : 'T',
        flagPrd: controls?.['flagPrd']?.value ? 'Y' : 'T',
        flagMkt: controls?.['flagMkt']?.value ? 'Y' : 'T',
        flagCtr: controls?.['flagCtr']?.value ? 'Y' : 'T',
        flagHra: controls?.['flagHra']?.value ? 'Y' : 'T',
        flagFsd: 'T',
        flagIt: 'T',
        others1: 'T',
        flagExpired: controls?.['flagExpired']?.value,
        flagResepProduksi: controls?.['flagResepProduksi']?.value,
        flagAlternate: 'T',
        flagCogs: 'Y',
        flagBrgBekas: controls?.['flagBrgBekas']?.value,
        stockOpname: controls?.['stockOpname']?.value,
        others2: controls?.['others2']?.value,
        flagConversion: controls?.['flagConversion']?.value,
        minStock: controls?.['minStock']?.value,
        maxStock: controls?.['maxStock']?.value,
        minOrder: controls?.['minOrder']?.value,
        satuanMinOrder: controls?.['satuanMinOrder']?.value?.kodeUom,
        statusAktif: controls?.['statusAktif']?.value,
        panjang: controls?.['panjang']?.value,
        lebar: controls?.['lebar']?.value,
        tinggi: controls?.['tinggi']?.value,
        volume: controls?.['volume']?.value,
        berat: controls?.['berat']?.value,
        lokasiBarang: controls?.['lokasiBarang']?.value,
        keteranganBrg: controls?.['keteranganBrg']?.value,
        warningExpired: 0,
        unitPrice: 0,
      };
      this.service.insert('/api/product/insert', payload).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.isSubmitting = false;
        },
      });
    }
  }
}
