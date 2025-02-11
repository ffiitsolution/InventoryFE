import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SUPPLIER } from 'src/constants';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterSupplierAddComponent implements OnInit {
  myForm: FormGroup;
  isSubmitting: boolean = false;

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
      code: ['', Validators.required],
      name: ['', Validators.required],
      address1: ['', Validators.required],
      warehouse: [''],
      warehouseDesc: [''],
      address2: [''],
      city: [''],
      cityDesc: [''],
      pos: [''],
      telephone1: [''],
      telephone2: [''],
      contactPerson: [''],
      phone: [''],
      fax1: [''],
      fax2: [''],
      email: [''],
      rsc: [''],
      rscDesc: [''],
      status: ['A'],
      desc: [''],
      // cad1: [''],
      // cad2: [''],
    });

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
    this.getDefaultOrderGudangList();
    this.getCityList();
    this.getRSCList();

    this.configCitySelect = {
      disabled: true,
      displayKey: 'name',
      search: true,
      height: '300px',
      placeholder: 'Pilih Kota',
    };

    this.configDefaultGudangSelect = {
      disabled: true,
      displayKey: 'kodeSingkat',
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

  getCityList() {
    this.service.getCityList({}).subscribe((res: any) => {
      this.cityList = res.map((item: any) => ({
        ...item,
        name: item.KODE_KOTA + ' - ' + item.KETERANGAN_KOTA,
      }));
    });
  }

  getRSCList() {
    this.service.getRSCList({}).subscribe((res: any) => {
      this.rscList = res.map((item: any) => ({
        ...item,
        name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
      }));
    });
  }

  getDefaultOrderGudangList() {
    this.service.getDefaultOrderGudangList().subscribe((res: any) => {
      this.defaultOrderGudangList = res.map((item: any) => ({
        cad1: item.cad1,
        kodeSingkat: item.kodeSingkat.substring(0, 3),
      }));
    });
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
      type == 'alphanumeric'
        ? /^[a-zA-Z0-9]$/
        : type == 'numeric'
        ? /^[0-9]$/
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

  onChangeEmail(event: any) {
    const email = this.myForm.get('email')?.value;
  
    // Email validation regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!emailPattern.test(email)) {
      this.isEmailValid = false
    } else {
      this.isEmailValid = true
    }
    if(email ==''){
      this.isEmailValid = true
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
    } else {
      this.isSubmitting = true;
      const payload = {
        kodeSupplier: controls?.['code']?.value,
        namaSupplier: controls?.['name']?.value,
        alamat1: controls?.['address1']?.value,
        alamat2: controls?.['address2']?.value,
        kota: Array.isArray(controls?.['city']?.value)
          ? ''
          : controls?.['city']?.value?.KODE_KOTA ? controls?.['city']?.value?.KODE_KOTA : '',
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
      this.service.insert('/api/supplier/insert', payload).subscribe({
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
