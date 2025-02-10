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
import { forkJoin, Observable } from 'rxjs';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_PRODUCT } from 'src/constants';

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
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterProductEditComponent implements OnInit {
  defaultValue = 0;
  isSubmitting: boolean = false;

  uomList: any;
  supplierList: any;
  defaultOrderGudangList: any;

  uomSatuanKecilList: any;
  uomSatuanBesarList: any;

  configUomSelect: any;
  configSupplierSelect: any;
  configDefaultGudangSelect: any;

  myForm: FormGroup;
  detail: any;

  baseConfig: any = {
    displayKey: 'keteranganUom', // Key to display in the dropdown
    search: true, // Enable search functionality
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'keteranganUom', // Key to search
  };

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService
  ) {
    this.myForm = this.form.group({
      kodeBarang: ['', Validators.required],
      namaBarang: ['', Validators.required],
      konversi: [
        this.defaultValue.toFixed(2),
        [nonZeroValidator, decimal10_2Validator()],
      ],
      satuanKecil: ['', Validators.required],
      satuanBesar: ['', Validators.required],
      defaultGudang: [''],
      defaultSupplier: [''],
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
      lokasiBarang: [''],
      statusAktif: ['A'],
      keteranganBrg: [''],
    });

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
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_PRODUCT));
    // this.getUomList();
    // this.getSupplierList();
    // this.getDefaultOrderGudangList();

    forkJoin({
      uomList: this.getUomList(),
      supplierList: this.getSupplierList(),
      defaultOrderGudangList: this.getDefaultOrderGudangList(),
    }).subscribe({
      next: (res) => {
        this.uomList = Array.isArray(res.uomList) ? res.uomList : [];
        this.uomSatuanKecilList = Array.isArray(res.uomList) ? res.uomList : [];
        this.uomSatuanBesarList = Array.isArray(res.uomList) ? res.uomList : [];
        this.supplierList = Array.isArray(res.supplierList)
          ? res.supplierList
          : [];
        this.defaultOrderGudangList = Array.isArray(res.defaultOrderGudangList)
          ? res.defaultOrderGudangList?.map((item) => ({
              cad1: item.cad1,
              kodeSingkat: item.kodeSingkat.substring(0, 3),
            }))
          : [];

        this.myForm.patchValue({
          kodeBarang: this.detail.kodeBarang,
          namaBarang: this.detail.namaBarang,
          konversi: this.detail.konversi.toFixed(2),
          satuanKecil: this.uomList.find(
            (uom: any) => uom.kodeUom === this.detail.satuanKecil
          ),
          satuanBesar: this.uomList.find(
            (uom: any) => uom.kodeUom === this.detail.satuanBesar
          ),
          defaultGudang: this.defaultOrderGudangList.find(
            (defaultGudang: any) =>
              defaultGudang.kodeSingkat === this.detail.defaultGudang
          ),
          defaultSupplier: this.supplierList.find(
            (supplier: any) =>
              supplier.kodeSupplier === this.detail.defaultSupplier
          ),
          flagCom: this.detail.flagCom === 'Y',
          flagDry: this.detail.flagDry === 'Y',
          flagPrd: this.detail.flagPrd === 'Y',
          flagMkt: this.detail.flagMkt === 'Y',
          flagCtr: this.detail.flagCtr === 'Y',
          flagHra: this.detail.flagHra === 'Y',
          flagExpired: this.detail.flagExpired,
          flagBrgBekas: this.detail.flagBrgBekas,
          flagResepProduksi: this.detail.flagResepProduksi,
          flagConversion: this.detail.flagConversion,
          others2: this.detail.others2,
          minStock: this.detail.minStock.toFixed(2),
          maxStock: this.detail.maxStock.toFixed(2),
          minOrder: this.detail.minOrder.toFixed(2),
          satuanMinOrder: this.uomList.find(
            (uom: any) => uom.kodeUom === this.detail.satuanMinOrder
          ),
          panjang: this.detail.panjang.toFixed(2),
          lebar: this.detail.lebar.toFixed(2),
          tinggi: this.detail.tinggi.toFixed(2),
          volume: this.detail.volume.toFixed(6),
          berat: this.detail.berat.toFixed(2),
          lokasiBarang: this.detail.lokasiBarang,
          statusAktif: this.detail.statusAktif,
          keteranganBrg: this.detail.keteranganBrg,
        });
        this.myForm.get('kodeBarang')?.disable();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });

    this.configUomSelect = {
      disabled: true,
      displayKey: 'keteranganUom',
      search: true,
      height: '300px',
      placeholder: 'Pilih Satuan',
    };

    this.configDefaultGudangSelect = {
      disabled: true,
      displayKey: 'kodeSingkat',
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

  getUomList(): Observable<any> {
    return this.service.getUomList();
  }

  getSupplierList(): Observable<any> {
    return this.service.getSupplierList();
  }

  getDefaultOrderGudangList(): Observable<any> {
    return this.service.getDefaultOrderGudangList();
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
        : type == 'numeric'
        ? /^[0-9.]$/
        : type == 'phone'
        ? /^[0-9-]$/
        : type == 'email'
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'excludedSensitive'
        ? /^[a-zA-Z0-9 .,_@-]*$/
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

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid) {
      this.g.markAllAsTouched(this.myForm);
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
          : controls?.['defaultGudang']?.value?.kodeSingkat,
        defaultSupplier: Array.isArray(controls?.['defaultSupplier']?.value)
          ? ''
          : controls?.['defaultSupplier']?.value?.kodeSupplier,
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
        stockOpname: 'T',
        warningExpired: 0,
        unitPrice: 0,
      };
      this.service.insert('/api/product/update', payload).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success('Update Barang Berhasil!');
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
