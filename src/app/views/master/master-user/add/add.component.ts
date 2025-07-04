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
import { finalize } from 'rxjs';

function noSpecialCharacters(
  control: AbstractControl
): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9\s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { specialCharNotAllowed: true };
  }
  return null;
}

function noSpecialCharactersExcept(
  control: AbstractControl
): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9.() ,\-s]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { specialCharNotAllowedExcept: true };
  }
  return null;
}

function jabatan(control: AbstractControl): ValidationErrors | null {
  const specialCharRegex = /[^a-zA-Z0-9._-\s.]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { jabatan: true };
  }
  return null;
}

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss',
})
export class MasterUserAddComponent implements OnInit {
  myForm: FormGroup;
  adding: boolean = false;
  showPassword: boolean = false;
  showConfirmationPassword: boolean = false;
  listLokasi: any[] = [];
  listDefaultLokasi: any[] = [];
  baseConfig: any = {
    displayKey: 'name', // Key to display in the dropdown
    search: true, // Enable search functionality
    height: '200px', // Dropdown height
    customComparator: () => {}, // Custom sorting comparator
    moreText: 'lebih banyak', // Text for "more" options
    noResultsFound: 'Tidak ada hasil', // Text when no results are found
    searchOnKey: 'name', // Key to search
  };
  configSelectDefaultLokasi: any;
  configSelectRole: any;
  configSelectPosition: any;
  configSelectLokasi: any;
  isNotMatchPass: boolean = false;
  listRole: any[] = [];
  listPosition: any[] = [];
  listuserLoc: any[] = [];
  detail: any;
  selectedLocations: any;

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
      kodeUser: ['', [Validators.required, noSpecialCharacters]],
      namaUser: ['', [Validators.required, noSpecialCharactersExcept]],
      kodePassword: ['', Validators.required],
      konfirmasiKodePassword: ['', Validators.required],
      statusAktif: ['', Validators.required],
      defaultLocation: [{}],
      jabatan: [''],
      roleID: [''],
      location: [],
      companyProfile: [true],
      maintenancePassword: [true],
      masterCabang: [true],
      masterSupplier: [true],
      masterBarang: [true],
      masterLain: [true],
      pembelian: [true],
      penerimaan: [true],
      pengiriman: [true],
      barangRusak: [true],
      penyesuaianStock: [true],
      returBarang: [true],
      produksi: [true],
      barangBekas: [true],
      stockOpname: [true],
      usulOrder: [true],
      listingMaster: [true],
      laporanTransaksi: [true],
      closing: [true],
      backupData: [true],
      utility: [true],
    });

    this.configSelectDefaultLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Default Lokasi',
      searchPlaceholder: 'Cari Default Lokasi',
      limitTo: this.listLokasi.length,
    };
    this.configSelectRole = {
      ...this.baseConfig,
      placeholder: 'Pilih Role',
      searchPlaceholder: 'Cari Role',
      limitTo: this.listRole.length,
    };
    this.configSelectPosition = {
      ...this.baseConfig,
      placeholder: 'Pilih Jabatan',
      searchPlaceholder: 'Cari Jabatan',
      limitTo: this.listPosition.length,
    };
    this.configSelectLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Lokasi',
      searchPlaceholder: 'Cari Lokasi',
      limitTo: this.listLokasi.length,
    };

    this.dataService
      .postData(this.g.urlServer + '/api/location/dropdown-lokasi', {})
      .subscribe((resp: any) => {
        this.listLokasi = resp.map((item: any) => ({
          id: item.KODE_LOCATION,
          name: item.KODE_LOCATION + ' - ' + item.KETERANGAN_LOKASI,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/role/dropdown-role', {})
      .subscribe((resp: any) => {
        this.listRole = resp.map((item: any) => ({
          id: item.ID,
          name: item.NAME,
        }));
      });

    this.dataService
      .postData(this.g.urlServer + '/api/position/dropdown-position', {})
      .subscribe((resp: any) => {
        this.listPosition = resp.map((item: any) => ({
          id: item.CODE,
          name: item.DESCRIPTION,
        }));
      });
  }

  onSubmit(): void {
    const { controls, invalid } = this.myForm;

    if (invalid || this.isNotMatchPass) {
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
            control.hasError('specialCharNotAllowed')
          ) ||
          Object.values(controls).some((control) =>
            control.hasError('specialCharNotAllowedExcept')
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
        kodeUser: controls?.['kodeUser']?.value,
        kodePassword: controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value?.id ?? ' ',
        defaultLocation: controls?.['defaultLocation']?.value?.id ?? ' ',
        roleID: controls?.['roleID']?.value?.id,
        companyProfile: controls?.['companyProfile']?.value ? 'Y' : 'N',
        maintenancePassword: controls?.['maintenancePassword']?.value
          ? 'Y'
          : 'N',
        masterCabang: controls?.['masterCabang']?.value ? 'Y' : 'N',
        masterSupplier: controls?.['masterSupplier']?.value ? 'Y' : 'N',
        masterBarang: controls?.['masterBarang']?.value ? 'Y' : 'N',
        masterLain: controls?.['masterLain']?.value ? 'Y' : 'N',
        pembelian: controls?.['pembelian']?.value ? 'Y' : 'N',
        penerimaan: controls?.['penerimaan']?.value ? 'Y' : 'N',
        pengiriman: controls?.['pengiriman']?.value ? 'Y' : 'N',
        barangRusak: controls?.['barangRusak']?.value ? 'Y' : 'N',
        penyesuaianStock: controls?.['penyesuaianStock']?.value ? 'Y' : 'N',
        returBarang: controls?.['returBarang']?.value ? 'Y' : 'N',
        produksi: controls?.['produksi']?.value ? 'Y' : 'N',
        barangBekas: controls?.['barangBekas']?.value ? 'Y' : 'N',
        stockOpname: controls?.['stockOpname']?.value ? 'Y' : 'N',
        usulOrder: controls?.['usulOrder']?.value ? 'Y' : 'N',
        listingMaster: controls?.['listingMaster']?.value ? 'Y' : 'N',
        laporanTransaksi: controls?.['laporanTransaksi']?.value ? 'Y' : 'N',
        closing: controls?.['closing']?.value ? 'Y' : 'N',
        backupData: controls?.['backupData']?.value ? 'Y' : 'N',
        utility: controls?.['utility']?.value ? 'Y' : 'N',
      };
      this.service
        .insert('/api/users', param)
        .pipe(
          // Pastikan `adding = false` setelah request selesai
          finalize(() => {
            this.adding = false;
          })
        )
        .subscribe({
          next: (res) => {
            console.log(res);
            if (!res.success) {
              this.service.handleErrorResponse(res);
              this.adding = false;
            } else {
              this.toastr.success('Berhasil!');
              setTimeout(() => {
                this.onPreviousPressed();
              }, DEFAULT_DELAY_TIME);
            }
            this.adding = false;
          },
        });

      if (controls?.['location']?.value) {
        const paramsUserLoc = {
          kodeUser: controls?.['kodeUser']?.value,
          statusSync: 'T',
          ListKodeLocation: controls?.['location']?.value?.map(
            (item: any) => item.id
          ) || [''],
        };

        this.service
          .insert('/api/user-location/updateBatch', paramsUserLoc)
          .subscribe({
            next: (res: any) => {
              if (!res.success) {
                this.service.handleErrorResponse(res);
              }
            },
            error: (err: any) => {
              console.error('Error updating user location:', err);
              console.log('An error occurred while updating the use locationr.');
              this.adding = false;
            },
          });
      }
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_SET_NUMBER);
    this.router.navigate(['/master/master-user']);
  }

  isFieldValid(fieldName: String) {
    return this.g.isFieldValid(this.myForm, fieldName);
  }

  togglePasswordVisibility(field: any): void {
    if (field == 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmationPassword = !this.showConfirmationPassword;
    }
  }

  onChangeSelect(data: any, field: string) {
    const dataStatus = data?.target?.value;
    this.myForm.get('statusAktif')?.setValue(dataStatus);
  }

  conditionInput(event: any, type: string): boolean {
    var inp = String.fromCharCode(event.keyCode);
    let temp_regex =
      type == 'alphanumeric'
        ? /[a-zA-Z0-9]/
        : type == 'jabatan'
        ? /[a-zA-Z-_\s.]/
        : type == 'numeric'
        ? /[0-9]/
        : /^[a-zA-Z.() ,\-]*$/;
    if (temp_regex.test(inp)) return true;
    else {
      event.preventDefault();
      return false;
    }
  }

  onChangePassword(data: any, type: string) {
    if (type === 'user') {
      if (
        this.myForm.value.kodePassword != '' &&
        this.myForm.value.konfirmasiKodePassword != '' &&
        this.myForm.value.kodePassword !=
          this.myForm.value.konfirmasiKodePassword
      ) {
        this.isNotMatchPass = true;
      } else {
        this.isNotMatchPass = false;
      }
    }
  }
  onChangeLocation(selected: any) {
    const defaultLocationId = this.myForm.get('defaultLocation')?.value?.id;
    this.listDefaultLokasi = selected;
    console.log('selected', selected);
    if (
      selected.some(
        (item: { id: string; name: string }) => item.id === defaultLocationId
      ) == false
    ) {
      this.myForm.get('defaultLocation')?.setValue('');
    }
    // You can perform further actions here
  }
}
