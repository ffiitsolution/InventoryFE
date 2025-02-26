import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_SET_NUMBER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';

function kodeCabang(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeCabang: true };
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

function namaCabang(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9&\-().\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { namaCabang: true };
  }
  return null;
}

function excludedSensitive(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9\s.,#\-()\/]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { excludedSensitive: true };
  }
  return null;
}

function numeric(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /^[0-9]+$/;
  if (control.value && !specialCharRegex.test(control.value)) {
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
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterBranchAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  showPassword: boolean = false;
  listKota: any[] = [];
  listRSC: any[] = [];
  listRegion: any[] = [];
  listArea: any[] = [];
  isEmailValid: boolean = true;
  kodeGroupOptions: any;

  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };

  configSelectKota: any;
  configSelectRSC: any;
  configSelectRegion: any;
  configSelectArea: any;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.myForm = this.form.group({
      namaCabang: ['', [Validators.required, namaCabang]],
      kodeCabang: ['', [Validators.required, kodeCabang]],
      kodeSingkat: ['', [Validators.required, kodeSingkat]],
      kodeGroup: ['', Validators.required],
      kota: [''],
      alamat1: ['', [Validators.required, excludedSensitive]],
      alamat2: ['', [excludedSensitive]],
      kodePos: ['', [numeric]],
      telpon1: ['', [phone]],
      telpon2: ['', [phone]],
      fax1: ['', [phone]],
      fax2: ['', [phone]],
      alamatEmail: [''],
      keteranganRsc: [''],
      kodeRegion: [''],
      keteranganRegion: [''],
      kodeArea: [''],
      keteranganArea: [''],
      contactPerson: ['', [contactPerson]],
      contactPhone: ['', [phone]],
      keterangan: ['', [excludedSensitive]],
      tipeCabang: ['', [alphabet]],
      statusAktif: ['', [Validators.required]],
      userCreate: [''],
      userUpdate: [''],
      dateCreate: [''],
      dateupdate: [''],
    });

    this.configSelectKota = {
      ...this.baseConfig,
      placeholder: 'Pilih Kota',
      searchPlaceholder: 'Cari Kota',
      limitTo: this.listKota.length,
    };

    this.configSelectRSC = {
      ...this.baseConfig,
      placeholder: 'Pilih RSC',
      searchPlaceholder: 'Cari RSC',
      limitTo: this.listRSC.length,
    };

    this.configSelectRegion = {
      ...this.baseConfig,
      placeholder: 'Pilih Region',
      searchPlaceholder: 'Cari Region',
      limitTo: this.listRegion.length,
    };

    this.configSelectArea = {
      ...this.baseConfig,
      placeholder: 'Pilih Area',
      searchPlaceholder: 'Cari Area',
      limitTo: this.listArea.length,
    };

    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.listKota = resp.map((item: any) => ({
          id: item.KODE_KOTA,
          name: item.KODE_KOTA + ' - ' + item.KETERANGAN_KOTA,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.listRSC = resp.map((item: any) => ({
          id: item.KODE_RSC,
          name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/region/dropdown-region', {})
      .subscribe((resp: any) => {
        this.listRegion = resp.map((item: any) => ({
          id: item.KODE_REGION,
          name: item.KODE_REGION + ' - ' + item.KETERANGAN_REGION,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/area/dropdown-area', {})
      .subscribe((resp: any) => {
        this.listArea = resp.map((item: any) => ({
          id: item.KODE_AREA,
          name: item.KODE_AREA + ' - ' + item.KETERANGAN_AREA,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/branch/dropdown-group', {})
      .subscribe((resp: any) => {
        this.kodeGroupOptions = resp.map((item: any) => ({
          value: item.KODE_GROUP,
          label: item.DESKRIPSI_GROUP,
        }));
      });
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
      this.adding = true;
      const param = {
        namaCabang: controls?.['namaCabang']?.value,
        kodeCabang: controls?.['kodeCabang']?.value,
        kodeSingkat: controls?.['kodeSingkat']?.value,
        kota: controls?.['kota']?.value?.id,
        alamat1: controls?.['alamat1']?.value,
        alamat2: controls?.['alamat2']?.value,
        kodePos: controls?.['kodePos']?.value,
        telpon1: controls?.['telpon1']?.value,
        telpon2: controls?.['telpon2']?.value,
        fax1: controls?.['fax1']?.value,
        fax2: controls?.['fax2']?.value,
        alamatEmail: controls?.['alamatEmail']?.value,
        kodeRsc: controls?.['keteranganRsc']?.value?.id,
        kodeRegion: controls?.['keteranganRegion']?.value?.id,
        kodeArea: controls?.['keteranganArea']?.value?.id,
        contactPerson: controls?.['contactPerson']?.value,
        contactPhone: controls?.['contactPhone']?.value,
        tipeCabang: controls?.['tipeCabang']?.value,
        keterangan: controls?.['keterangan']?.value,
        kodeGroup: controls?.['kodeGroup']?.value,
        statusAktif: controls?.['statusAktif']?.value,
      };
      console.log(param);
      // this.service.insert('/api/branch/insert', param).subscribe({
      //   next: (res) => {
      //     if (!res.success) {
      //       alert(res.message);
      //     } else {
      //       this.toastr.success('Berhasil!');
      //       setTimeout(() => {
      //         this.onPreviousPressed();
      //       }, DEFAULT_DELAY_TIME);
      //     }
      //     this.adding = false;
      //   },
      // });
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/master/master-branch']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;
    this.myForm.get('statusAktif')?.setValue(dataStatus);
  }
  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric' //kode cabang
        ? /^[a-zA-Z0-9]$/
        : type == 'namaCabang' //nama cabang
        ? /^[a-zA-Z0-9-().& \-]*$/
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
        : type == 'alphabet' //tipe cabang
        ? /^[a-zA-Z]+$/
        : type == 'excludedSensitive' //keterangan & alamat 1-2
        ? /^[a-zA-Z0-9\s.,#\-()\/]+$/
        : /^[a-zA-Z.() ,\-]*$/; //alphabet

    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  onChangeEmail(event: any) {
    const email = this.myForm.value.alamatEmail;

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
}
