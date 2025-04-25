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
import {
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_SET_NUMBER,
  LS_INV_SELECTED_BRANCH,
} from 'src/constants';
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
  const specialCharRegex = /^[0-9\s]+$/;
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
  const specialCharRegex = /[^a-zA-Z\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { alphabet: true };
  }
  return null;
}

function ip(control: AbstractControl): ValidationErrors | null {
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}$/;
  const value = control.value?.trim();

  if (value && !ipRegex.test(control.value)) {
    return { ip: true };
  }
  return null;
}

function port(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim();

  // Jika kosong, valid (misalnya opsional)
  if (!value) return null;

  // Harus angka
  if (!/^[0-9]+$/.test(value)) {
    return { port: true };
  }

  // Ubah ke number dan cek rentang valid port
  const portNumber = Number(value);
  if (portNumber < 1 || portNumber > 65535) {
    return { port: true };
  }

  return null;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterBranchEditComponent implements OnInit {
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
  detail: any;
  group: any;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.group = this.g.getLocalstorage('inv_tab_title');
    let kodeGroup;
    if (this.group === 'Branch') {
      kodeGroup = 'C';
    } else if (this.group === 'Department') {
      kodeGroup = 'D';
    } else if (this.group === 'Gudang') {
      kodeGroup = 'G';
    }

    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_BRANCH));

    this.myForm = this.form.group({
      namaCabang: [this.detail.namaCabang, [Validators.required, namaCabang]],
      kodeCabang: [
        { value: this.detail.kodeCabang, disabled: true },
        [Validators.required, kodeCabang],
      ],
      kodeSingkat: [
        this.detail.kodeSingkat,
        [Validators.required, kodeSingkat],
      ],
      kodeGroup: [this.detail.kodeGroup, Validators.required],
      deskripsiGroup: [this.detail.deskripsiGroup],
      kota: [this.detail.kota],
      alamat1: [this.detail.alamat1, [Validators.required, excludedSensitive]],
      alamat2: [this.detail.alamat2, [excludedSensitive]],
      kodePos: [this.detail.kodePos, [numeric]],
      telpon1: [this.detail.telpon1, [phone]],
      telpon2: [this.detail.telpon2, [phone]],
      fax1: [this.detail.fax1, [phone]],
      fax2: [this.detail.fax2, [phone]],
      alamatEmail: [this.detail.alamatEmail],
      keteranganRsc: [this.detail.keteranganRsc],
      kodeRegion: [this.detail.kodeRegion],
      keteranganRegion: [this.detail.keteranganRegion],
      kodeArea: [this.detail.kodeArea],
      keteranganArea: [this.detail.keteranganArea],
      contactPerson: [this.detail.contactPerson, [contactPerson]],
      contactPhone: [this.detail.contactPhone, [phone]],
      keterangan: [this.detail.keterangan, [excludedSensitive]],
      alamatIp: [this.detail.alamatIp],
      tipeCabang: [this.detail.tipeCabang, [alphabet]],
      status: [this.detail.statusAktif, [Validators.required]],
      statusAktif: [this.detail.statusAktif],
      ip: [this.detail.alamatIp, [ip]],
      port: [this.detail.alamatPort, [port]],
      cad1: [this.detail.cad1, [namaCabang]],
      userCreate: [this.detail.userCreate],
      userUpdate: [this.detail.userUpdate],
      dateCreate: [this.detail.dateCreate],
      dateupdate: [this.detail.dateUpdate],
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
        const getKota = this.listKota.find(
          (item: any) => item.id === this.detail.kota
        );
        this.myForm.get('kota')?.setValue(getKota);
      });

    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.listRSC = resp.map((item: any) => ({
          id: item.KODE_RSC,
          name: item.KODE_RSC + ' - ' + item.KETERANGAN_RSC,
        }));
        const getRSC = this.listRSC.find(
          (item: any) => item.id === this.detail.kodeRsc
        );
        this.myForm.get('keteranganRsc')?.setValue(getRSC);
      });

    this.dataService
      .postData(this.g.urlServer + '/api/region/dropdown-region', {})
      .subscribe((resp: any) => {
        this.listRegion = resp.map((item: any) => ({
          id: item.KODE_REGION,
          name: item.KODE_REGION + ' - ' + item.KETERANGAN_REGION,
        }));
        const getRegion = this.listRegion.find(
          (item: any) => item.id === this.detail.kodeRegion
        );
        this.myForm.get('keteranganRegion')?.setValue(getRegion);
      });

    this.dataService
      .postData(this.g.urlServer + '/api/area/dropdown-area', {})
      .subscribe((resp: any) => {
        this.listArea = resp.map((item: any) => ({
          id: item.KODE_AREA,
          name: item.KODE_AREA + ' - ' + item.KETERANGAN_AREA,
        }));
        const getArea = this.listArea.find(
          (item: any) => item.id === this.detail.kodeArea
        );
        this.myForm.get('keteranganArea')?.setValue(getArea);
      });

    this.dataService
      .postData(this.g.urlServer + '/api/branch/dropdown-group', {})
      .subscribe((resp: any) => {
        this.kodeGroupOptions = resp.map((item: any) => ({
          value: item.KODE_GROUP,
          label: item.DESKRIPSI_GROUP,
        }));
        // const getGroup = this.kodeGroupOptions.find(
        //   (item: any) => item.id === this.detail.kodeGroup
        // );
        // this.myForm.get('kodeGroup')?.setValue(getGroup);
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
        port: controls?.['port']?.value,
        ip: controls?.['ip']?.value,
        cad1: controls?.['cad1']?.value,
      };
      this.service.insert('/api/branch/update', param).subscribe({
        next: (res) => {
          if (!res.success) {
            this.service.handleErrorResponse(res);
          } else {
            this.toastr.success('Berhasil!');
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.adding = false;
        },
      });
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
        ? /^[0-9\s]$/
        : type == 'phone' //phone 1 & 2, Fax 1 & 2
        ? /^[0-9-()\s]$/
        : type == 'email' //email
        ? /^[a-zA-Z0-9@._-]$/
        : type == 'contactPerson' //contactPerson
        ? /^[a-zA-Z./s]$/
        : type == 'alphabet' //tipe cabang
        ? /^[a-zA-Z/s]+$/
        : type == 'excludedSensitive' //keterangan & alamat 1-2
        ? /^[a-zA-Z0-9\s.,#\-()\/]+$/
        : type == 'ip'
        ? /^[0-9.]$/
        : type == 'port'
        ? /^[0-9]$/
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
