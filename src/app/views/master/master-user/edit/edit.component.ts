import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/service/app.service';
import { GlobalService } from 'src/app/service/global.service';
import { DEFAULT_DELAY_TIME, LS_INV_SELECTED_USER } from 'src/constants';
import { DataService } from 'src/app/service/data.service';

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
  const specialCharRegex = /[^a-zA-Z_-\s.]/;
  if (control.value && specialCharRegex.test(control.value)) {
    return { jabatan: true };
  }
  return null;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class MasterUserEditComponent implements OnInit {
  myForm: FormGroup;
  editing: boolean = false;
  detail: any;
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
  configSelectLokasi: any;
  configSelectRole: any;
  configSelectPosition: any;

  selectedLocations: any;

  isNotMatchPass: boolean = false;
  isNotMatchPassPos: boolean = false;
  showPassword: boolean = false;
  showConfirmationPassword: boolean = false;
  listRole: any[] = [];

  listuserLoc: any[] = [];
  listPosition: any[] = [];

  constructor(
    private form: FormBuilder,
    private router: Router,
    private service: AppService,
    private g: GlobalService,
    private toastr: ToastrService,
    private translation: TranslateService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.detail = JSON.parse(this.g.getLocalstorage(LS_INV_SELECTED_USER));
    this.myForm = this.form.group({
      kodeUser: [
        { value: this.detail.kodeUser, disabled: true },
        Validators.required,
      ],
      namaUser: [
        this.detail.namaUser,
        [Validators.required, noSpecialCharactersExcept],
      ],
      kodePassword: [this.detail.kodePassword, Validators.required],

      konfirmasiKodePassword: [this.detail.kodePassword, Validators.required],
      statusAktif: [this.detail.statusAktif],
      jabatan: [],
      defaultLocation: [{}],
      roleID: [],
      location: [],
    });

    this.configSelectLokasi = {
      ...this.baseConfig,
      placeholder: 'Pilih Lokasi',
      searchPlaceholder: 'Cari Lokasi',
      limitTo: this.listLokasi.length,
    };

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
      placeholder: 'Pilih Position',
      searchPlaceholder: 'Cari Position',
      limitTo: this.listPosition.length,
    };

    this.dataService
      .postData(this.g.urlServer + '/api/location/dropdown-lokasi', {})
      .subscribe((resp: any) => {
        this.listLokasi = resp.map((item: any) => ({
          id: item.KODE_LOCATION,
          name: item.KODE_LOCATION + ' - ' + item.KETERANGAN_LOKASI,
        }));
        const getDefaultLocation = this.listLokasi.find(
          (item: any) => item.id === this.detail.defaultLocation
        );
        this.myForm.get('defaultLocation')?.setValue(getDefaultLocation);

        this.dataService
          .postData(this.g.urlServer + '/api/user-location/by-user', {
            kodeUser: this.detail.kodeUser,
          })
          .subscribe((resp: any) => {
            this.listuserLoc = resp;

            const listuserLocArray = this.listuserLoc.map(
              (item) => item.KODE_LOCATION
            );

            const filteredLokasiByUserLoc = this.listLokasi.filter((item) =>
              listuserLocArray.includes(item.id)
            );
            this.listDefaultLokasi = filteredLokasiByUserLoc;
            this.myForm.get('location')?.setValue(filteredLokasiByUserLoc);
          });
      });

    this.dataService
      .postData(this.g.urlServer + '/api/role/dropdown-role', {})
      .subscribe((resp: any) => {
        this.listRole = resp.map((item: any) => ({
          id: item.ID,
          name: item.NAME,
        }));
        const getRoleID = this.listRole.find(
          (item: any) => Number(item.id) === Number(this.detail.roleId)
        );
        this.myForm.get('roleID')?.setValue(getRoleID);
      });

    this.dataService
      .postData(this.g.urlServer + '/api/position/dropdown-position', {})
      .subscribe((resp: any) => {
        this.listPosition = resp.map((item: any) => ({
          id: item.CODE,
          name: item.DESCRIPTION,
        }));
        const getPositionID = this.listPosition.find(
          (item: any) => Number(item.id) === Number(this.detail.jabatan)
        );
        this.myForm.get('jabatan')?.setValue(getPositionID);
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
      this.editing = true;
      const param = {
        kodeUser: controls?.['kodeUser']?.value,
        kodePassword: controls?.['kodePassword']?.value,
        namaUser: controls?.['namaUser']?.value,
        statusAktif: controls?.['statusAktif']?.value,
        jabatan: controls?.['jabatan']?.value?.id ?? ' ',
        defaultLocation: controls?.['defaultLocation']?.value?.id ?? ' ',
        roleID: controls?.['roleID']?.value?.id ?? ' ',
      };
      this.service.patch('/api/users/current', param).subscribe({
        next: (res: any) => {
          if (!res.success) {
            alert(res.message);
          } else {
            this.toastr.success(this.translation.instant('Berhasil!'));
            setTimeout(() => {
              this.onPreviousPressed();
            }, DEFAULT_DELAY_TIME);
          }
          this.editing = false;
        },
        error: (err: any) => {
          console.error('Error updating user:', err);
          alert('An error occurred while updating the user.');
          this.editing = false;
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
                alert(res.message);
              }
            },
            error: (err: any) => {
              console.error('Error updating user location:', err);
              alert('An error occurred while updating the use locationr.');
              this.editing = false;
            },
          });
      }
    }
  }

  onPreviousPressed() {
    localStorage.removeItem(LS_INV_SELECTED_USER);
    this.router.navigate(['/master/master-user']);
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

  onChangeLocation(selected: any) {
    const defaultLocationId = this.myForm.get('defaultLocation')?.value?.id;
    this.listDefaultLokasi = selected;
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
