import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import {
  DEFAULT_DELAY_TIME,
  LS_INV_SELECTED_LOCATION,
  LS_INV_SELECTED_RSC,
} from 'src/constants';
import { DataService } from 'src/app/service/data.service';


function kodeLocation(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^0-9]+$/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeLocation: true };
  }
  return null;
}

function kodeInisial(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^A-Z]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { kodeInisial: true };
  }
  return null;
}

function keteranganLokasi(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^A-Z0-9-\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { keteranganLokasi: true };
  }
  return null;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterLocationEditComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;

  configSelectCity: any = {};
  listCity: any[] = [];
  listRsc: any[] = [];

  detail: any;

  constructor(
    private toastr: ToastrService,
    private form: FormBuilder,
    private router: Router,
    private g: GlobalService,
    private service: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_LOCATION));
    this.myForm = this.form.group({
      kodeLocation: [this.detail.kodeLocation, [kodeLocation]],
      kodeInisial: [this.detail.kodeInisial, [kodeInisial]],
      keteranganLokasi: [this.detail.keteranganLokasi, [keteranganLokasi]],
      lokasiGudang: [],
      defaultRsc: [],
      supportTo: [this.detail.keteranganRsc],
    });

    this.myForm.get('kodeLocation')?.disable();

    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.listCity = resp.map((item: any) => ({
          name: item.KETERANGAN_KOTA,
          id: item.KETERANGAN_KOTA,
        }));
        this.myForm
          .get('lokasiGudang')
          ?.setValue(
            this.listCity.find((x) => x.name == this.detail.lokasiGudang)
          );
      });

    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.listRsc = resp.map((item: any) => ({
          name: item.KETERANGAN_RSC,
          code: item.KODE_RSC,
          id: item.KODE_RSC,
        }));
        this.myForm
          .get('defaultRsc')
          ?.setValue(this.listRsc.find((x) => x.id == this.detail.defaultRsc));
      });

    this.getSelectCityConfig();
    // this.getCityDropdown();
    // this.getRscDropdown();
  }

  getSelectCityConfig() {
    this.configSelectCity = {
      displayKey: 'name', // Key to display in the dropdown
      search: true, // Enable search functionality
      height: '200px', // Dropdown height
      placeholder: 'Pilih', // Placeholder text
      customComparator: () => {}, // Custom sorting comparator
      limitTo: 8, // Limit the number of displayed options
      moreText: 'lebih banyak', // Text for "more" options
      noResultsFound: 'Tidak ada hasil', // Text when no results are found
      searchPlaceholder: 'Cari Lokasi', // Placeholder for the search input
      searchOnKey: 'name', // Key to search
    };
  }

  getCityDropdown() {
    this.dataService
      .postData(this.g.urlServer + '/api/city/dropdown-city', {})
      .subscribe((resp: any) => {
        this.listCity = resp.map((item: any) => ({
          name: item.KETERANGAN_KOTA,
          id: item.KETERANGAN_KOTA,
        }));
      });
  }

  getRscDropdown() {
    this.dataService
      .postData(this.g.urlServer + '/api/rsc/dropdown-rsc', {})
      .subscribe((resp: any) => {
        this.listRsc = resp.map((item: any) => ({
          name: item.KETERANGAN_RSC,
          code: item.KODE_RSC,
          id: item.KODE_RSC,
        }));
      });
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
            control.hasError('kodeLocation')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('kodeInisial')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('keteranganLokasi')
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
        user: this.g.getLocalstorage('inv_currentUser')?.kodeUser,
        kodeLocation: controls?.['kodeLocation']?.value,
        kodeInisial: controls?.['kodeInisial']?.value,
        keteranganLokasi: controls?.['keteranganLokasi']?.value,
        lokasiGudang: controls?.['lokasiGudang']?.value.id,
        defaultRsc: controls?.['defaultRsc']?.value.code,
        supportTo: 'D',
        statusSync: 'T',
        mainMenu: 'T',
      };
      this.service.insert('/api/location/update', param).subscribe({
        next: (res) => {
          if (!res.success) {
            alert(res.message);
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
    localStorage.removeItem(LS_INV_SELECTED_RSC);
    this.router.navigate(['/master/master-location']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  convertToUppercase(id: any) {
    const control = this.myForm.get(id);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric' // Keterangan Lokasi
        ? /^[a-zA-Z0-9-\s]$/
        : type == 'numeric' //Kode Lokasi
        ? /^[0-9]$/
        : type == 'kodeInisial' //Kode Inisial
        ? /^[A-Z]+$/
        : /^[a-zA-Z.() ,\-]*$/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }
}
