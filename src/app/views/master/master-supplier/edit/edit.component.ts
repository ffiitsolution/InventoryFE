import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Observable } from 'rxjs';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SUPPLIER } from 'src/constants';

function kodeSupplier(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^0-9\$]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeSupplier: true };
  }
  return null;
}

function kodeSingkat(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9&-\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeSingkat: true };
  }
  return null;
}

function namaSupplier(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9&'/\-+().,\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { namaSupplier: true };
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

function numeric(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /^[0-9]+$/;
  const value = control.value?.trim();
  if (value && !specialCharRegex.test(control.value)) {
    return { numeric: true };
  }
  return null;
}

function phone(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^0-9()-\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { phone: true };
  }
  return null;
}

function contactPerson(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z.\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { contactPerson: true };
  }
  return null;
}

function alphabet(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { alphabet: true };
  }
  return null;
}
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterSupplierEditComponent implements OnInit {
  myForm: FormGroup;
  isSubmitting: boolean = false;
  detail: any;

  rscList: any;
  cityList: any;
  defaultOrderGudangList: any;

  configCitySelect: any;
  configRSCSelect: any;
  configDefaultGudangSelect: any;

  isEmailValid: boolean = true;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService
  ) {
    this.myForm = this.form.group({
      code: ['', [Validators.required, kodeSupplier]],
      name: ['', [Validators.required, namaSupplier]],
      address1: ['', [Validators.required, excludedSensitive]],
      warehouse: [''],
      warehouseDesc: [''],
      address2: ['', [excludedSensitive]],
      city: [''],
      cityDesc: [''],
      pos: ['', numeric],
      telephone1: ['', [phone]],
      telephone2: ['', [phone]],
      contactPerson: ['', [contactPerson]],
      phone: ['', [phone]],
      fax1: ['', [phone]],
      fax2: ['', [phone]],
      email: [''],
      rsc: [''],
      rscDesc: [''],
      status: ['', [Validators.required]],
      desc: ['', [excludedSensitive]],
      dateCreate: [{ value: '', disabled: true }],
      userCreate: [{ value: '', disabled: true }],
      userUpdate: [{ value: '', disabled: true }],
      dateUpdate: [{ value: '', disabled: true }],
      // cad1: [''],
      // cad2: [''],
    });

    this.myForm.get('code')?.disable();
    this.myForm.get('warehouseDesc')?.disable();
    this.myForm.get('cityDesc')?.disable();
    this.myForm.get('rscDesc')?.disable();

    this.myForm.get('warehouse')?.valueChanges.subscribe((value) => {
      this.handleDefaultGudangChange(value);
    });

    this.myForm.get('city')?.valueChanges.subscribe((value) => {
      this.handleCityChange(value);
    });

    this.myForm.get('rsc')?.valueChanges.subscribe((value) => {
      this.handleRSCChange(value);
    });
  }

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_SUPPLIER));

    forkJoin({
      cityList: this.getCityList(),
      rscList: this.getRSCList(),
      defaultOrderGudangList: this.getDefaultOrderGudangList(),
    }).subscribe({
      next: (res) => {
        this.cityList = Array.isArray(res.cityList)
          ? res.cityList.map((item: any) => ({
              ...item,
              name: item.KODE_KOTA + ' - ' + item.KETERANGAN_KOTA,
            }))
          : [];
        this.rscList = Array.isArray(res.rscList)
          ? res.rscList.map((item: any) => ({
              ...item,
              name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
            }))
          : [];
        this.defaultOrderGudangList = Array.isArray(res.defaultOrderGudangList)
          ? res.defaultOrderGudangList?.map((item) => ({
              cad1: item.cad1,
              kodeSingkat: item.kodeSingkat.substring(0, 3),
              name: item.kodeSingkat.substring(0, 3) + ' - ' + item.cad1,
            }))
          : [];

        this.myForm.patchValue({
          code: this.detail.kodeSupplier,
          name: this.detail.namaSupplier,
          address1: this.detail.alamat1,
          warehouse: this.defaultOrderGudangList.find(
            (defaultGudang: any) =>
              defaultGudang.kodeSingkat === this.detail.defaultGudang
          ),
          warehouseDesc: this.detail.keteranganGudang,
          address2: this.detail.alamat2,
          city: this.cityList.find(
            (city: any) => city.KODE_KOTA === this.detail.kota
          ),
          cityDesc: this.detail.keteranganKota,
          pos: this.detail.kodePos,
          telephone1: this.detail.telpon1,
          telephone2: this.detail.telpon2,
          contactPerson: this.detail.contactPerson,
          phone: this.detail.contactPhone,
          fax1: this.detail.fax1,
          fax2: this.detail.fax2,
          email: this.detail.alamatEmail,
          rsc: this.rscList.find(
            (rsc: any) => rsc.KODE_RSC === this.detail.kodeRsc
          ),
          rscDesc: this.detail.keteranganRsc,
          status: this.detail.statusAktif,
          desc: this.detail.keterangan,
          dateCreate: this.detail.dateCreate,
          userCreate: this.detail.userCreate,
          userUpdate: this.detail.userUpdate,
          dateUpdate: this.detail.dateUpdate,
        });
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
    });

    this.configCitySelect = {
      disabled: true,
      displayKey: 'name',
      search: true,
      height: '300px',
      placeholder: 'Pilih Kota',
    };

    this.configDefaultGudangSelect = {
      disabled: true,
      displayKey: 'name',
      search: true,
      height: '300px',
      placeholder: 'Pilih Default Gudang',
    };

    this.configRSCSelect = {
      disabled: true,
      displayKey: 'name',
      search: true,
      height: '300px',
      placeholder: 'Pilih RSC',
    };
  }

  getCityList(): Observable<any> {
    return this.service.getCityList({});
  }

  getRSCList(): Observable<any> {
    return this.service.getRSCList({});
  }

  getDefaultOrderGudangList(): Observable<any> {
    return this.service.getDefaultOrderGudangList();
  }

  handleDefaultGudangChange(value: any) {
    const gudangMapping: { [key: string]: string } = {
      COM: 'GD. COMMISARY',
      CTR: 'GD. CATERING',
      DRY: 'GD. DRY GOODS',
      FSD: 'FACILITY SUPPORT DEPT',
      HBD: 'HOME DELIVERY & BOX',
      HRA: 'HRA',
      MKT: 'GD. MARKETING',
      PRD: 'GD. PRODUKSI',
    };
    const warehouseDesc = gudangMapping[value.kodeSingkat] || 'OTHER';

    this.myForm.patchValue({
      warehouseDesc: warehouseDesc,
    });
  }

  handleCityChange(value: any) {
    this.myForm.patchValue({
      cityDesc: value.KETERANGAN_KOTA,
    });
  }

  handleRSCChange(value: any) {
    this.myForm.patchValue({
      rscDesc: value.KETERANGAN_RSC,
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

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'kodeSupplier' //kode supplier
        ? /^[0-9\$]$/
        : type == 'namaSupplier' //nama cabang
        ? /^[a-zA-Z0-9-+().,&/ '\-]*$/
        : type == 'kodeSingkat' //kode singkat
        ? /^[A-Z0-9&-]$/
        : type == 'numeric' //kode pos
        ? /^[0-9]$/
        : type == 'phone' //phone 1 & 2, Fax 1 & 2
        ? /^[0-9-()\s]$/
        : type == 'email' //email
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'contactPerson' //contactPerson
        ? /^[a-zA-Z.\s]$/
        : type == 'excludedSensitive' //keterangan & alamat 1-2
        ? /^[a-zA-Z0-9&\s.,#\-()\/]+$/
        : /^[a-zA-Z.() ,\-]*$/; //alphabet
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  onChangeEmail(event: any) {
    const email = this.myForm.get('email')?.value;

    // Email validation regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      this.isEmailValid = false;
    } else {
      this.isEmailValid = true;
    }
    if (email == '') {
      this.isEmailValid = true;
    }
  }

  convertToUppercase(id: any) {
    const control = this.myForm.get(id);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SUPPLIER);
    this.router.navigate(['/master/master-supplier']);
  }

  onEditPressed() {
    this.router.navigate(['/master/master-supplier/edit']);
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;
    if (invalid || !this.isEmailValid) {
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
            control.hasError('phone')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('kodeCabang')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('namaCabang')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('numeric')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('kodeSingkat')
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
        kodeSupplier: controls?.['code']?.value,
        namaSupplier: controls?.['name']?.value,
        alamat1: controls?.['address1']?.value,
        alamat2: controls?.['address2']?.value,
        kota: Array.isArray(controls?.['city']?.value)
          ? ''
          : controls?.['city']?.value?.KODE_KOTA
          ? controls?.['city']?.value?.KODE_KOTA
          : '',
        kodePos: controls?.['pos']?.value,
        telpon1: controls?.['telephone1']?.value,
        telpon2: controls?.['telephone2']?.value,
        fax1: controls?.['fax1']?.value,
        fax2: controls?.['fax2']?.value,
        alamatEmail: controls?.['email']?.value,
        defaultGudang: Array.isArray(controls?.['warehouse']?.value)
          ? ''
          : controls?.['warehouse']?.value?.kodeSingkat
          ? controls?.['warehouse']?.value?.kodeSingkat
          : '',
        kodeRsc: Array.isArray(controls?.['rsc']?.value)
          ? ''
          : controls?.['rsc']?.value?.KODE_RSC
          ? controls?.['rsc']?.value?.KODE_RSC
          : '',
        contactPerson: controls?.['contactPerson']?.value,
        contactPhone: controls?.['phone']?.value,
        statusAktif: controls?.['status']?.value,
        keterangan: controls?.['desc']?.value,
        // cad1: controls?.['cad1']?.value,
        // cad2: controls?.['cad2']?.value,
      };
      this.service.insert('/api/supplier/update', payload).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
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
